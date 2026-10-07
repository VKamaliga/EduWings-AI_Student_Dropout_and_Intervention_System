const mongoose = require('mongoose');

const progressLogSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
      index: true,
    },
    studentId: {
      type: String,
      required: true,
    },
    loggedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    authorName: {
      type: String,
      default: 'Staff',
    },
    semester: {
      type: Number,
      required: true,
    },
    week: {
      type: Number,
      default: 1,
    },
    attendance: {
      type: Number,
      min: 0,
      max: 100,
    },
    cgpa: {
      type: Number,
      min: 0,
      max: 10,
    },
    engagementScore: {
      type: Number,
      min: 0,
      max: 100,
    },
    statusNote: {
      type: String,
      required: true,
    },
    flaggedConcerns: [{ type: String }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('ProgressLog', progressLogSchema);
