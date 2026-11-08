
const express = require("express");
const router = express.Router();
const Task = require("../models/Task");
const User = require("../models/User");
const Employee = require("../models/Employee");
const Activity = require("../models/Activity");
const { protect, authorize } = require("../middleware/authMiddleware");

// GET all tasks
router.get(
  "/",
  protect,
  authorize("admin", "project_manager"),
  async (req, res) => {
    try {
      const tasks = await Task.find()
        .populate("project", "projectName projectCode")
.populate("assignedTo", "name email designation")
        .sort({ createdAt: -1 });

      res.status(200).json({
        success: true,
        tasks,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);

// CREATE a task
// GET tasks assigned to logged-in employee
router.get(
  "/my-tasks",
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
          message: "Employee record not found",
        });
      }

      // Get tasks assigned to this employee
      const tasks = await Task.find({
        assignedTo: employee._id,
      })
        .populate("project", "projectName projectCode")
        .populate("assignedTo", "name email designation")
        .sort({ createdAt: -1 });

      res.status(200).json({
        success: true,
        employee,
        totalTasks: tasks.length,
        tasks,
      });
    } catch (error) {
      console.error("Employee Tasks Error:", error);

      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);
// EMPLOYEE UPDATE OWN TASK STATUS
router.put(
  "/my-tasks/:id/status",
  protect,
  authorize("employee"),
  async (req, res) => {
    try {
      const { status } = req.body;

      const allowedStatuses = [
        "To Do",
        "In Progress",
        "Completed",
      ];

      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid task status",
        });
      }

      const user = await User.findById(req.user.userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      const employee = await Employee.findOne({
        email: user.email,
      });

      if (!employee) {
        return res.status(404).json({
          success: false,
          message: "Employee not found",
        });
      }
const existingTask = await Task.findOne({
  _id: req.params.id,
  assignedTo: employee._id,
});

if (!existingTask) {
  return res.status(404).json({
    success: false,
    message: "Task not found or not assigned to you",
  });
}

const previousStatus = existingTask.status;

const task = await Task.findByIdAndUpdate(
  existingTask._id,
  { status },
  {
    new: true,
    runValidators: true,
  }
);

if (previousStatus !== status) {
  await Activity.create({
    employee: employee._id,
    title: `You updated the status of "${task.taskName}" to ${status}.`,
    type: status === "Completed" ? "success" : "info",
  });
}

     
      res.status(200).json({
        success: true,
        message: "Task status updated successfully",
        task,
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);
router.post(
  "/",
  protect,
  authorize("admin", "project_manager"),
  async (req, res) => {
    try {
      const {
        taskName,
        project,
        description,
        assignedTo,
        priority,
        dueDate,
        status,
        estimatedHours,
      } = req.body;

      const task = await Task.create({
        taskName,
        project,
        description,
        assignedTo,
        priority,
        dueDate,
        status,
        estimatedHours,
      });

      res.status(201).json({
        success: true,
        message: "Task created successfully",
        task,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);

// UPDATE a task
router.put(
  "/:id",
  protect,
  authorize("admin", "project_manager"),
  async (req, res) => {
    try {
      const task = await Task.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
          runValidators: true,
        }
      );

      if (!task) {
        return res.status(404).json({
          success: false,
          message: "Task not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Task updated successfully",
        task,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);

// DELETE a task
router.delete(
  "/:id",
  protect,
  authorize("admin", "project_manager"),
  async (req, res) => {
    try {
      const task = await Task.findByIdAndDelete(req.params.id);

      if (!task) {
        return res.status(404).json({
          success: false,
          message: "Task not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Task deleted successfully",
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