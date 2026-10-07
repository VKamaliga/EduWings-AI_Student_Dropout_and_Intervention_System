const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema(
  {
    content: { type: String, required: true },
    authorName: { type: String, default: 'Staff' },
    authorRole: { type: String, default: 'faculty' },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const interventionSchema = new mongoose.Schema(
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
    studentName: {
      type: String,
      required: true,
    },
    department: {
      type: String,
      default: '',
    },
    title: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: [
        'Counselling',
        'Academic Support',
        'Attendance Follow-up',
        'Financial Aid Referral',
        'Parent Meeting',
        'Peer Mentoring',
        'Career Guidance',
      ],
      required: true,
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Urgent'],
      default: 'Medium',
    },
    status: {
      type: String,
      enum: ['Planned', 'In Progress', 'Completed', 'Cancelled'],
      default: 'Planned',
      index: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    assignedName: {
      type: String,
      default: 'Unassigned',
    },
    scheduledDate: {
      type: Date,
      default: Date.now,
    },
    completedDate: {
      type: Date,
    },
    outcome: {
      type: String,
      enum: ['Pending', 'Improved', 'Unchanged', 'Deteriorated'],
      default: 'Pending',
    },
    // Before & after risk tracking
    initialProbability: {
      type: Number,
      default: 0,
    },
    initialRiskLevel: {
      type: String,
      default: 'Medium',
    },
    currentProbability: {
      type: Number,
      default: 0,
    },
    currentRiskLevel: {
      type: String,
      default: 'Medium',
    },
    riskDelta: {
      type: Number, // initial - current: positive means improvement
      default: 0,
    },
    notes: [noteSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Intervention', interventionSchema);
