# EduWings Architecture Plan & Project Blueprint
**Tagline:** *Predict. Support. Retain.*

EduWings is an AI-powered student dropout prediction and intervention system designed for educational institutions to proactively detect students at risk of attrition, explain the driving risk factors, and coordinate targeted interventions.

---

## 1. Monorepo Folder Structure

```text
ai_student_dropout/
├── README.md
├── package.json                   # Monorepo root scripts (dev, build, seed)
├── .env.example                   # Shared env template
│
├── client/                        # React (Vite) + Tailwind CSS + Recharts + Lucide
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── .env.example
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── index.css              # Design tokens, dark/light theme variables, glassmorphism
│       ├── context/
│       │   ├── AuthContext.jsx    # Auth state, login/logout, role permissions
│       │   ├── ThemeContext.jsx   # Dark / light theme with localStorage & system preference
│       │   └── NotificationContext.jsx # Real-time alerts & reminders
│       ├── services/
│       │   └── api.js             # Centralized Axios/fetch client with JWT interceptor
│       ├── components/
│       │   ├── common/
│       │   │   ├── Navbar.jsx     # Top bar (title, search, notifications, theme, profile)
│       │   │   ├── Sidebar.jsx    # Navigation matching visual spec
│       │   │   ├── Card.jsx       # Glassmorphism container
│       │   │   ├── KpiCard.jsx    # Stats card with risk color accents
│       │   │   ├── RiskBadge.jsx  # Consistent risk pills (Low, Medium, High)
│       │   │   ├── ThemeToggle.jsx# Sun/moon toggle button
│       │   │   ├── NotificationDropdown.jsx
│       │   │   └── Modal.jsx
│       │   ├── dashboard/
│       │   │   ├── RiskDonutChart.jsx
│       │   │   ├── AtRiskStudentsTable.jsx
│       │   │   └── StudentDetailPanel.jsx
│       │   ├── students/
│       │   │   ├── StudentTable.jsx
│       │   │   ├── StudentFilterBar.jsx
│       │   │   ├── AddStudentModal.jsx
│       │   │   └── BulkUploadModal.jsx
│       │   ├── risk/
│       │   │   ├── FeatureImportanceChart.jsx
│       │   │   ├── DepartmentRiskChart.jsx
│       │   │   └── RiskTrendChart.jsx
│       │   └── interventions/
│       │       ├── InterventionCard.jsx
│       │       └── CreateInterventionModal.jsx
│       └── pages/
│           ├── Login.jsx          # Split-screen with quick demo logins & theme toggle
│           ├── Dashboard.jsx      # Matches visual mockup layout
│           ├── Students.jsx       # Directory, search, filter, CSV import, batch predict
│           ├── StudentDetail.jsx  # Gauge, risk impact bars, interventions timeline
│           ├── RiskAnalysis.jsx   # Feature importance, department breakdown, trends
│           ├── Interventions.jsx  # Kanban / list tracking (Planned, In Progress, Completed)
│           ├── Reports.jsx        # Summary reports with CSV export & printable view
│           ├── Settings.jsx       # Admin user management & risk threshold configuration
│           └── NotFound.jsx
│
├── server/                        # Node.js + Express + Mongoose + JWT
│   ├── package.json
│   ├── .env.example
│   ├── src/
│   │   ├── server.js              # Express entrypoint
│   │   ├── config/
│   │   │   ├── db.js              # MongoDB Atlas / local / embedded fallback
│   │   │   └── constants.js       # Risk thresholds and intervention mappings
│   │   ├── models/
│   │   │   ├── User.js            # Admin, Faculty, Counsellor
│   │   │   ├── Student.js         # Student profile & academic metrics
│   │   │   ├── Prediction.js      # Risk score, probability, top factors, history
│   │   │   ├── Intervention.js    # Type, assignedTo, status, outcome, riskDelta
│   │   │   ├── ProgressLog.js     # Periodic tracking logs
│   │   │   ├── Notification.js    # Alerts for high-risk flags & follow-ups
│   │   │   └── Setting.js         # Configurable system settings (thresholds)
│   │   ├── middleware/
│   │   │   ├── auth.js            # JWT verification & role authorization
│   │   │   └── validator.js       # Input payload sanitization & validation
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── student.routes.js
│   │   │   ├── prediction.routes.js
│   │   │   ├── intervention.routes.js
│   │   │   ├── report.routes.js
│   │   │   ├── notification.routes.js
│   │   │   └── setting.routes.js
│   │   ├── services/
│   │   │   ├── mlClient.js        # Calls FastAPI service with rule-based fallback
│   │   │   └── ruleEngine.js      # Resilient rule-based score calculator
│   │   └── seed/
│   │       └── seedData.js        # Seeds 200 students, demo users, interventions, alerts
│
└── ml-service/                    # Python FastAPI + scikit-learn
    ├── requirements.txt
    ├── .env.example
    ├── train.py                   # Generates 1,500 synthetic students, trains Random Forest
    ├── app.py                     # FastAPI server (/health, /predict, /predict/batch)
    ├── model/
    │   ├── model.joblib           # Trained model artifact
    │   └── feature_names.json     # Feature mappings and baseline importances
    └── test_predict.py            # Verification tests
```

