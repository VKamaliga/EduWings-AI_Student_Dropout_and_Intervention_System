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
 * Transforms student object into ML feature payload with exact units and scaling
 */
function studentToMLFeatures(student) {
  return {
    student_id: student.studentId || student.student_id || 'UNKNOWN',
    attendance: Number(student.attendance ?? 75),
    cgpa: Number(student.cgpa ?? 7.0),
    internal_marks: Number(student.internalMarks ?? student.internal_marks ?? 65),
    backlog_count: Number(student.backlogCount ?? student.backlog_count ?? 0),
    assignment_submission_rate: Number(student.assignmentSubmissionRate ?? student.assignment_submission_rate ?? 80),
    lms_engagement_score: Number(student.lmsEngagementScore ?? student.lms_engagement_score ?? 70),
    fee_payment_status: student.feePaymentStatus || student.fee_payment_status || 'Paid',
    family_income_bracket: student.familyIncomeBracket || student.family_income_bracket || '2-5L',
    first_generation_learner: Boolean(student.firstGenerationLearner ?? student.first_generation_learner ?? false),
    commute_distance_km: Number(student.commuteDistanceKm ?? student.commute_distance_km ?? 5),
    past_counselling_visits: Number(student.pastCounsellingVisits ?? student.past_counselling_visits ?? 0),
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

  console.log(`[ML Pipeline] Predicting for ${payload.student_id} | Payload:`, JSON.stringify(payload));

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000); // 10s timeout

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
      console.log(
        `[ML Pipeline] Response for ${payload.student_id}: probability=${data.dropout_probability}, riskLevel=${data.risk_level}, modelVersion=${data.model_version}`
      );

      return {
        probability: Number(data.dropout_probability.toFixed(2)),
        riskLevel: data.risk_level,
        topFactors: data.top_contributing_factors.map((f) => ({
          factor: f.factor,
          impact: Number(f.impact.toFixed(2)),
          description: f.description || '',
        })),
        suggestedInterventions: data.suggested_interventions,
        modelUsed: data.model_version || 'ML-RandomForest-v1',
        source: 'ml_model',
      };
    } else {
      console.warn(`[ML Pipeline] ML Service returned status ${res.status}. Falling back to rule engine.`);
    }
  } catch (err) {
    console.warn(`[ML Pipeline] ML service unreachable (${err.message}). Falling back to rule engine.`);
  }

  // Fallback to rule engine
  const fallback = calculateRuleBasedRisk(student, thresholds);
  return {
    ...fallback,
    modelUsed: 'RuleEngineFallback',
  };
}

/**
 * Predict risk for a batch of students.
 */
async function predictBatchStudents(students) {
  const thresholds = await getActiveThresholds();
  const payloads = students.map((s) => studentToMLFeatures(s));

  console.log(`[ML Pipeline] Batch predicting for ${payloads.length} students.`);

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

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
      console.log(`[ML Pipeline] Batch processed ${data.total_processed} students successfully.`);
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
        modelUsed: p.model_version || 'ML-RandomForest-v1',
        source: 'ml_model',
      }));
    }
  } catch (err) {
    console.warn(`[ML Pipeline] Batch ML service unreachable (${err.message}). Falling back to rule engine.`);
  }

  // Fallback to rule engine for each student
  return students.map((s) => {
    const res = calculateRuleBasedRisk(s, thresholds);
    return {
      studentId: s.studentId,
      ...res,
      modelUsed: 'RuleEngineFallback',
    };
  });
}

module.exports = {
  predictStudentRisk,
  predictBatchStudents,
  studentToMLFeatures,
  getActiveThresholds,
};
