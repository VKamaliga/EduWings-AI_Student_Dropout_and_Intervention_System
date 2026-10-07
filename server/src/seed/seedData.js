const mongoose = require('mongoose');
const User = require('../models/User');
const Student = require('../models/Student');
const Prediction = require('../models/Prediction');
const Intervention = require('../models/Intervention');
const Notification = require('../models/Notification');
const Setting = require('../models/Setting');
const { calculateRuleBasedRisk } = require('../services/ruleEngine');

const DEPARTMENTS = [
  'Computer Science',
  'Electronics & Comm.',
  'Mechanical Engineering',
  'Civil Engineering',
  'Information Technology',
  'Data Science & AI',
];

const FIRST_NAMES = [
  'Aarav', 'Ananya', 'Rohan', 'Priya', 'Kavya', 'Aditya', 'Neha', 'Rahul', 'Sneha', 'Vikram',
  'Meera', 'Arjun', 'Isha', 'Dev', 'Tara', 'Karan', 'Pooja', 'Siddharth', 'Tanvi', 'Varun',
  'Shreya', 'Amit', 'Divya', 'Gaurav', 'Rhea', 'Manish', 'Simran', 'Harsh', 'Anika', 'Nikhil',
  'Sunita', 'Rajesh', 'Deepika', 'Akash', 'Shruti', 'Vishal', 'Swati', 'Pranav', 'Payal', 'Mayank',
];

const LAST_NAMES = [
  'Sharma', 'Verma', 'Patel', 'Iyer', 'Reddy', 'Gupta', 'Singh', 'Nair', 'Kulkarni', 'Joshi',
  'Chopra', 'Malhotra', 'Deshmukh', 'Mehta', 'Bose', 'Chatterjee', 'Das', 'Pandey', 'Mishra', 'Bhat',
  'Rao', 'Pillai', 'Menon', 'Saxena', 'Bhardwaj', 'Kapoor', 'Bansal', 'Agarwal', 'Thakur', 'Choudhury',
];

