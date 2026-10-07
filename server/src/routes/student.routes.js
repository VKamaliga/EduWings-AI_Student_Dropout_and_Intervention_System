const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const Student = require('../models/Student');
const Prediction = require('../models/Prediction');
const Notification = require('../models/Notification');
const { authenticate } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validator');
const { predictStudentRisk, predictBatchStudents } = require('../services/mlClient');

// Helper to constrain query by faculty department if user is faculty
const applyRoleFilter = (req, baseQuery = {}) => {
  if (req.user && req.user.role === 'faculty') {
    return { ...baseQuery, department: req.user.department };
  }
  return baseQuery;
};

// @route   GET /api/students
// @desc    List students with search, filters, pagination, and sorting
router.get('/', authenticate, async (req, res) => {
  try {
    const {
      search = '',
      department = '',
      year = '',
      riskLevel = '',
      semester = '',
      sortBy = 'studentId',
      sortOrder = 'asc',
      page = 1,
      limit = 10,
    } = req.query;

    let query = {};

    // Role-based department constraint for Faculty
    if (req.user.role === 'faculty') {
      query.department = req.user.department;
    } else if (department && department !== 'All') {
      query.department = department;
    }

    if (search.trim()) {
      query.$or = [
        { studentId: { $regex: search.trim(), $options: 'i' } },
        { name: { $regex: search.trim(), $options: 'i' } },
        { email: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    if (year && year !== 'All') {
      query.year = Number(year);
    }

    if (semester && semester !== 'All') {
      query.semester = Number(semester);
    }

    if (riskLevel && riskLevel !== 'All') {
      query['currentRisk.riskLevel'] = riskLevel;
    }

    const sortField = sortBy === 'risk' ? 'currentRisk.probability' : sortBy;
    const sort = { [sortField]: sortOrder === 'desc' ? -1 : 1 };

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, parseInt(limit, 10));
    const skip = (pageNum - 1) * limitNum;

    const [students, total] = await Promise.all([
      Student.find(query).sort(sort).skip(skip).limit(limitNum),
      Student.countDocuments(query),
    ]);

    return res.json({
      students,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    console.error('Error fetching students:', err);
    return res.status(500).json({ message: 'Error retrieving student records.' });
  }
});

// @route   GET /api/students/:id
// @desc    Get detailed student information
router.get('/:id', authenticate, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate('assignedFaculty', 'name email department')
      .populate('assignedCounsellor', 'name email');

    if (!student) {
      return res.status(404).json({ message: 'Student record not found.' });
    }

    // Faculty can only view their own department
    if (req.user.role === 'faculty' && student.department !== req.user.department) {
      return res.status(403).json({ message: 'Access denied: student belongs to another department.' });
    }

    // Fetch past prediction logs
    const predictions = await Prediction.find({ student: student._id }).sort({ createdAt: -1 }).limit(10);

    return res.json({ student, predictions });
  } catch (err) {
    return res.status(500).json({ message: 'Error loading student details.' });
  }
});

// @route   POST /api/students
// @desc    Add a single new student and run initial prediction
router.post(
  '/',
  authenticate,
  [
    body('studentId').notEmpty().withMessage('Student ID is required'),
    body('name').notEmpty().withMessage('Student Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('department').notEmpty().withMessage('Department is required'),
    body('attendance').isFloat({ min: 0, max: 100 }).withMessage('Attendance must be 0-100%'),
    body('cgpa').isFloat({ min: 0, max: 10 }).withMessage('CGPA must be 0-10'),
  ],
  validateRequest,
  async (req, res) => {
    try {
      const existing = await Student.findOne({
        $or: [{ studentId: req.body.studentId }, { email: req.body.email.toLowerCase() }],
      });
      if (existing) {
        return res.status(400).json({ message: 'Student with this ID or Email already exists.' });
      }

      // Compute initial risk
      const riskAssessment = await predictStudentRisk(req.body);

      const student = new Student({
        ...req.body,
        email: req.body.email.toLowerCase(),
        currentRisk: {
          probability: riskAssessment.probability,
          riskLevel: riskAssessment.riskLevel,
          topFactors: riskAssessment.topFactors,
          suggestedInterventions: riskAssessment.suggestedInterventions,
          lastPredictedAt: new Date(),
          modelUsed: riskAssessment.source === 'ml_model' ? 'ML-RandomForest' : 'RuleEngineFallback',
        },
        riskHistory: [
          {
            probability: riskAssessment.probability,
            riskLevel: riskAssessment.riskLevel,
            semester: req.body.semester || 1,
            date: new Date(),
          },
        ],
        semesterProgression: [
          {
            semester: req.body.semester || 1,
            cgpa: req.body.cgpa,
            attendance: req.body.attendance,
            backlogs: req.body.backlogCount || 0,
          },
        ],
      });

      await student.save();

      // Log prediction
      await Prediction.create({
        student: student._id,
        studentId: student.studentId,
        probability: riskAssessment.probability,
        riskLevel: riskAssessment.riskLevel,
        topFactors: riskAssessment.topFactors,
        suggestedInterventions: riskAssessment.suggestedInterventions,
        inputFeatures: {
          attendance: student.attendance,
          cgpa: student.cgpa,
          internalMarks: student.internalMarks,
          backlogCount: student.backlogCount,
          assignmentSubmissionRate: student.assignmentSubmissionRate,
          lmsEngagementScore: student.lmsEngagementScore,
          feePaymentStatus: student.feePaymentStatus,
          familyIncomeBracket: student.familyIncomeBracket,
          firstGenerationLearner: student.firstGenerationLearner,
          commuteDistanceKm: student.commuteDistanceKm,
          pastCounsellingVisits: student.pastCounsellingVisits,
          semester: student.semester,
        },
        source: riskAssessment.source,
      });

      // If high risk, trigger notification
      if (riskAssessment.riskLevel === 'High') {
        await Notification.create({
          recipientRole: 'all',
          title: `High Risk Alert: ${student.name} (${student.studentId})`,
          message: `${student.name} has been assessed at ${Math.round(riskAssessment.probability * 100)}% dropout probability. Immediate intervention advised.`,
          type: 'high_risk_alert',
          studentId: student.studentId,
          studentName: student.name,
        });
      }

      return res.status(201).json({ student });
    } catch (err) {
      console.error('Error adding student:', err);
      return res.status(500).json({ message: 'Failed to create student record.' });
    }
  }
);

// @route   PUT /api/students/:id
// @desc    Update student metrics and recalculate risk
router.put('/:id', authenticate, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student record not found.' });
    }

    if (req.user.role === 'faculty' && student.department !== req.user.department) {
      return res.status(403).json({ message: 'Access denied: student belongs to another department.' });
    }

    // Merge incoming data
    Object.assign(student, req.body);

    // Recalculate risk with new metrics
    const riskAssessment = await predictStudentRisk(student);
    const prevRisk = student.currentRisk.riskLevel;

    student.currentRisk = {
      probability: riskAssessment.probability,
      riskLevel: riskAssessment.riskLevel,
      topFactors: riskAssessment.topFactors,
      suggestedInterventions: riskAssessment.suggestedInterventions,
      lastPredictedAt: new Date(),
      modelUsed: riskAssessment.source === 'ml_model' ? 'ML-RandomForest' : 'RuleEngineFallback',
    };

    student.riskHistory.push({
      probability: riskAssessment.probability,
      riskLevel: riskAssessment.riskLevel,
      semester: student.semester,
      date: new Date(),
    });

    await student.save();

    // Log prediction
    await Prediction.create({
      student: student._id,
      studentId: student.studentId,
      probability: riskAssessment.probability,
      riskLevel: riskAssessment.riskLevel,
      topFactors: riskAssessment.topFactors,
      suggestedInterventions: riskAssessment.suggestedInterventions,
      source: riskAssessment.source,
    });

    // Alert if escalated to High
    if (riskAssessment.riskLevel === 'High' && prevRisk !== 'High') {
      await Notification.create({
        recipientRole: 'all',
        title: `Risk Escalation: ${student.name} (${student.studentId})`,
        message: `${student.name}'s risk escalated to HIGH (${Math.round(riskAssessment.probability * 100)}%). Review intervention steps.`,
        type: 'high_risk_alert',
        studentId: student.studentId,
        studentName: student.name,
      });
    }

    return res.json({ student });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to update student.' });
  }
});

