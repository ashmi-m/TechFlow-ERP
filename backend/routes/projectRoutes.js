


const express = require('express');
const Project = require('../models/Project');
const User = require('../models/User');
const Employee = require('../models/Employee');
const { authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// ========================================
// GET: Retrieve all projects (Admin / PM)
// ========================================
router.get(
  '/',
  authorize('admin', 'project_manager'),
  async (req, res) => {
    try {
      const filter =
        req.user.role === 'admin'
          ? {}
          : { projectManager: req.user.userId };

      const projects = await Project.find(filter)
        .populate('projectManager', 'name email')
         .populate(
  'teamMembers',
  'name email employeeId designation status'
)
        .sort({ createdAt: -1 });

      res.status(200).json({
        success: true,
        count: projects.length,
        projects,
      });
    } catch (error) {
      console.error('Get Projects Error:', error);

      res.status(500).json({
        success: false,
        message: 'Failed to fetch projects',
      });
    }
  }
);

// ========================================
// GET: Employee's assigned projects
// ========================================
router.get(
  '/my-projects',
  authorize('employee'),
  async (req, res) => {
    try {
      // Find logged-in user
      const user = await User.findById(req.user.userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      // Find employee record using email
      const employee = await Employee.findOne({
        email: user.email,
      });

      if (!employee) {
        return res.status(404).json({
          success: false,
          message: 'Employee record not found',
        });
      }

      // Find projects assigned to this employee
      const projects = await Project.find({
        teamMembers: employee._id,
      })
        .populate('projectManager', 'name email')
        .populate('teamMembers', 'name email employeeId')
        .sort({ createdAt: -1 });

      res.status(200).json({
        success: true,
        employee,
        count: projects.length,
        projects,
      });

    } catch (error) {
      console.error('Employee Projects Error:', error);

      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);

// ========================================
// GET: Retrieve one project (Admin / PM)
// ========================================
router.get(
  '/:id',
  authorize('admin', 'project_manager'),
  async (req, res) => {
    try {
      if (!/^[0-9a-fA-F]{24}$/.test(req.params.id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid project ID',
        });
      }

      const filter = {
        _id: req.params.id,
      };

      if (req.user.role !== 'admin') {
        filter.projectManager = req.user.userId;
      }

      const project = await Project.findOne(filter)
        .populate('projectManager', 'name email')
        .populate('teamMembers', 'name email employeeId');

      if (!project) {
        return res.status(404).json({
          success: false,
          message: 'Project not found or access denied',
        });
      }

      res.status(200).json({
        success: true,
        project,
      });

    } catch (error) {
      console.error('Get Project Error:', error);

      res.status(500).json({
        success: false,
        message: 'Failed to fetch project',
      });
    }
  }
);

// ========================================
// POST: Create a project (Admin / PM)
// ========================================
router.post(
  '/',
  authorize('admin', 'project_manager'),
  async (req, res) => {
    try {
      const projectData = { ...req.body };

      if (req.user.role === 'project_manager') {
        projectData.projectManager = req.user.userId;
      }

      const project = await Project.create(projectData);

      res.status(201).json({
        success: true,
        message: 'Project created successfully',
        project,
      });

    } catch (error) {
      res.status(error.code === 11000 ? 409 : 400).json({
        success: false,
        message:
          error.code === 11000
            ? 'Project code already exists'
            : error.message,
      });
    }
  }
);

// ========================================
// PUT: Update a project (Admin / PM)
// ========================================
router.put(
  '/:id',
  authorize('admin', 'project_manager'),
  async (req, res) => {
    try {
      if (!/^[0-9a-fA-F]{24}$/.test(req.params.id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid project ID',
        });
      }

      const filter = {
        _id: req.params.id,
      };

      if (req.user.role !== 'admin') {
        filter.projectManager = req.user.userId;
      }

      const updateData = { ...req.body };

      if (req.user.role === 'project_manager') {
        delete updateData.projectManager;
      }

      const project = await Project.findOneAndUpdate(
        filter,
        updateData,
        {
          new: true,
          runValidators: true,
        }
      );

      if (!project) {
        return res.status(404).json({
          success: false,
          message: 'Project not found or access denied',
        });
      }

      res.status(200).json({
        success: true,
        message: 'Project updated successfully',
        project,
      });

    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }
);

// ========================================
// DELETE: Delete a project (Admin / PM)
// ========================================
router.delete(
  '/:id',
  authorize('admin', 'project_manager'),
  async (req, res) => {
    try {
      if (!/^[0-9a-fA-F]{24}$/.test(req.params.id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid project ID',
        });
      }

      const filter = {
        _id: req.params.id,
      };

      if (req.user.role !== 'admin') {
        filter.projectManager = req.user.userId;
      }

      const project = await Project.findOneAndDelete(filter);

      if (!project) {
        return res.status(404).json({
          success: false,
          message: 'Project not found or access denied',
        });
      }

      res.status(200).json({
        success: true,
        message: 'Project deleted successfully',
      });

    } catch (error) {
      console.error('Delete Project Error:', error);

      res.status(500).json({
        success: false,
        message: 'Failed to delete project',
      });
    }
  }
);

module.exports = router;
