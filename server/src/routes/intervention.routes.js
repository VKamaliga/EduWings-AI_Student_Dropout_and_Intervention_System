const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const Intervention = require('../models/Intervention');
const Student = require('../models/Student');
const Notification = require('../models/Notification');
const { authenticate } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validator');

// @route   GET /api/interventions
// @desc    List interventions with optional filter by status, student, priority
router.get('/', authenticate, async (req, res) => {
  try {
    const { status, studentId, priority, assignedTo } = req.query;
    let query = {};

    // Faculty filter
    if (req.user.role === 'faculty') {
      query.department = req.user.department;
    }

    if (status && status !== 'All') {
      query.status = status;
    }

    if (priority && priority !== 'All') {
      query.priority = priority;
    }

    if (studentId) {
      query.studentId = studentId;
    }

    if (assignedTo) {
      query.assignedTo = assignedTo;
    }

    const interventions = await Intervention.find(query)
      .populate('assignedTo', 'name email role')
      .populate('student', 'studentId name department currentRisk')
      .sort({ createdAt: -1 });

    return res.json({ interventions });
  } catch (err) {
    return res.status(500).json({ message: 'Error retrieving interventions.' });
  }
});

// @route   POST /api/interventions
// @desc    Create new intervention
router.post(
  '/',
  authenticate,
  [
    body('studentId').notEmpty().withMessage('Student ID is required'),
    body('title').notEmpty().withMessage('Title is required'),
    body('type').notEmpty().withMessage('Intervention type is required'),
  ],
  validateRequest,
  async (req, res) => {
    try {
      const student = await Student.findOne({ studentId: req.body.studentId });
      if (!student) {
        return res.status(404).json({ message: `Student ${req.body.studentId} not found.` });
      }

      const intervention = new Intervention({
        student: student._id,
        studentId: student.studentId,
        studentName: student.name,
        department: student.department,
        title: req.body.title,
        type: req.body.type,
        priority: req.body.priority || 'Medium',
        status: req.body.status || 'Planned',
        assignedTo: req.body.assignedTo || req.user._id,
        assignedName: req.body.assignedName || req.user.name,
        scheduledDate: req.body.scheduledDate || new Date(),
        initialProbability: student.currentRisk.probability,
        initialRiskLevel: student.currentRisk.riskLevel,
        currentProbability: student.currentRisk.probability,
        currentRiskLevel: student.currentRisk.riskLevel,
        notes: req.body.initialNote
          ? [
              {
                content: req.body.initialNote,
                authorName: req.user.name,
                authorRole: req.user.role,
                createdAt: new Date(),
              },
            ]
          : [],
      });

      await intervention.save();

      // Notify
      await Notification.create({
        recipientRole: 'all',
        title: `New Intervention Scheduled: ${student.name}`,
        message: `${intervention.type} assigned for ${student.name} (${student.studentId}). Status: ${intervention.status}.`,
        type: 'intervention_due',
        studentId: student.studentId,
        studentName: student.name,
      });

      return res.status(201).json({ intervention });
    } catch (err) {
      console.error('Error creating intervention:', err);
      return res.status(500).json({ message: 'Failed to create intervention.' });
    }
  }
);

// @route   PUT /api/interventions/:id
// @desc    Update intervention status, outcome, or details
router.put('/:id', authenticate, async (req, res) => {
  try {
    const intervention = await Intervention.findById(req.params.id);
    if (!intervention) {
      return res.status(404).json({ message: 'Intervention not found.' });
    }

    const { status, outcome, priority, assignedTo, assignedName, scheduledDate, currentProbability } = req.body;

    if (status) intervention.status = status;
    if (outcome) intervention.outcome = outcome;
    if (priority) intervention.priority = priority;
    if (assignedTo) intervention.assignedTo = assignedTo;
    if (assignedName) intervention.assignedName = assignedName;
    if (scheduledDate) intervention.scheduledDate = scheduledDate;

    if (status === 'Completed' && !intervention.completedDate) {
      intervention.completedDate = new Date();
    }

    if (typeof currentProbability === 'number') {
      intervention.currentProbability = currentProbability;
      intervention.riskDelta = Number((intervention.initialProbability - currentProbability).toFixed(2));
      if (currentProbability < 0.35) intervention.currentRiskLevel = 'Low';
      else if (currentProbability <= 0.65) intervention.currentRiskLevel = 'Medium';
      else intervention.currentRiskLevel = 'High';
    }

    await intervention.save();
    return res.json({ intervention });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to update intervention.' });
  }
});

// @route   POST /api/interventions/:id/notes
// @desc    Add note to intervention
router.post('/:id/notes', authenticate, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Note text is required.' });
    }

    const intervention = await Intervention.findById(req.params.id);
    if (!intervention) {
      return res.status(404).json({ message: 'Intervention not found.' });
    }

    intervention.notes.push({
      content: content.trim(),
      authorName: req.user.name,
      authorRole: req.user.role,
      createdAt: new Date(),
    });

    await intervention.save();
    return res.json({ intervention });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to append note.' });
  }
});

// @route   DELETE /api/interventions/:id
// @desc    Delete intervention
router.delete('/:id', authenticate, async (req, res) => {
  try {
    await Intervention.findByIdAndDelete(req.params.id);
    return res.json({ message: 'Intervention removed.' });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to delete intervention.' });
  }
});

module.exports = router;
