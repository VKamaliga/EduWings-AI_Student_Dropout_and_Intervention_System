const { RISK_THRESHOLDS, FACTOR_INTERVENTION_MAP } = require('../config/constants');

/**
 * Rule-based fallback dropout risk calculator.
 * Ensures the system operates reliably even if the ML microservice is temporarily offline.
 */
function calculateRuleBasedRisk(student, thresholds = RISK_THRESHOLDS) {
  let score = 0;
  const factors = [];

  const attendance = Number(student.attendance ?? 80);
  const cgpa = Number(student.cgpa ?? 7.0);
  const backlogs = Number(student.backlogCount ?? 0);
  const assignments = Number(student.assignmentSubmissionRate ?? 80);
  const engagement = Number(student.lmsEngagementScore ?? 75);
  const feeStatus = student.feePaymentStatus || 'Paid';
  const commute = Number(student.commuteDistanceKm ?? 5);
  const counsellingVisits = Number(student.pastCounsellingVisits ?? 0);

  // 1. Attendance impact (max 0.35)
  if (attendance < 60) {
    const impact = 0.35;
    score += impact;
    factors.push({
      factor: 'low_attendance',
      impact,
      description: `Critical attendance rate (${attendance}%). Required university threshold is 75%.`,
    });
  } else if (attendance < 75) {
    const impact = 0.20;
    score += impact;
    factors.push({
      factor: 'low_attendance',
      impact,
      description: `Attendance at ${attendance}%, approaching minimum university requirement.`,
    });
  }

  // 2. Academic CGPA impact (max 0.28)
  if (cgpa < 5.0) {
    const impact = 0.28;
    score += impact;
    factors.push({
      factor: 'declining_cgpa',
      impact,
      description: `Cumulative GPA (${cgpa.toFixed(2)}) is below satisfactory academic progress standards.`,
    });
  } else if (cgpa < 6.5) {
    const impact = 0.15;
    score += impact;
    factors.push({
      factor: 'declining_cgpa',
      impact,
      description: `CGPA (${cgpa.toFixed(2)}) shows downward vulnerability in foundational subjects.`,
    });
  }

  // 3. Backlogs impact (max 0.22)
  if (backlogs >= 3) {
    const impact = 0.22;
    score += impact;
    factors.push({
      factor: 'high_backlogs',
      impact,
      description: `${backlogs} active course backlogs pending examination clearance.`,
    });
  } else if (backlogs >= 1) {
    const impact = 0.12;
    score += impact;
    factors.push({
      factor: 'high_backlogs',
      impact,
      description: `${backlogs} active course backlog requiring exam retake support.`,
    });
  }

  // 4. Assignment submission (max 0.12)
  if (assignments < 60) {
    const impact = 0.12;
    score += impact;
    factors.push({
      factor: 'low_assignments',
      impact,
      description: `Assignment submission rate is low at ${assignments}%.`,
    });
  }

  // 5. Digital engagement LMS (max 0.10)
  if (engagement < 50) {
    const impact = 0.10;
    score += impact;
    factors.push({
      factor: 'low_engagement',
      impact,
      description: `LMS portal activity score (${engagement}%) indicates disengagement from learning resources.`,
    });
  }

  // 6. Fee payment status (max 0.10)
  if (feeStatus === 'Overdue') {
    const impact = 0.10;
    score += impact;
    factors.push({
      factor: 'fee_overdue',
      impact,
      description: 'Outstanding tuition balance flagged by bursar office.',
    });
  }

  // 7. Commute & stress (max 0.08)
  if (commute > 25) {
    const impact = 0.06;
    score += impact;
    factors.push({
      factor: 'long_commute',
      impact,
      description: `Daily travel distance (${commute} km) contributes to commute fatigue.`,
    });
  }

  // 8. Past counselling visits (max 0.07)
  if (counsellingVisits >= 3) {
    const impact = 0.07;
    score += impact;
    factors.push({
      factor: 'frequent_counselling',
      impact,
      description: `Student has made ${counsellingVisits} wellness/counselling visits this academic year.`,
    });
  }

  // Baseline calibration
  const baseRisk = 0.08;
  const probability = Math.min(0.96, Math.max(0.05, Math.round((baseRisk + score * 0.85) * 100) / 100));

  // Determine risk level based on thresholds
  const lowCutoff = (thresholds.LOW || 35) / 100;
  const highCutoff = (thresholds.HIGH || 65) / 100;

  let riskLevel = 'Low';
  if (probability >= highCutoff) {
    riskLevel = 'High';
  } else if (probability >= lowCutoff) {
    riskLevel = 'Medium';
  }

  // Sort factors by impact descending
  factors.sort((a, b) => b.impact - a.impact);
  const topFactors = factors.slice(0, 3);

  // Map to suggested interventions
  const suggestedInterventions = [];
  topFactors.forEach((f) => {
    const mapping = FACTOR_INTERVENTION_MAP[f.factor];
    if (mapping && !suggestedInterventions.includes(mapping.intervention)) {
      suggestedInterventions.push(mapping.intervention);
    }
  });

  // Ensure at least 1 supportive intervention is present if medium or high risk
  if (suggestedInterventions.length === 0) {
    if (riskLevel === 'High') {
      suggestedInterventions.push('Academic Support', 'Counselling');
    } else if (riskLevel === 'Medium') {
      suggestedInterventions.push('Peer Mentoring');
    } else {
      suggestedInterventions.push('Regular Monitoring');
    }
  }

  return {
    probability,
    riskLevel,
    topFactors: topFactors.map((f) => ({
      factor: FACTOR_INTERVENTION_MAP[f.factor]?.label || f.factor,
      impact: f.impact,
      description: f.description,
    })),
    suggestedInterventions,
    source: 'rule_engine_fallback',
  };
}

module.exports = { calculateRuleBasedRisk };
