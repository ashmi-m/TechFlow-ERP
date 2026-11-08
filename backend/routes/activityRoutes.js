const express = require("express");
const router = express.Router();

const Activity = require("../models/Activity");
const User = require("../models/User");
const Employee = require("../models/Employee");

const { protect, authorize } = require("../middleware/authMiddleware");

// GET EMPLOYEE RECENT ACTIVITIES
router.get(
  "/my-activities",
  protect,
  authorize("employee"),
  async (req, res) => {
    try {
      // Find logged-in user
      const user = await User.findById(req.user.userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // Find employee using email
      const employee = await Employee.findOne({
        email: user.email,
      });

      if (!employee) {
        return res.status(404).json({
          success: false,
          message: "Employee not found",
        });
      }

      // Fetch employee activities
      const activities = await Activity.find({
        employee: employee._id,
      })
        .sort({ createdAt: -1 })
        .limit(10);

      res.status(200).json({
        success: true,
        count: activities.length,
        activities,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);

module.exports = router;