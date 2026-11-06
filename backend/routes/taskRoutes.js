
const express = require("express");
const router = express.Router();
const Task = require("../models/Task");
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