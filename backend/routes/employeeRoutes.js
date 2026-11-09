// const express = require('express');
// const Employee = require('../models/Employee');

// const router = express.Router();

// // GET: Retrieve all employees
// router.get('/', async (req, res) => {
//   try {
//     const employees = await Employee.find().sort({
//       createdAt: -1,
//     });

//     res.status(200).json({
//       success: true,
//       count: employees.length,
//       employees,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: 'Failed to fetch employees',
//     });
//   }
// });

// // GET: Retrieve one employee by MongoDB ID
// router.get('/:id', async (req, res) => {
//   try {
//     if (!/^[0-9a-fA-F]{24}$/.test(req.params.id)) {
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid employee ID',
//       });
//     }

//     const employee = await Employee.findById(req.params.id);

//     if (!employee) {
//       return res.status(404).json({
//         success: false,
//         message: 'Employee not found',
//       });
//     }

//     res.status(200).json({
//       success: true,
//       employee,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: 'Failed to fetch employee',
//     });
//   }
// });

// // POST: Create a new employee
// router.post('/', async (req, res) => {
//   try {
//     const employee = await Employee.create(req.body);

//     res.status(201).json({
//       success: true,
//       message: 'Employee created successfully',
//       employee,
//     });
//   } catch (error) {
//     const duplicate = error.code === 11000;

//     res.status(duplicate ? 409 : 400).json({
//       success: false,
//       message: duplicate
//         ? 'Employee ID or email already exists'
//         : error.message,
//     });
//   }
// });

// // PUT: Update an employee
// router.put('/:id', async (req, res) => {
//   try {
//     if (!/^[0-9a-fA-F]{24}$/.test(req.params.id)) {
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid employee ID',
//       });
//     }

//     const employee = await Employee.findByIdAndUpdate(
//       req.params.id,
//       req.body,
//       {
//         new: true,
//         runValidators: true,
//       }
//     );

//     if (!employee) {
//       return res.status(404).json({
//         success: false,
//         message: 'Employee not found',
//       });
//     }

//     res.status(200).json({
//       success: true,
//       message: 'Employee updated successfully',
//       employee,
//     });
//   } catch (error) {
//     res.status(400).json({
//       success: false,
//       message: error.message,
//     });
//   }
// });

// // DELETE: Remove an employee
// router.delete('/:id', async (req, res) => {
//   try {
//     if (!/^[0-9a-fA-F]{24}$/.test(req.params.id)) {
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid employee ID',
//       });
//     }

//     const employee = await Employee.findByIdAndDelete(
//       req.params.id
//     );

//     if (!employee) {
//       return res.status(404).json({
//         success: false,
//         message: 'Employee not found',
//       });
//     }

//     res.status(200).json({
//       success: true,
//       message: 'Employee deleted successfully',
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: 'Failed to delete employee',
//     });
//   }
// });

// module.exports = router;

const express = require("express");
const bcrypt = require("bcryptjs");

const Employee = require("../models/Employee");
const User = require("../models/User");

const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();
// All employee routes require authentication
router.use(protect);

// GET: Retrieve all employees
router.get("/", authorize("admin", "project_manager"), async (req, res) => {
  try {
    const employees = await Employee.find().sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: employees.length,
      employees,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch employees",
    });
  }
});

// GET: Retrieve one employee
router.get("/:id", authorize("admin", "project_manager"), async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    res.status(200).json({
      success: true,
      employee,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Invalid employee ID",
    });
  }
});

// POST: Create employee AND login account
router.post("/", authorize("admin"), async (req, res) => {
  let createdUser = null;

  try {
    const {
      employeeId,
      name,
      email,
      phone,
      department,
      designation,
      joiningDate,
      password,
    } = req.body;

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

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create User login account
    createdUser = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: "employee",
    });

    // Create Employee profile
    const employee = await Employee.create({
      employeeId: employeeId.trim(),
      name: name.trim(),
      email: normalizedEmail,
      phone,
      department,
      designation,
      joiningDate: joiningDate || undefined,
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
    // Roll back User if Employee creation fails
    if (createdUser) {
      await User.findByIdAndDelete(createdUser._id);
    }

    console.error("Employee creation error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create employee",
    });
  }
});

// PUT: Update employee
router.put("/:id", authorize("admin"), async (req, res) => {
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
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

// DELETE: Remove employee and login account
router.delete("/:id", authorize("admin"), async (req, res) => {
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
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to delete employee",
    });
  }
});

module.exports = router;