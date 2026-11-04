

const express = require("express");
const mongoose = require("mongoose");
const Department = require("../models/Department");

const router = express.Router();

// GET: Fetch all departments
router.get("/", async (req, res) => {
  try {
    const departments = await Department.find().sort({ createdAt: -1 });
    res.status(200).json(departments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST: Add a new department
router.post("/", async (req, res) => {
  try {
    const { name, head, employees, status } = req.body;

    if (
  !name?.trim() ||
  !head?.trim() ||
  employees === "" ||
  (employees !== undefined &&
    (!Number.isFinite(Number(employees)) || Number(employees) < 0))
) {
  return res.status(400).json({
    message: "Please enter a valid department name, head, and employee count.",
  });
}
if (status && !["Active", "Inactive"].includes(status)) {
  return res.status(400).json({
    message: "Status must be Active or Inactive.",
  });
}

    const department = await Department.create({
      departmentId: `DEP-${Date.now()}`,
      code: `DEPT-${Date.now()}`,
      name: name.trim(),
      head: head.trim(),
      employees: Number(employees) || 0,
      status: status || "Active",
    });

    res.status(201).json({
      message: "Department added successfully.",
      department,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT: Update a department
router.put("/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid department ID." });
    }

   const { name, head, employees, status } = req.body;

if (
  !name?.trim() ||
  !head?.trim() ||
  employees === "" ||
  !Number.isFinite(Number(employees)) ||
  Number(employees) < 0
) {
  return res.status(400).json({
    message: "Please enter a valid department name, head, and employee count.",
  });
}

if (!["Active", "Inactive"].includes(status)) {
  return res.status(400).json({
    message: "Status must be Active or Inactive.",
  });
}

const department = await Department.findByIdAndUpdate(
  req.params.id,
  {
    name: name.trim(),
    head: head.trim(),
    employees: Number(eokmployees),
    status,
  },
  { new: true, runValidators: true }
);
    if (!department) {
      return res.status(404).json({ message: "Department not found." });
    }

    res.status(200).json({
      message: "Department updated successfully.",
      department,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE: Delete a department
router.delete("/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid department ID." });
    }

    const department = await Department.findByIdAndDelete(req.params.id);

    if (!department) {
      return res.status(404).json({ message: "Department not found." });
    }

    res.status(200).json({
      message: "Department deleted successfully.",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

