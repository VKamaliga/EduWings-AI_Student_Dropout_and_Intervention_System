/**
 * Prediction Consistency Test Suite
 * Validates that:
 * 1. Clearly high-risk students (e.g. S1129, S1024) score High
 * 2. Medium-risk students (e.g. S1042) score Medium
 * 3. Low-risk students (e.g. S1078) score Low
 * 4. Model version is consistently 'ML-RandomForest-v1'
 * 5. Predictions are deterministic (seed vs recalculate match)
 */

const { predictStudentRisk } = require('./src/services/mlClient');

async function runTestSuite() {
  console.log('🧪 Starting EduWings Risk Prediction Consistency Test Suite...\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, testName, details = '') {
    if (condition) {
      console.log(`  ✅ PASS: ${testName} ${details}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName} ${details}`);
      failed++;
    }
  }

  // 1. High Risk Student S1129 (Critical case from prompt)
  const studentHigh1 = {
    studentId: 'S1129',
    attendance: 55,
    cgpa: 4.82,
    internalMarks: 35,
    backlogCount: 5,
    assignmentSubmissionRate: 54,
    lmsEngagementScore: 35,
    feePaymentStatus: 'Overdue',
    familyIncomeBracket: '<2L',
    firstGenerationLearner: false,
    commuteDistanceKm: 28,
    pastCounsellingVisits: 0,
    semester: 8,
  };

  const resHigh1 = await predictStudentRisk(studentHigh1);
  assert(
    resHigh1.riskLevel === 'High' && resHigh1.probability >= 0.65,
    'S1129 (attendance 55%, CGPA 4.82, 5 backlogs) must score High',
    `[Received: ${Math.round(resHigh1.probability * 100)}% ${resHigh1.riskLevel}]`
  );
  assert(
    resHigh1.modelUsed === 'ML-RandomForest-v1',
    'S1129 modelUsed must be ML-RandomForest-v1',
    `[Received: ${resHigh1.modelUsed}]`
  );
  assert(
    resHigh1.topFactors.length > 0 && resHigh1.topFactors[0].factor === 'Multiple course backlogs',
    'S1129 top factor should dynamically reflect 5 course backlogs',
    `[Top factor: ${resHigh1.topFactors[0]?.factor} (${Math.round((resHigh1.topFactors[0]?.impact || 0) * 100)}%)]`
  );

  // 2. High Risk Student S1024
  const studentHigh2 = {
    studentId: 'S1024',
    attendance: 52,
    cgpa: 4.80,
    internalMarks: 45,
    backlogCount: 3,
    assignmentSubmissionRate: 48,
    lmsEngagementScore: 35,
    feePaymentStatus: 'Pending',
    familyIncomeBracket: '2-5L',
    firstGenerationLearner: false,
    commuteDistanceKm: 28,
    pastCounsellingVisits: 2,
    semester: 4,
  };

  const resHigh2 = await predictStudentRisk(studentHigh2);
  assert(
    resHigh2.riskLevel === 'High' && resHigh2.probability >= 0.65,
    'S1024 (attendance 52%, CGPA 4.80, 3 backlogs) must score High',
    `[Received: ${Math.round(resHigh2.probability * 100)}% ${resHigh2.riskLevel}]`
  );

  // 3. Medium Risk Student S1042
  const studentMed = {
    studentId: 'S1042',
    attendance: 68,
    cgpa: 6.20,
    internalMarks: 60,
    backlogCount: 1,
    assignmentSubmissionRate: 64,
    lmsEngagementScore: 58,
    feePaymentStatus: 'Paid',
    familyIncomeBracket: '5-10L',
    firstGenerationLearner: false,
    commuteDistanceKm: 12,
    pastCounsellingVisits: 1,
    semester: 4,
  };

  const resMed = await predictStudentRisk(studentMed);
  assert(
    resMed.riskLevel === 'Medium' && resMed.probability >= 0.35 && resMed.probability < 0.65,
    'S1042 (attendance 68%, CGPA 6.20, 1 backlog) must score Medium',
    `[Received: ${Math.round(resMed.probability * 100)}% ${resMed.riskLevel}]`
  );

  // 4. Low Risk Student S1078
  const studentLow = {
    studentId: 'S1078',
    attendance: 92,
    cgpa: 8.60,
    internalMarks: 88,
    backlogCount: 0,
    assignmentSubmissionRate: 95,
    lmsEngagementScore: 90,
    feePaymentStatus: 'Paid',
    familyIncomeBracket: '>10L',
    firstGenerationLearner: false,
    commuteDistanceKm: 4,
    pastCounsellingVisits: 0,
    semester: 4,
  };

  const resLow = await predictStudentRisk(studentLow);
  assert(
    resLow.riskLevel === 'Low' && resLow.probability < 0.35,
    'S1078 (attendance 92%, CGPA 8.60, 0 backlogs) must score Low',
    `[Received: ${Math.round(resLow.probability * 100)}% ${resLow.riskLevel}]`
  );

  // 5. Determinism test (Consecutive recalculations must match exactly)
  const resHigh1Repeat = await predictStudentRisk(studentHigh1);
  assert(
    resHigh1.probability === resHigh1Repeat.probability && resHigh1.riskLevel === resHigh1Repeat.riskLevel,
    'Deterministic inference (Recalculate with unchanged inputs matches exactly)',
    `[Run 1: ${resHigh1.probability} vs Run 2: ${resHigh1Repeat.probability}]`
  );

  console.log(`\n========================================`);
  console.log(`Results: ${passed} passed, ${failed} failed.`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTestSuite().catch((err) => {
  console.error('Test Suite encountered error:', err);
  process.exit(1);
});
