const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const { connectDB } = require('./config/db');
const authRoutes = require('./routes/auth.routes');
const studentRoutes = require('./routes/student.routes');
const predictionRoutes = require('./routes/prediction.routes');
const interventionRoutes = require('./routes/intervention.routes');
const notificationRoutes = require('./routes/notification.routes');
const settingRoutes = require('./routes/setting.routes');
const reportRoutes = require('./routes/report.routes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/predictions', predictionRoutes);
app.use('/api/interventions', interventionRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/settings', settingRoutes);
app.use('/api/reports', reportRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    system: 'EduWings Backend Service',
    time: new Date().toISOString(),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: `Endpoint ${req.originalUrl} not found.` });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error occurred.',
  });
});

// Bootstrap server
const startServer = async () => {
  try {
    await connectDB();

    // Auto-seed if database is empty on first boot
    const Student = require('./models/Student');
    const studentCount = await Student.countDocuments();
    if (studentCount === 0) {
      console.log('🌱 No students found in database. Initializing automated seed...');
      const { seedDatabase } = require('./seed/seedData');
      await seedDatabase();
    }

    app.listen(PORT, () => {
      console.log(`🚀 EduWings API Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to initialize server:', err);
    process.exit(1);
  }
};

startServer();

module.exports = app;
