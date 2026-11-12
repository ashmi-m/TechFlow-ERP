const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      trim: true,
      default: '',
    },

    department: {
      type: String,
      required: true,
      trim: true,
    },

    designation: {
      type: String,
      required: true,
      trim: true,
    },
    skills: {
  type: [String],
  default: [],
},

    reportingManager: {
  type: String,
  trim: true,
  default: "",
},

employmentType: {
  type: String,
  enum: ["Full-Time", "Part-Time", "Contract", "Intern"],
  default: "Full-Time",
},

    role: {
      type: String,
      enum: ['Admin', 'Project Manager', 'Employee'],
      default: 'Employee',
    },

    status: {
      type: String,
      enum: ['Active', 'On Leave', 'Inactive'],
      default: 'Active',
    },

    joiningDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Employee', employeeSchema);