---

## 2. Implementation Phases & Current Status

- [x] **Phase 1: Project Setup, Auth, Design System & Both Themes, Login Page** *(COMPLETED)*
  - Scaffold Monorepo (`/client`, `/server`, `/ml-service`).
  - Configure Tailwind CSS with dark/light mode palette matching screenshot.
  - Implement Express auth API (JWT, bcrypt, 3 demo roles: Admin, Faculty, Counsellor).
  - Implement Split-Screen Login page with 1-click Demo Role autofill and theme switcher.

- [x] **Phase 2: Students Module + Seed Data** *(COMPLETED)*
  - Define Mongoose schemas (`Student`, `User`, `Prediction`, `Intervention`, `Notification`, `Setting`).
  - Seed database with 200 realistic students, demo users, predictions, and interventions.
  - Build Students CRUD API with pagination, search, department/year/risk filtering, and CSV bulk import.

- [x] **Phase 3: ML Service + Prediction Integration with Fallback** *(COMPLETED)*
  - Build Python FastAPI ML service with synthetic dataset generator (1,500 students) and Random Forest classifier (ROC-AUC ~0.98).
  - Compute feature importance and top driving risk factors per student.
  - Connect Node/Express backend to FastAPI service (`/predict` & `/predict/batch`) with rule-based fallback if ML service is unreachable.
  - Map risk factors to suggested interventions.

- [x] **Phase 4: Dashboard, Student Detail, Risk Analysis** *(COMPLETED)*
  - Dashboard: KPI cards (Total, Low, Medium, High Risk), Recharts Donut chart, At-Risk Students table, Student Detail preview card matching the visual spec.
  - Student Detail page: Risk gauge, factor impact breakdown bars, semester progression chart, intervention timeline.
  - Risk Analysis page: Global feature importance, department risk heatmap/bars, and trend analysis.

- [x] **Phase 5: Interventions, Notifications, Reports, Settings** *(COMPLETED)*
  - Interventions manager: Lifecycle tracking (Planned, In Progress, Completed), notes logger, before/after risk delta.
  - Notifications bell dropdown for high-risk alerts and upcoming follow-ups.
  - Reports page: Summary statistics, 1-click CSV download, print-friendly layout.
  - Settings page: Manage institution users and adjust risk threshold cutoffs.

- [ ] **Phase 6: Polish, Responsiveness, README & Final Verification** *(CURRENT PHASE)*
  - Mobile responsive drawer & touch navigation.
  - Accessibility & WCAG AA contrast validation.
  - Multi-service launch verification and documentation in `README.md`.

