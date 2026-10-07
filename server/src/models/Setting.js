const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema(
  {
    institutionName: {
      type: String,
      default: 'EduWings Institute of Technology',
    },
    academicYear: {
      type: String,
      default: '2025 – 2026',
    },
    riskThresholdLow: {
      type: Number,
      default: 35, // Below 35% is Low
      min: 10,
      max: 50,
    },
    riskThresholdHigh: {
      type: Number,
      default: 65, // Above 65% is High
      min: 50,
      max: 90,
    },
    autoNotifyHighRisk: {
      type: Boolean,
      default: true,
    },
    emailAlertsEnabled: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Setting', settingSchema);
