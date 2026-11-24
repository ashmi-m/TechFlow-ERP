const express = require("express");
const bcrypt = require("bcryptjs");

const Employee = require("../models/Employee");
const User = require("../models/User");

const cloudinary = require("../config/cloudinary");
const upload = require("../middleware/uploadMiddleware");

const {
  protect,
  authorize,
} = require("../middleware/authMiddleware");

const router = express.Router();

// All employee routes require authentication
router.use(protect);

// GET: Retrieve all employees
router.get(
  "/",
  authorize("admin", "project_manager"),
  async (req, res) => {

    try {
      const employees = await Employee.find().sort({
        createdAt: -1,
      });

      return res.status(200).json({
        success: true,
        count: employees.length,
        employees,
      });
    } catch (error) {
      console.error("Fetch employees error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to fetch employees",
      });
    }
  }
);

// GET: Retrieve one employee
router.get(
  "/:id",
  authorize("admin", "project_manager"),
  async (req, res) => {
    try {
      const employee = await Employee.findById(req.params.id);

      if (!employee) {
        return res.status(404).json({
          success: false,
          message: "Employee not found",
        });
      }

      return res.status(200).json({
        success: true,
        employee,
      });
    } catch (error) {
      console.error("Fetch employee error:", error);

      return res.status(400).json({
        success: false,
        message: "Invalid employee ID",
      });
    }
  }
);

// POST: Create employee AND login account
router.post(

  "/",
  authorize("admin"),
  upload.single("photo"),
  async (req, res) => {
    
      console.log("EMPLOYEE POST ROUTE HIT");
  console.log("EMPLOYEE BODY:", req.body);
  console.log("PHOTO FILE:", req.file);

    let createdUser = null;
    let uploadedPhoto = null;

    try {
      const {
        employeeId,
        name,
        email,
        phone,
        department,
        designation,
        reportingManager,
        employmentType,
        skills,
        joiningDate,
        password,
      } = req.body;

      // Validate required fields
      if (
        !employeeId ||
        !name ||
        !email ||
        !department ||
        !designation ||
        !password
      ) {
        return res.status(400).json({
          success: false,
          message: "Please provide all required fields",
        });
      }

      // Validate password
      if (password.length < 8) {
        return res.status(400).json({
          success: false,
          message: "Password must contain at least 8 characters",
        });
      }

      const normalizedEmail = email.trim().toLowerCase();

      // Check existing login account
      const existingUser = await User.findOne({
        email: normalizedEmail,
      });

      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: "This email already has a login account",
        });
      }

      // Check existing employee
      const existingEmployee = await Employee.findOne({
        $or: [
          { email: normalizedEmail },
          { employeeId: employeeId.trim() },
        ],
      });

      if (existingEmployee) {
        return res.status(409).json({
          success: false,
          message: "Employee ID or email already exists",
        });
      }

      // Upload profile photo to Cloudinary
      if (req.file) {
        uploadedPhoto = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              folder: "techflow/employees",
              resource_type: "image",
            },
            (error, result) => {
              if (error) {
                reject(error);
              } else {
                resolve(result);
              }
            }
          );

          stream.end(req.file.buffer);
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create User login account
      createdUser = await User.create({
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        role: "employee",
      });

      // Create Employee record
      const employee = await Employee.create({
        employeeId: employeeId.trim(),
        name: name.trim(),
        email: normalizedEmail,
        phone,
        department,
        designation,
        reportingManager: reportingManager || "",
        employmentType: employmentType || "Full-Time",

        skills: Array.isArray(skills)
          ? skills
          : skills
            ? skills
                .split(",")
                .map((skill) => skill.trim())
                .filter(Boolean)
            : [],

        joiningDate: joiningDate || undefined,

        // Save Cloudinary image URL
        photo: uploadedPhoto
          ? uploadedPhoto.secure_url
          : "",

        role: "Employee",
        status: "Active",
      });

      return res.status(201).json({
        success: true,
        message: "Employee and login account created successfully",
        employee,
        user: {
          id: createdUser._id,
          name: createdUser.name,
          email: createdUser.email,
          role: createdUser.role,
        },
      });
    } catch (error) {
      console.error("Employee creation error:", error);

      // Roll back User if Employee creation fails
      if (createdUser) {
        try {
          await User.findByIdAndDelete(createdUser._id);
        } catch (rollbackError) {
          console.error("User rollback error:", rollbackError);
        }
      }

      // Delete uploaded Cloudinary image if creation fails
      if (uploadedPhoto?.public_id) {
        try {
          await cloudinary.uploader.destroy(
            uploadedPhoto.public_id
          );
        } catch (cleanupError) {
          console.error(
            "Cloudinary cleanup error:",
            cleanupError
          );
        }
      }

     return res.status(500).json({
  success: false,
  message: error.message || "Unable to create employee",
});
    }
  }
);

// PUT: Update employee
router.put(
  "/:id",
  authorize("admin"),
  async (req, res) => {
    try {
      const employee = await Employee.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
          runValidators: true,
        }
      );

      if (!employee) {
        return res.status(404).json({
          success: false,
          message: "Employee not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Employee updated successfully",
        employee,
      });
    } catch (error) {
      console.error("Update employee error:", error);

      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }
);

// DELETE: Remove employee and login account
router.delete(
  "/:id",
  authorize("admin"),
  async (req, res) => {
    try {
      const employee = await Employee.findById(req.params.id);

      if (!employee) {
        return res.status(404).json({
          success: false,
          message: "Employee not found",
        });
      }

      await Employee.findByIdAndDelete(req.params.id);

      await User.findOneAndDelete({
        email: employee.email,
        role: "employee",
      });

      return res.status(200).json({
        success: true,
        message: "Employee and login account deleted successfully",
      });
    } catch (error) {
      console.error("Delete employee error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to delete employee",
      });
    }
  }
);

module.exports = router;