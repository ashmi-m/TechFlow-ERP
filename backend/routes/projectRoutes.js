const express = require('express');
const Project = require('../models/Project');

const router = express.Router();

// GET: Retrieve projects
router.get('/', async (req, res) => {
  try {
    const filter =
      req.user.role === 'admin'
        ? {}
        : { projectManager: req.user.userId };

    const projects = await Project.find(filter)
      .populate('projectManager', 'name email')
      .populate('teamMembers', 'name email employeeId')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: projects.length,
      projects,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch projects',
    });
  }
});

// GET: Retrieve one project
router.get('/:id', async (req, res) => {
  try {
    if (!/^[0-9a-fA-F]{24}$/.test(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid project ID',
      });
    }

    const filter = { _id: req.params.id };

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
    res.status(500).json({
      success: false,
      message: 'Failed to fetch project',
    });
  }
});

// POST: Create a project
router.post('/', async (req, res) => {
  try {
    const projectData = { ...req.body };

    // Project Manager can create projects only under their account
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
});

// PUT: Update a project
router.put('/:id', async (req, res) => {
  try {
    if (!/^[0-9a-fA-F]{24}$/.test(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid project ID',
      });
    }

    const filter = { _id: req.params.id };

    if (req.user.role !== 'admin') {
      filter.projectManager = req.user.userId;
    }

    const updateData = { ...req.body };

    // Project Manager cannot transfer project ownership
    if (req.user.role === 'project_manager') {
      delete updateData.projectManager;
    }

    const project = await Project.findOneAndUpdate(
      filter,
      updateData,
      { new: true, runValidators: true }
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
});

// DELETE: Delete a project
router.delete('/:id', async (req, res) => {
  try {
    if (!/^[0-9a-fA-F]{24}$/.test(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid project ID',
      });
    }

    const filter = { _id: req.params.id };

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
    res.status(500).json({
      success: false,
      message: 'Failed to delete project',
    });
  }
});

module.exports = router;