// @route   POST /api/students/:id/predict
// @desc    Run prediction for a specific student
router.post('/:id/predict', authenticate, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found.' });
    }

    const riskAssessment = await predictStudentRisk(student);

    student.currentRisk = {
      probability: riskAssessment.probability,
      riskLevel: riskAssessment.riskLevel,
      topFactors: riskAssessment.topFactors,
      suggestedInterventions: riskAssessment.suggestedInterventions,
      lastPredictedAt: new Date(),
      modelUsed: riskAssessment.source === 'ml_model' ? 'ML-RandomForest' : 'RuleEngineFallback',
    };

    student.riskHistory.push({
      probability: riskAssessment.probability,
      riskLevel: riskAssessment.riskLevel,
      semester: student.semester,
      date: new Date(),
    });

    await student.save();

    await Prediction.create({
      student: student._id,
      studentId: student.studentId,
      probability: riskAssessment.probability,
      riskLevel: riskAssessment.riskLevel,
      topFactors: riskAssessment.topFactors,
      suggestedInterventions: riskAssessment.suggestedInterventions,
      source: riskAssessment.source,
    });

    return res.json({
      student,
      prediction: riskAssessment,
    });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to run prediction.' });
  }
});

// @route   POST /api/students/predict-all
// @desc    Batch re-run prediction for all students
router.post('/predict-all', authenticate, async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'faculty') {
      query.department = req.user.department;
    }

    const students = await Student.find(query);
    if (!students.length) {
      return res.json({ message: 'No students found to predict.', updatedCount: 0 });
    }

    const batchResults = await predictBatchStudents(students);
    const resultMap = new Map(batchResults.map((r) => [r.studentId, r]));

    const bulkOps = [];
    const predictionDocs = [];

    students.forEach((s) => {
      const pred = resultMap.get(s.studentId);
      if (pred) {
        bulkOps.push({
          updateOne: {
            filter: { _id: s._id },
            update: {
              $set: {
                'currentRisk.probability': pred.probability,
                'currentRisk.riskLevel': pred.riskLevel,
                'currentRisk.topFactors': pred.topFactors,
                'currentRisk.suggestedInterventions': pred.suggestedInterventions,
                'currentRisk.lastPredictedAt': new Date(),
                'currentRisk.modelUsed': pred.source === 'ml_model' ? 'ML-RandomForest' : 'RuleEngineFallback',
              },
              $push: {
                riskHistory: {
                  probability: pred.probability,
                  riskLevel: pred.riskLevel,
                  semester: s.semester,
                  date: new Date(),
                },
              },
            },
          },
        });

        predictionDocs.push({
          student: s._id,
          studentId: s.studentId,
          probability: pred.probability,
          riskLevel: pred.riskLevel,
          topFactors: pred.topFactors,
          suggestedInterventions: pred.suggestedInterventions,
          source: pred.source,
        });
      }
    });

    if (bulkOps.length > 0) {
      await Student.bulkWrite(bulkOps);
      await Prediction.insertMany(predictionDocs);
    }

    return res.json({
      message: `Successfully executed batch prediction for ${bulkOps.length} students.`,
      updatedCount: bulkOps.length,
    });
  } catch (err) {
    console.error('Error in batch prediction:', err);
    return res.status(500).json({ message: 'Failed to execute batch predictions.' });
  }
});

