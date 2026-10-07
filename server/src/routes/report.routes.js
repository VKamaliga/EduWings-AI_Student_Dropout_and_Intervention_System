const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const Intervention = require('../models/Intervention');
const { authenticate } = require('../middleware/auth');

// @route   GET /api/reports/summary
// @desc    Get executive institutional summary for reporting
router.get('/summary', authenticate, async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'faculty') {
      query.department = req.user.department;
    }

    const [totalStudents, lowRisk, mediumRisk, highRisk, interventions] = await Promise.all([
      Student.countDocuments(query),
      Student.countDocuments({ ...query, 'currentRisk.riskLevel': 'Low' }),
      Student.countDocuments({ ...query, 'currentRisk.riskLevel': 'Medium' }),
      Student.countDocuments({ ...query, 'currentRisk.riskLevel': 'High' }),
      Intervention.find(query),
    ]);

    const completedInterventions = interventions.filter((i) => i.status === 'Completed');
    const improvedCount = completedInterventions.filter((i) => i.outcome === 'Improved').length;
    const successRate = completedInterventions.length ? Math.round((improvedCount / completedInterventions.length) * 100) : 0;

    // Average attendance and CGPA by risk level
    const students = await Student.find(query, 'attendance cgpa currentRisk department year');
    const avgStats = {
      overallAttendance: students.length ? Math.round(students.reduce((acc, s) => acc + s.attendance, 0) / students.length) : 0,
      overallCgpa: students.length ? Number((students.reduce((acc, s) => acc + s.cgpa, 0) / students.length).toFixed(2)) : 0,
      highRiskCount: highRisk,
      mediumRiskCount: mediumRisk,
      lowRiskCount: lowRisk,
      totalStudents,
      totalInterventions: interventions.length,
      completedInterventions: completedInterventions.length,
      successRate,
    };

    return res.json({ summary: avgStats });
  } catch (err) {
    return res.status(500).json({ message: 'Error compiling report summary.' });
  }
});

// @route   GET /api/reports/export-csv
// @desc    Export student cohort data as downloadable CSV
router.get('/export-csv', authenticate, async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'faculty') {
      query.department = req.user.department;
    }

    const students = await Student.find(query).sort({ studentId: 1 });

    const headers = [
      'Student ID',
      'Name',
      'Email',
      'Department',
      'Year',
      'Semester',
      'Attendance (%)',
      'CGPA',
      'Internal Marks',
      'Backlogs',
      'Assignment Rate (%)',
      'LMS Score (%)',
      'Fee Status',
      'Risk Level',
      'Dropout Probability (%)',
      'Primary Risk Factor',
      'Suggested Intervention',
    ];

    const rows = students.map((s) => {
      const topFactor = s.currentRisk?.topFactors?.[0]?.factor || 'None';
      const intervention = s.currentRisk?.suggestedInterventions?.[0] || 'Regular Monitoring';
      const probPct = Math.round((s.currentRisk?.probability || 0) * 100);

      return [
        `"${s.studentId}"`,
        `"${s.name}"`,
        `"${s.email}"`,
        `"${s.department}"`,
        s.year,
        s.semester,
        s.attendance,
        s.cgpa,
        s.internalMarks,
        s.backlogCount,
        s.assignmentSubmissionRate,
        s.lmsEngagementScore,
        `"${s.feePaymentStatus}"`,
        `"${s.currentRisk?.riskLevel || 'Low'}"`,
        probPct,
        `"${topFactor.replace(/"/g, '""')}"`,
        `"${intervention.replace(/"/g, '""')}"`,
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="EduWings_Student_Risk_Report_${new Date().toISOString().slice(0, 10)}.csv"`);

    return res.send(csvContent);
  } catch (err) {
    return res.status(500).json({ message: 'Error generating CSV export.' });
  }
});

module.exports = router;
