const { calculateRuleBasedRisk } = require('./ruleEngine');
const Setting = require('../models/Setting');
const { RISK_THRESHOLDS } = require('../config/constants');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://127.0.0.1:8000';

/**
 * Fetch current risk thresholds from Setting collection or default
 */
async function getActiveThresholds() {
  try {
    const setting = await Setting.findOne();
    if (setting) {
      return {
        LOW: setting.riskThresholdLow,
        MEDIUM: setting.riskThresholdHigh,
        HIGH: setting.riskThresholdHigh,
      };
    }
  } catch (err) {
    // ignore
  }
  return RISK_THRESHOLDS;
}

/**
 * Transforms student object into ML feature payload
 */
function studentToMLFeatures(student) {
  return {
    student_id: student.studentId || 'UNKNOWN',
    attendance: Number(student.attendance ?? 75),
    cgpa: Number(student.cgpa ?? 7.0),
    internal_marks: Number(student.internalMarks ?? 65),
    backlog_count: Number(student.backlogCount ?? 0),
    assignment_submission_rate: Number(student.assignmentSubmissionRate ?? 80),
    lms_engagement_score: Number(student.lmsEngagementScore ?? 70),
    fee_payment_status: student.feePaymentStatus || 'Paid',
    family_income_bracket: student.familyIncomeBracket || '2-5L',
    first_generation_learner: Boolean(student.firstGenerationLearner),
    commute_distance_km: Number(student.commuteDistanceKm ?? 5),
    past_counselling_visits: Number(student.pastCounsellingVisits ?? 0),
    semester: Number(student.semester ?? 1),
  };
}

/**
 * Predict risk for a single student.
 * Tries FastAPI ML service first; falls back to rule-based engine on failure.
 */
async function predictStudentRisk(student) {
  const thresholds = await getActiveThresholds();
  const payload = studentToMLFeatures(student);

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 1800); // 1.8s timeout

    const res = await fetch(`${ML_SERVICE_URL}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...payload,
        low_threshold: thresholds.LOW / 100,
        high_threshold: thresholds.HIGH / 100,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      return {
        probability: Number(data.dropout_probability.toFixed(2)),
        riskLevel: data.risk_level,
        topFactors: data.top_contributing_factors.map((f) => ({
          factor: f.factor,
          impact: Number(f.impact.toFixed(2)),
          description: f.description || '',
        })),
        suggestedInterventions: data.suggested_interventions,
        source: 'ml_model',
      };
    }
  } catch (err) {
    // ML service unavailable or timed out, gracefully continue to fallback
  }

  // Fallback to rule engine
  return calculateRuleBasedRisk(student, thresholds);
}

/**
 * Predict risk for a batch of students.
 */
async function predictBatchStudents(students) {
  const thresholds = await getActiveThresholds();
  const payloads = students.map((s) => studentToMLFeatures(s));

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(`${ML_SERVICE_URL}/predict/batch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        students: payloads,
        low_threshold: thresholds.LOW / 100,
        high_threshold: thresholds.HIGH / 100,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      return data.predictions.map((p) => ({
        studentId: p.student_id,
        probability: Number(p.dropout_probability.toFixed(2)),
        riskLevel: p.risk_level,
        topFactors: p.top_contributing_factors.map((f) => ({
          factor: f.factor,
          impact: Number(f.impact.toFixed(2)),
          description: f.description || '',
        })),
        suggestedInterventions: p.suggested_interventions,
        source: 'ml_model',
      }));
    }
  } catch (err) {
    // ML service unavailable, fallback
  }

  // Fallback to rule engine for each student
  return students.map((s) => {
    const res = calculateRuleBasedRisk(s, thresholds);
    return {
      studentId: s.studentId,
      ...res,
    };
  });
}

module.exports = {
  predictStudentRisk,
  predictBatchStudents,
  getActiveThresholds,
};
