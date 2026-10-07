# EduWings — AI-Powered Student Dropout Prediction & Intervention System
> **Tagline:** *Predict. Support. Retain.*

EduWings is a production-grade full stack web platform built for higher education institutions to detect students at risk of attrition early, explain the underlying causes with machine learning, and track personalized interventions from inception to positive resolution.

---

## 🌟 Visual Preview & Design System

EduWings features an ultra-premium visual aesthetic matching modern educational SaaS platforms:

- **Dark Theme (Default, matches institutional command center spec):**
  - Deep space indigo-violet gradient background (`#0D0822` → `#150E34`)
  - Glassmorphic translucent cards with 1px soft purple borders (`rgba(168, 85, 247, 0.22)`) and ambient glow
  - Primary purple gradient (`#7C3AED` → `#A855F7`) and accent pink (`#EC4899`)
  - **Standardized Risk Badges & Colors:**
    - 🟢 **Low Risk:** Soft Mint / Sage Green (`#34D399`)
    - 🟡 **Medium Risk:** Peach / Amber (`#FBBF24`)
    - 🔴 **High Risk:** Pink / Magenta (`#EC4899`)
- **Light Theme:**
  - Crisp white surfaces (`#FFFFFF`) with soft lavender accents (`#F8F7FD`), thin lavender borders (`#E5E0F8`), and high WCAG AA contrast.
  - Theme toggler with automatic `prefers-color-scheme` support and `localStorage` persistence with zero flash on reload.

---

## 🏛️ System Architecture

```text
ai_student_dropout/
├── client/                 # React 18 + Vite + Tailwind CSS + Recharts + Lucide
│   ├── src/
│   │   ├── components/     # Cards, KpiCards, RiskBadges, Charts, Modals, Navbars
│   │   ├── context/        # AuthContext, ThemeContext, NotificationContext
│   │   ├── pages/          # Login, Dashboard, Students, StudentDetail, RiskAnalysis,
│   │   │                   # Interventions, Reports, Settings
│   │   └── services/       # Centralized API client with JWT interceptor
├── server/                 # Node.js + Express + Mongoose + JWT + Embedded Mongo Fallback
│   ├── src/
│   │   ├── config/         # Database connector & Risk constants
│   │   ├── middleware/     # JWT authentication & role-based access control
│   │   ├── models/         # User, Student, Prediction, Intervention, Notification, Setting
│   │   ├── routes/         # Auth, Students, Predictions, Interventions, Reports, Settings
│   │   ├── services/       # ML client with transparent rule-based fallback engine
│   │   └── seed/           # Seed script (200 students, demo users, interventions, alerts)
├── ml-service/             # Python FastAPI + scikit-learn + Pandas + NumPy
│   ├── app.py              # FastAPI server (/health, /predict, /predict/batch)
│   ├── train.py            # Generates 1,500 synthetic students, trains Random Forest model
│   ├── model/              # Serialized model.joblib and feature importances
│   └── requirements.txt    # Python dependencies
├── package.json            # Monorepo scripts
└── PLAN.md                 # Architecture blueprint and phased development log
```

---

## 🚀 Key Features

### 1. Split-Screen Login & 1-Click Demo Access
- **Brand Panel:** Headline *"Support every student before they slip away."*, subline, and 3 feature chips (*Early detection*, *Explainable risk*, *Timely intervention*).
- **Demo Access Chips:** Instant 1-click credential auto-fill for:
  - **Administrator:** `admin@eduwings.edu` / `Admin@123` (Full institutional control)
  - **Faculty Mentor:** `faculty@eduwings.edu` / `Faculty@123` (Computer Science cohort)
  - **Student Counsellor:** `counsellor@eduwings.edu` / `Counsellor@123` (Cross-department at-risk support)

### 2. Executive Student Risk Dashboard
- **4 KPI Metric Cards:** Total Students (200), Low Risk, Medium Risk, High Risk with percentages and color-coded icons.
- **Risk Distribution Donut Chart:** Interactive Recharts ring with legend breakdown.
- **At-Risk Students Table:** Quick list of flagged students with one-click preview inspection.
- **Active Student Detail Panel:** Matches mockup screenshot showing Student ID (`S1024`), Dropout Probability (`78%`), Risk Factors, and Suggested Interventions.