// @route   POST /api/students/bulk
// @desc    Bulk CSV or JSON student import
router.post('/bulk', authenticate, async (req, res) => {
  try {
    const { students: rawStudents } = req.body;
    if (!Array.isArray(rawStudents) || rawStudents.length === 0) {
      return res.status(400).json({ message: 'Please provide an array of student objects.' });
    }

    const savedStudents = [];
    const errors = [];

    for (const raw of rawStudents) {
      try {
        if (!raw.studentId || !raw.name || !raw.email) {
          errors.push(`Row missing studentId, name, or email.`);
          continue;
        }

        const existing = await Student.findOne({ studentId: raw.studentId });
        if (existing) {
          errors.push(`Student ID ${raw.studentId} already exists; skipped.`);
          continue;
        }

        const risk = await predictStudentRisk(raw);

        const newStudent = new Student({
          studentId: raw.studentId,
          name: raw.name,
          email: raw.email.toLowerCase(),
          department: raw.department || 'Computer Science',
          semester: Number(raw.semester || 1),
          year: Number(raw.year || 1),
          gender: raw.gender || 'Other',
          age: Number(raw.age || 20),
          attendance: Number(raw.attendance || 75),
          cgpa: Number(raw.cgpa || 7.0),
          internalMarks: Number(raw.internalMarks || 65),
          backlogCount: Number(raw.backlogCount || 0),
          assignmentSubmissionRate: Number(raw.assignmentSubmissionRate || 75),
          lmsEngagementScore: Number(raw.lmsEngagementScore || 70),
          feePaymentStatus: raw.feePaymentStatus || 'Paid',
          familyIncomeBracket: raw.familyIncomeBracket || '2-5L',
          firstGenerationLearner: Boolean(raw.firstGenerationLearner),
          commuteDistanceKm: Number(raw.commuteDistanceKm || 5),
          pastCounsellingVisits: Number(raw.pastCounsellingVisits || 0),
          currentRisk: {
            probability: risk.probability,
            riskLevel: risk.riskLevel,
            topFactors: risk.topFactors,
            suggestedInterventions: risk.suggestedInterventions,
            lastPredictedAt: new Date(),
          },
        });

        await newStudent.save();
        savedStudents.push(newStudent);
      } catch (rowErr) {
        errors.push(`Error on student ${raw.studentId || 'unknown'}: ${rowErr.message}`);
      }
    }

    return res.json({
      message: `Imported ${savedStudents.length} students successfully.`,
      importedCount: savedStudents.length,
      errors: errors.slice(0, 10),
    });
  } catch (err) {
    return res.status(500).json({ message: 'Bulk import failed.' });
  }
});

// @route   DELETE /api/students/:id
// @desc    Delete student record (Admin only)
router.delete('/:id', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only administrators can delete student records.' });
    }
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student record not found.' });
    }
    return res.json({ message: `Student ${student.studentId} removed successfully.` });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to delete student record.' });
  }
});

module.exports = router;
