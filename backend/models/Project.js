
const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    projectName: {
      type: String,
      required: true,
      trim: true,
    },

    projectCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },

    description: {
      type: String,
      trim: true,
      default: '',
    },

    projectManager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    teamMembers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
      },
    ],

    startDate: {
      type: Date,
      required: true,
    },

    deadline: {
      type: Date,
      required: true,
    },

    priority: {
      type: String,
      enum: ['High', 'Medium', 'Low'],
      default: 'Medium',
    },

    status: {
      type: String,
      enum: ['Planning', 'In Progress', 'Completed', 'On Hold'],
      default: 'Planning',
    },

    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Project', projectSchema);