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
python3 -m uvicorn main:app --host 0.0.0.0 --port 8000
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
- **Resilient ML Integration:** If the Python FastAPI service is offline or takes longer than **10 seconds**, the Express backend automatically falls back to an internal **Rule-Based Risk Calculation Engine**. The user experience and risk assessment workflows never crash.
- **Embedded Database Fallback (Development Only):** In development mode (`NODE_ENV != 'production'`), if an external MongoDB server is unreachable, the server spins up an embedded in-memory MongoDB engine (`MongoMemoryServer`).
- **Production Database Fail-Safe:** When `NODE_ENV === 'production'`, the in-memory fallback is strictly disabled. If the MongoDB Atlas cluster (`MONGO_URI`) is unreachable, the server logs a descriptive error and terminates immediately to prevent ephemeral data loss.
- **Role-Based Protection:** Routes are strictly authenticated via JWT and protected by role on both client and backend layers.

---

## 🌍 Production Deployment Guide

EduWings is architected for clean multi-cloud deployment:
- **Client (Frontend):** Vercel
- **Server (Backend API):** Render Web Service
- **ML Service (FastAPI):** Render Web Service
- **Database:** MongoDB Atlas (Cloud)

```text
       ┌────────────────────────┐
       │     Vercel (Client)    │
       │   React 18 + Vite SPA  │
       └───────────┬────────────┘
                   │ HTTPS (API requests)
                   ▼
       ┌────────────────────────┐
       │   Render (Server API)  │
       │   Node.js / Express    │
       └───┬────────────────┬───┘
           │                │ Internal REST (10s timeout + fallback)
           │                ▼
           │     ┌─────────────────────┐
           │     │ Render (ML Service) │
           │     │ Python FastAPI      │
           │     └─────────────────────┘
           ▼
┌───────────────────────┐
│     MongoDB Atlas     │
│   (Production DB)     │
└───────────────────────┘
```

---

### Step 1: Set Up MongoDB Atlas Database
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and create a free (M0) or dedicated cluster.
2. Under **Database Access**, create a database user with `readWriteAnyDatabase` or permissions for the `eduwings` database.
3. Under **Network Access**, add `0.0.0.0/0` (Allow Access from Anywhere) so Render dynamic IP addresses can establish database connections.
4. Click **Connect** → **Drivers** (Node.js) and copy your connection string:
   ```text
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/eduwings?retryWrites=true&w=majority
   ```

---

### Step 2: Deploy ML Service on Render
1. In the [Render Dashboard](https://dashboard.render.com), click **New +** → **Web Service**.
2. Connect your Git repository.
3. Configure the service settings:
   - **Name:** `eduwings-ml`
   - **Root Directory:** `ml-service`
   - **Environment:** `Python 3`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. In **Advanced Settings**:
   - **Health Check Path:** `/health`
5. Click **Create Web Service**. Once deployed, copy your service URL (e.g., `https://eduwings-ml.onrender.com`).
   - Test it by visiting `https://eduwings-ml.onrender.com/health` in your browser.

---

### Step 3: Deploy Backend Server on Render
1. In Render Dashboard, click **New +** → **Web Service**.
2. Connect the same Git repository.
3. Configure the service settings:
   - **Name:** `eduwings-server`
   - **Root Directory:** `server`
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start` (or `node src/server.js`)
4. In **Advanced Settings**:
   - **Health Check Path:** `/health`
5. Under **Environment Variables**, add:
   | Key | Value / Example | Description |
   | :--- | :--- | :--- |
   | `NODE_ENV` | `production` | Enables production security and disables in-memory DB fallback |
   | `MONGO_URI` | `mongodb+srv://user:pass@cluster.mongodb.net/eduwings?...` | MongoDB Atlas connection string |
   | `JWT_SECRET` | *(64-character random secure key)* | Secret for signing JWT authentication tokens |
   | `JWT_EXPIRES_IN` | `7d` | Session expiration window |
   | `CLIENT_URL` | `https://your-frontend.vercel.app` | Vercel domain for CORS protection (update after Step 4) |
   | `ML_SERVICE_URL` | `https://eduwings-ml.onrender.com` | Deployed ML Service URL from Step 2 |
6. Click **Create Web Service**.
   - The server will connect to MongoDB Atlas and auto-seed initial students and demo staff accounts if the database is fresh.
   - Once deployed, copy your API URL (e.g., `https://eduwings-server.onrender.com`).
   - Verify health at: `https://eduwings-server.onrender.com/health`.

---

### Step 4: Deploy Frontend Client on Vercel
1. Go to [Vercel](https://vercel.com) and click **Add New** → **Project**.
2. Import your Git repository.
3. Configure the project:
   - **Framework Preset:** `Vite`
   - **Root Directory:** Click **Edit** and choose `client`
   - **Build Command:** `npm run build` (or `pnpm run build`)
   - **Output Directory:** `dist`
4. Under **Environment Variables**, add:
   | Key | Value | Notes |
   | :--- | :--- | :--- |
   | `VITE_API_URL` | `https://eduwings-server.onrender.com/api` | Your deployed backend server URL ending with `/api` |
5. Click **Deploy**.
6. The included `client/vercel.json` automatically configures SPA route rewrites:
   ```json
   {
     "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
   }
   ```
7. Once deployed, copy your production Vercel URL (e.g., `https://eduwings-client.vercel.app`).
8. **Final Step:** Return to Render for `eduwings-server`, set `CLIENT_URL` to your Vercel URL (`https://eduwings-client.vercel.app`), and redeploy the backend service.

---

### Step 5: Post-Deployment Smoke Test
1. Open your Vercel URL in a browser.
2. Sign in using the 1-click Demo credentials (**Admin**, **Faculty**, or **Counsellor**).
3. Verify that student list loads, risk scores render from the ML model, and interventions can be created and saved.

---

## 📜 License
MIT License. Built for EduWings Academic Retention Systems.
