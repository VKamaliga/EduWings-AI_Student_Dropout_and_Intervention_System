const mongoose = require('mongoose');

const riskFactorSchema = new mongoose.Schema(
  {
    factor: { type: String, required: true },
    impact: { type: Number, required: true }, // e.g. 0.35
    description: { type: String, default: '' },
  },
  { _id: false }
);

const semesterProgressSchema = new mongoose.Schema(
  {
    semester: { type: Number, required: true },
    cgpa: { type: Number, required: true },
    attendance: { type: Number, required: true },
    backlogs: { type: Number, default: 0 },
  },
  { _id: false }
);

const riskHistorySchema = new mongoose.Schema(
  {
    date: { type: Date, default: Date.now },
    probability: { type: Number, required: true },
    riskLevel: { type: String, enum: ['Low', 'Medium', 'High'], required: true },
    semester: { type: Number, default: 1 },
  },
  { _id: false }
);

const studentSchema = new mongoose.Schema(
  {
    studentId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
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
      default: '',
    },
    department: {
      type: String,
      required: true,
      index: true,
    },
    semester: {
      type: Number,
      required: true,
      min: 1,
      max: 8,
    },
    year: {
      type: Number,
      required: true,
      min: 1,
      max: 4,
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Non-Binary', 'Other'],
      default: 'Other',
    },
    age: {
      type: Number,
      default: 20,
    },
    // Academic features
    attendance: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    cgpa: {
      type: Number,
      required: true,
      min: 0,
      max: 10,
    },
    internalMarks: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    backlogCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    assignmentSubmissionRate: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    lmsEngagementScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    // Demographic & socioeconomic features
    feePaymentStatus: {
      type: String,
      enum: ['Paid', 'Pending', 'Overdue'],
      default: 'Paid',
    },
    familyIncomeBracket: {
      type: String,
      enum: ['<2L', '2-5L', '5-10L', '>10L'],
      default: '2-5L',
    },
    firstGenerationLearner: {
      type: Boolean,
      default: false,
    },
    commuteDistanceKm: {
      type: Number,
      default: 5,
    },
    pastCounsellingVisits: {
      type: Number,
      default: 0,
    },
    // AI Risk Assessment
    currentRisk: {
      probability: {
        type: Number,
        default: 0.15,
        min: 0,
        max: 1,
      },
      riskLevel: {
        type: String,
        enum: ['Low', 'Medium', 'High'],
        default: 'Low',
        index: true,
      },
      topFactors: [riskFactorSchema],
      suggestedInterventions: [{ type: String }],
      lastPredictedAt: {
        type: Date,
        default: Date.now,
      },
      modelUsed: {
        type: String,
        default: 'RandomForest-v1',
      },
    },
    riskHistory: [riskHistorySchema],
    semesterProgression: [semesterProgressSchema],
    assignedFaculty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    assignedCounsellor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Student', studentSchema);