const seedDatabase = async () => {
  try {
    console.log('⚡ Starting database seeding...');

    // Clear existing collections
    await Promise.all([
      User.deleteMany({}),
      Student.deleteMany({}),
      Prediction.deleteMany({}),
      Intervention.deleteMany({}),
      Notification.deleteMany({}),
      Setting.deleteMany({}),
    ]);

    // 1. Seed System Settings
    const setting = await Setting.create({
      institutionName: 'EduWings Institute of Technology',
      academicYear: '2025 – 2026',
      riskThresholdLow: 35,
      riskThresholdHigh: 65,
      autoNotifyHighRisk: true,
      emailAlertsEnabled: false,
    });

    // 2. Seed Users
    const adminUser = await User.create({
      name: 'Dr. Elizabeth Warren',
      email: 'admin@eduwings.edu',
      password: 'Admin@123',
      role: 'admin',
      department: 'Academic Affairs',
      title: 'Dean of Academic Affairs',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    });

    const facultyUser = await User.create({
      name: 'Prof. Ramesh Kulkarni',
      email: 'faculty@eduwings.edu',
      password: 'Faculty@123',
      role: 'faculty',
      department: 'Computer Science',
      title: 'Associate Professor & Mentor',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    });

    const counsellorUser = await User.create({
      name: 'Dr. Sarah Jenkins',
      email: 'counsellor@eduwings.edu',
      password: 'Counsellor@123',
      role: 'counsellor',
      department: 'Student Wellness Centre',
      title: 'Chief Student Counsellor',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    });

    const mechFaculty = await User.create({
      name: 'Prof. Ananya Sen',
      email: 'mech.faculty@eduwings.edu',
      password: 'Faculty@123',
      role: 'faculty',
      department: 'Mechanical Engineering',
      title: 'Assistant Professor',
    });

    console.log('✅ Created 4 users (Admin, Faculty, Counsellor, Mech Faculty)');

    // 3. Generate 200 Students
    const studentsToInsert = [];
    const predictionsToInsert = [];
    const interventionsToInsert = [];

    // Explicit mockup students to perfectly align with UI screenshot
    const mockupStudents = [
      {
        studentId: 'S1024',
        name: 'Aarav Sharma',
        email: 'aarav.s1024@eduwings.edu',
        department: 'Computer Science',
        semester: 4,
        year: 2,
        attendance: 52,
        cgpa: 4.8,
        internalMarks: 45,
        backlogCount: 3,
        assignmentSubmissionRate: 48,
        lmsEngagementScore: 35,
        feePaymentStatus: 'Pending',
        familyIncomeBracket: '2-5L',
        commuteDistanceKm: 28,
        pastCounsellingVisits: 2,
      },
      {
        studentId: 'S1042',
        name: 'Priya Patel',
        email: 'priya.s1042@eduwings.edu',
        department: 'Computer Science',
        semester: 4,
        year: 2,
        attendance: 68,
        cgpa: 6.2,
        internalMarks: 60,
        backlogCount: 1,
        assignmentSubmissionRate: 64,
        lmsEngagementScore: 58,
        feePaymentStatus: 'Paid',
        familyIncomeBracket: '5-10L',
        commuteDistanceKm: 12,
        pastCounsellingVisits: 1,
      },
      {
        studentId: 'S1078',
        name: 'Rohan Iyer',
        email: 'rohan.s1078@eduwings.edu',
        department: 'Computer Science',
        semester: 4,
        year: 2,
        attendance: 92,
        cgpa: 8.6,
        internalMarks: 88,
        backlogCount: 0,
        assignmentSubmissionRate: 95,
        lmsEngagementScore: 90,
        feePaymentStatus: 'Paid',
        familyIncomeBracket: '>10L',
        commuteDistanceKm: 4,
        pastCounsellingVisits: 0,
      },
      {
        studentId: 'S1101',
        name: 'Kavya Reddy',
        email: 'kavya.s1101@eduwings.edu',
        department: 'Electronics & Comm.',
        semester: 6,
        year: 3,
        attendance: 45,
        cgpa: 4.2,
        internalMarks: 40,
        backlogCount: 4,
        assignmentSubmissionRate: 40,
        lmsEngagementScore: 30,
        feePaymentStatus: 'Overdue',
        familyIncomeBracket: '<2L',
        commuteDistanceKm: 34,
        pastCounsellingVisits: 3,
      },
    ];

    const allRawStudents = [...mockupStudents];

    // Generate remaining up to 200 students
    let currentId = 1102;
    for (let i = 4; i < 200; i++) {
      const fName = FIRST_NAMES[i % FIRST_NAMES.length];
      const lName = LAST_NAMES[Math.floor(i / FIRST_NAMES.length) % LAST_NAMES.length];
      const dept = DEPARTMENTS[i % DEPARTMENTS.length];
      const semester = (i % 8) + 1;
      const year = Math.ceil(semester / 2);
      const studentId = `S${currentId++}`;

      // Distribute risk realistically: ~60% low, ~25% medium, ~15% high
      const rand = Math.random();
      let attendance, cgpa, internalMarks, backlogCount, assignmentRate, lmsScore, feeStatus;

      if (rand < 0.16) {
        // High risk profile
        attendance = Math.floor(40 + Math.random() * 22); // 40 - 62%
        cgpa = Number((3.5 + Math.random() * 2.2).toFixed(2)); // 3.5 - 5.7
        internalMarks = Math.floor(35 + Math.random() * 25);
        backlogCount = Math.floor(2 + Math.random() * 4); // 2 - 5
        assignmentRate = Math.floor(35 + Math.random() * 25);
        lmsScore = Math.floor(25 + Math.random() * 30);
        feeStatus = Math.random() < 0.45 ? 'Overdue' : Math.random() < 0.3 ? 'Pending' : 'Paid';
      } else if (rand < 0.42) {
        // Medium risk profile
        attendance = Math.floor(64 + Math.random() * 14); // 64 - 78%
        cgpa = Number((5.8 + Math.random() * 1.4).toFixed(2)); // 5.8 - 7.2
        internalMarks = Math.floor(58 + Math.random() * 18);
        backlogCount = Math.random() < 0.6 ? 1 : 2;
        assignmentRate = Math.floor(60 + Math.random() * 18);
        lmsScore = Math.floor(52 + Math.random() * 22);
        feeStatus = Math.random() < 0.25 ? 'Pending' : 'Paid';
      } else {
        // Low risk profile
        attendance = Math.floor(78 + Math.random() * 21); // 78 - 99%
        cgpa = Number((7.2 + Math.random() * 2.7).toFixed(2)); // 7.2 - 9.9
        internalMarks = Math.floor(72 + Math.random() * 26);
        backlogCount = 0;
        assignmentRate = Math.floor(80 + Math.random() * 20);
        lmsScore = Math.floor(75 + Math.random() * 25);
        feeStatus = 'Paid';
      }

      allRawStudents.push({
        studentId,
        name: `${fName} ${lName}`,
        email: `${fName.toLowerCase()}.${studentId.toLowerCase()}@eduwings.edu`,
        department: dept,
        semester,
        year,
        attendance,
        cgpa: Math.min(10, cgpa),
        internalMarks,
        backlogCount,
        assignmentSubmissionRate: assignmentRate,
        lmsEngagementScore: lmsScore,
        feePaymentStatus: feeStatus,
        familyIncomeBracket: ['<2L', '2-5L', '5-10L', '>10L'][Math.floor(Math.random() * 4)],
        commuteDistanceKm: Math.floor(2 + Math.random() * 35),
        pastCounsellingVisits: Math.random() < 0.25 ? Math.floor(1 + Math.random() * 4) : 0,
      });
    }

    // Process risk and build models
    for (const raw of allRawStudents) {
      const risk = calculateRuleBasedRisk(raw);

      // S1024 explicit calibration to exactly match 78% High risk mockup
      if (raw.studentId === 'S1024') {
        risk.probability = 0.78;
        risk.riskLevel = 'High';
        risk.topFactors = [
          { factor: 'Low attendance', impact: 0.35, description: 'Attendance currently at 52% (minimum required 75%).' },
          { factor: 'Declining academic performance', impact: 0.28, description: 'CGPA dropped to 4.80 over previous two assessment cycles.' },
          { factor: 'Low digital LMS engagement', impact: 0.15, description: 'LMS access down 65% compared to peer cohort.' },
        ];
        risk.suggestedInterventions = ['Counselling', 'Academic support', 'Attendance follow-up'];
      }

      // Generate semester progression
      const progression = [];
      const currentSem = raw.semester;
      let runningCgpa = raw.cgpa;
      for (let s = 1; s <= currentSem; s++) {
        progression.push({
          semester: s,
          cgpa: Number(Math.max(3.0, Math.min(10.0, runningCgpa + (Math.random() * 0.6 - 0.3))).toFixed(2)),
          attendance: Math.max(40, Math.min(100, Math.round(raw.attendance + (Math.random() * 10 - 5)))),
          backlogs: s === currentSem ? raw.backlogCount : Math.max(0, raw.backlogCount - 1),
        });
      }

      // Generate risk history
      const riskHistory = [
        {
          date: new Date(Date.now() - 90 * 24 * 3600 * 1000),
          probability: Number(Math.max(0.05, Math.min(0.95, risk.probability - 0.08)).toFixed(2)),
          riskLevel: risk.probability - 0.08 > 0.65 ? 'High' : risk.probability - 0.08 > 0.35 ? 'Medium' : 'Low',
          semester: Math.max(1, currentSem - 1),
        },
        {
          date: new Date(Date.now() - 30 * 24 * 3600 * 1000),
          probability: Number(Math.max(0.05, Math.min(0.95, risk.probability - 0.03)).toFixed(2)),
          riskLevel: risk.probability - 0.03 > 0.65 ? 'High' : risk.probability - 0.03 > 0.35 ? 'Medium' : 'Low',
          semester: currentSem,
        },
        {
          date: new Date(),
          probability: risk.probability,
          riskLevel: risk.riskLevel,
          semester: currentSem,
        },
      ];

      studentsToInsert.push({
        ...raw,
        currentRisk: {
          probability: risk.probability,
          riskLevel: risk.riskLevel,
          topFactors: risk.topFactors,
          suggestedInterventions: risk.suggestedInterventions,
          lastPredictedAt: new Date(),
          modelUsed: 'ML-RandomForest-v1',
        },
        riskHistory,
        semesterProgression: progression,
        assignedFaculty: facultyUser._id,
        assignedCounsellor: counsellorUser._id,
      });
    }

    const insertedStudents = await Student.insertMany(studentsToInsert);
    console.log(`✅ Seeded ${insertedStudents.length} students`);

    // 4. Seed Predictions
    const studentMap = {};
    insertedStudents.forEach((s) => {
      studentMap[s.studentId] = s;
      predictionsToInsert.push({
        student: s._id,
        studentId: s.studentId,
        probability: s.currentRisk.probability,
        riskLevel: s.currentRisk.riskLevel,
        topFactors: s.currentRisk.topFactors,
        suggestedInterventions: s.currentRisk.suggestedInterventions,
        inputFeatures: {
          attendance: s.attendance,
          cgpa: s.cgpa,
          internalMarks: s.internalMarks,
          backlogCount: s.backlogCount,
          assignmentSubmissionRate: s.assignmentSubmissionRate,
          lmsEngagementScore: s.lmsEngagementScore,
          feePaymentStatus: s.feePaymentStatus,
          familyIncomeBracket: s.familyIncomeBracket,
          firstGenerationLearner: s.firstGenerationLearner,
          commuteDistanceKm: s.commuteDistanceKm,
          pastCounsellingVisits: s.pastCounsellingVisits,
          semester: s.semester,
        },
        source: 'ml_model',
      });
    });

    await Prediction.insertMany(predictionsToInsert);
    console.log(`✅ Seeded ${predictionsToInsert.length} prediction records`);

    // 5. Seed Interventions for High and Medium risk students
    const highAndMed = insertedStudents.filter(
      (s) => s.currentRisk.riskLevel === 'High' || s.currentRisk.riskLevel === 'Medium'
    );

    const statuses = ['In Progress', 'Planned', 'Completed'];
    const outcomes = ['Improved', 'Unchanged', 'Pending'];

    highAndMed.slice(0, 35).forEach((s, idx) => {
      const type = s.currentRisk.suggestedInterventions?.[0] || 'Academic Support';
      const status = statuses[idx % statuses.length];
      const outcome = status === 'Completed' ? outcomes[idx % outcomes.length] : 'Pending';
      const initialProb = s.currentRisk.probability;
      const currentProb = status === 'Completed' && outcome === 'Improved'
        ? Number(Math.max(0.18, initialProb - 0.25).toFixed(2))
        : initialProb;

      interventionsToInsert.push({
        student: s._id,
        studentId: s.studentId,
        studentName: s.name,
        department: s.department,
        title: `${type} for ${s.name}`,
        type,
        priority: s.currentRisk.riskLevel === 'High' ? 'High' : 'Medium',
        status,
        assignedTo: idx % 2 === 0 ? counsellorUser._id : facultyUser._id,
        assignedName: idx % 2 === 0 ? counsellorUser.name : facultyUser.name,
        scheduledDate: new Date(Date.now() - (idx * 2) * 24 * 3600 * 1000),
        completedDate: status === 'Completed' ? new Date() : null,
        outcome,
        initialProbability: initialProb,
        initialRiskLevel: s.currentRisk.riskLevel,
        currentProbability: currentProb,
        currentRiskLevel: currentProb < 0.35 ? 'Low' : currentProb <= 0.65 ? 'Medium' : 'High',
        riskDelta: Number((initialProb - currentProb).toFixed(2)),
        notes: [
          {
            content: `Initial outreach performed regarding ${s.currentRisk.topFactors?.[0]?.factor || 'academic trends'}. Support plan established.`,
            authorName: idx % 2 === 0 ? counsellorUser.name : facultyUser.name,
            authorRole: idx % 2 === 0 ? 'counsellor' : 'faculty',
            createdAt: new Date(Date.now() - (idx * 2) * 24 * 3600 * 1000),
          },
        ],
      });
    });

    await Intervention.insertMany(interventionsToInsert);
    console.log(`✅ Seeded ${interventionsToInsert.length} interventions`);

    // 6. Seed Notifications
    const notificationsToInsert = [
      {
        recipientRole: 'all',
        title: 'High Risk Alert: Aarav Sharma (S1024)',
        message: 'Aarav Sharma has been identified with 78% dropout probability. Attendance (52%) requires follow-up.',
        type: 'high_risk_alert',
        studentId: 'S1024',
        studentName: 'Aarav Sharma',
        read: false,
        createdAt: new Date(),
      },
      {
        recipientRole: 'all',
        title: 'High Risk Alert: Kavya Reddy (S1101)',
        message: 'Kavya Reddy has overdue tuition and 4 active backlogs. Financial aid and counselling requested.',
        type: 'high_risk_alert',
        studentId: 'S1101',
        studentName: 'Kavya Reddy',
        read: false,
        createdAt: new Date(Date.now() - 3600 * 1000 * 3),
      },
      {
        recipientRole: 'counsellor',
        title: 'Intervention Follow-up Due: Priya Patel (S1042)',
        message: 'Scheduled 1-on-1 academic advising session is due today.',
        type: 'intervention_due',
        studentId: 'S1042',
        studentName: 'Priya Patel',
        read: false,
        createdAt: new Date(Date.now() - 3600 * 1000 * 8),
      },
      {
        recipientRole: 'admin',
        title: 'System Model Assessment Complete',
        message: 'Periodic risk re-calculation processed 200 student profiles. 38 students flagged for proactive support.',
        type: 'system',
        read: true,
        createdAt: new Date(Date.now() - 3600 * 1000 * 24),
      },
    ];

    await Notification.insertMany(notificationsToInsert);
    console.log(`✅ Seeded ${notificationsToInsert.length} notifications`);
    console.log('🎉 Seeding completed successfully!');
  } catch (err) {
    console.error('❌ Error during seeding:', err);
    throw err;
  }
};

// Allow running standalone: `node src/seed/seedData.js`
if (require.main === module) {
  const { connectDB, closeDB } = require('../config/db');
  require('dotenv').config();

  connectDB()
    .then(async () => {
      await seedDatabase();
      await closeDB();
      process.exit(0);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = { seedDatabase };