### 3. Students Cohort Directory
- Search across Student ID, Name, and Email.
- Filter by Academic Department, Year (1–4), and Risk Level (Low/Medium/High).
- Sortable table by risk probability, attendance, CGPA, or student ID.
- **Batch AI Prediction:** Run inference across all students simultaneously.
- **Add Student Modal:** Real-time scoring upon registration.
- **Bulk CSV Import:** Upload or paste cohorts for automatic batch ingestion.

### 4. Student Deep-Dive File
- **Semi-Circular Dropout Probability Gauge** with model version and confidence metrics.
- **Driving Risk Factors & Impact Breakdown Bars** explaining feature weights.
- **Recommended Action Plans** directly mapped to student needs.
- **Semester Progression Chart** displaying longitudinal CGPA and Attendance trajectories.
- **Intervention History Timeline** with case notes and recorded milestones.

### 5. Explainable AI Risk Analysis
- **Global Feature Importance Chart:** Displays model decision attribution (Attendance 30.1%, Assignment submission 22.9%, LMS engagement 19.3%, CGPA 11.6%, Backlogs 6.1%).
- **Department Risk Breakdown:** Stacked bar chart showing risk distribution across engineering and science divisions.
- **6-Month Longitudinal Risk Trajectory:** Visualizes cohort risk reduction following proactive intervention.

### 6. Intervention Tracking & Action Plans
- Track interventions across their full lifecycle: **Planned → In Progress → Completed**.
- **Before & After Risk Comparison:** Compares initial dropout probability against post-intervention scores (e.g., `-26% Risk`).
- Log case notes with author attribution and timestamping.

### 7. Institutional Retention Reports
- Executive retention summary with institutional compliance certificate.
- Download full cohort report as **CSV file** with one click.
- **Printable Report View** optimized for committee meetings and audits.

### 8. System & Risk Threshold Settings
- Configurable **Low Risk Ceiling** (< 35%) and **High Risk Floor** (> 65%).
- User and staff account manager with role-based access toggles.

---

## 🛠️ Getting Started

### Prerequisites
- Node.js (v18+)
- Python (v3.9+)
- MongoDB (Optional: The backend automatically spins up an in-memory MongoDB instance if local MongoDB is not running!)

---

### Step 1: Install Dependencies

#### 1. Server Dependencies
```bash
cd server
npm install
```

#### 2. Client Dependencies
```bash
cd ../client
pnpm install # or npm install
```

#### 3. Python ML Dependencies
```bash
cd ../ml-service
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

---

### Step 2: Train the ML Model
Generate the synthetic dataset (1,500 students) and train the Random Forest classifier:
```bash
cd ml-service
python3 train.py
```
*(This produces `model/model.joblib` and `model/feature_names.json` with an AUC > 0.98).*

---

### Step 3: Run the Application Services

You can run each service in separate terminal windows:

#### Terminal 1: Python FastAPI ML Service
```bash
cd ml-service
source venv/bin/activate
python3 -m uvicorn app:app --host 0.0.0.0 --port 8000
```
*Running on: `http://localhost:8000` (Docs: `http://localhost:8000/docs`)*

#### Terminal 2: Node.js Express Backend
```bash
cd server
npm start
```
*Running on: `http://localhost:5001` (Auto-seeds 200 sample students on first start).*

#### Terminal 3: React Vite Client
```bash
cd client
pnpm run dev # or npm run dev
```
*Running on: `http://localhost:5173`*

---

### Step 4: Access the Web App
Open your browser to:
👉 **[http://localhost:5173](http://localhost:5173)**

Click any **Quick Demo Access** button on the login screen to explore as **Admin**, **Faculty**, or **Counsellor**!

---

## 🛡️ Robustness & Fallback Guarantees
- **Resilient ML Integration:** If the Python FastAPI service is offline or unreachable, the Express backend automatically falls back to an internal **Rule-Based Risk Calculation Engine**. The user experience and risk assessment workflows never crash.
- **Embedded Database Fallback:** If an external MongoDB server is not configured or offline, the server automatically starts an embedded in-memory MongoDB engine seamlessly.
- **Role-Based Protection:** Routes are strictly authenticated and protected by role on both client and backend layers.

---

## 📜 License
MIT License. Built for EduWings Academic Retention Systems.
