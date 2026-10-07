const express = require('express');
const router = express.Router();
const Setting = require('../models/Setting');
const { authenticate, authorizeRoles } = require('../middleware/auth');

// @route   GET /api/settings
// @desc    Get system settings (academic year, risk thresholds, institution)
router.get('/', authenticate, async (req, res) => {
  try {
    let setting = await Setting.findOne();
    if (!setting) {
      setting = await Setting.create({
        institutionName: 'EduCare Institute of Technology',
        academicYear: '2025 – 2026',
        riskThresholdLow: 35,
        riskThresholdHigh: 65,
        autoNotifyHighRisk: true,
      });
    }
    return res.json({ setting });
  } catch (err) {
    return res.status(500).json({ message: 'Error retrieving system settings.' });
  }
});

// @route   PUT /api/settings
// @desc    Update system settings (Admin only)
router.put('/', authenticate, authorizeRoles('admin'), async (req, res) => {
  try {
    const { institutionName, academicYear, riskThresholdLow, riskThresholdHigh, autoNotifyHighRisk } = req.body;

    let setting = await Setting.findOne();
    if (!setting) {
      setting = new Setting();
    }

    if (institutionName) setting.institutionName = institutionName;
    if (academicYear) setting.academicYear = academicYear;
    if (typeof riskThresholdLow === 'number') setting.riskThresholdLow = riskThresholdLow;
    if (typeof riskThresholdHigh === 'number') setting.riskThresholdHigh = riskThresholdHigh;
    if (typeof autoNotifyHighRisk === 'boolean') setting.autoNotifyHighRisk = autoNotifyHighRisk;

    await setting.save();
    return res.json({ setting, message: 'Settings saved successfully.' });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to update settings.' });
  }
});

module.exports = router;
