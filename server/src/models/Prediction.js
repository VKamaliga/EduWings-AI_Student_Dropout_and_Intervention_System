const mongoose = require('mongoose');

const predictionSchema = new mongoose.Schema(
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
    probability: {
      type: Number,
      required: true,
    },
    riskLevel: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      required: true,
    },
    topFactors: [
      {
        factor: String,
        impact: Number,
        description: String,
      },
    ],
    suggestedInterventions: [String],
    inputFeatures: {
      attendance: Number,
      cgpa: Number,
      internalMarks: Number,
      backlogCount: Number,
      assignmentSubmissionRate: Number,
      lmsEngagementScore: Number,
      feePaymentStatus: String,
      familyIncomeBracket: String,
      firstGenerationLearner: Boolean,
      commuteDistanceKm: Number,
      pastCounsellingVisits: Number,
      semester: Number,
    },
    source: {
      type: String,
      enum: ['ml_model', 'rule_engine_fallback'],
      default: 'ml_model',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Prediction', predictionSchema);
