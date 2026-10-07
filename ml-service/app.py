import os
import json
import joblib
import numpy as np
import pandas as pd
from typing import List, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

app = FastAPI(
    title="EduCare ML Inference Service",
    description="Student Dropout Prediction & Explainable AI Service",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global model state
MODEL = None
METADATA = None

MODEL_DIR = os.path.join(os.path.dirname(__file__), 'model')
MODEL_PATH = os.path.join(MODEL_DIR, 'model.joblib')
META_PATH = os.path.join(MODEL_DIR, 'feature_names.json')

def load_artifacts():
    global MODEL, METADATA
    if os.path.exists(MODEL_PATH) and os.path.exists(META_PATH):
        try:
            MODEL = joblib.load(MODEL_PATH)
            with open(META_PATH, 'r') as f:
                METADATA = json.load(f)
            print(f"✅ Loaded ML model artifact and metadata (ROC-AUC: {METADATA.get('roc_auc', 'N/A')})")
        except Exception as e:
            print(f"⚠️ Error loading model: {e}")
    else:
        print("⚠️ Model artifacts not yet generated. Please run train.py first.")

@app.on_event("startup")
def startup_event():
    load_artifacts()

# Pydantic Schemas
class StudentFeatureInput(BaseModel):
    student_id: Optional[str] = "UNKNOWN"
    attendance: float = Field(..., ge=0, le=100)
    cgpa: float = Field(..., ge=0, le=10)
    internal_marks: float = Field(..., ge=0, le=100)
    backlog_count: int = Field(0, ge=0)
    assignment_submission_rate: float = Field(..., ge=0, le=100)
    lms_engagement_score: float = Field(..., ge=0, le=100)
    fee_payment_status: str = "Paid" # Paid, Pending, Overdue
    family_income_bracket: str = "2-5L" # <2L, 2-5L, 5-10L, >10L
    first_generation_learner: bool = False
    commute_distance_km: float = 5.0
    past_counselling_visits: int = 0
    semester: int = Field(1, ge=1, le=8)
    low_threshold: Optional[float] = 0.35
    high_threshold: Optional[float] = 0.65

class BatchPredictInput(BaseModel):
    students: List[StudentFeatureInput]
    low_threshold: Optional[float] = 0.35
    high_threshold: Optional[float] = 0.65

class RiskFactor(BaseModel):
    factor: str
    impact: float
    description: str

class PredictionResult(BaseModel):
    student_id: str
    dropout_probability: float
    risk_level: str
    top_contributing_factors: List[RiskFactor]
    suggested_interventions: List[str]
    model_version: str = "RandomForest-v1"

class BatchPredictionResult(BaseModel):
    predictions: List[PredictionResult]
    total_processed: int

def encode_features(item: StudentFeatureInput) -> dict:
    fee_map = {'Paid': 0, 'Pending': 1, 'Overdue': 2}
    income_map = {'<2L': 0, '2-5L': 1, '5-10L': 2, '>10L': 3}

    return {
        'attendance': float(item.attendance),
        'cgpa': float(item.cgpa),
        'internal_marks': float(item.internal_marks),
        'backlog_count': int(item.backlog_count),
        'assignment_submission_rate': float(item.assignment_submission_rate),
        'lms_engagement_score': float(item.lms_engagement_score),
        'fee_payment_status': fee_map.get(item.fee_payment_status, 0),
        'family_income_bracket': income_map.get(item.family_income_bracket, 1),
        'first_generation_learner': 1 if item.first_generation_learner else 0,
        'commute_distance_km': float(item.commute_distance_km),
        'past_counselling_visits': int(item.past_counselling_visits),
        'semester': int(item.semester),
    }

def explain_prediction(item: StudentFeatureInput, prob: float) -> tuple:
    factors = []
    interventions = []

    # Check key features against risk benchmarks
    if item.attendance < 75:
        impact = 0.35 if item.attendance < 60 else 0.20
        factors.append(RiskFactor(
            factor="Low attendance",
            impact=impact,
            description=f"Attendance at {item.attendance}%, below institutional 75% policy."
        ))
        interventions.append("Attendance follow-up")

    if item.cgpa < 6.0:
        impact = 0.28 if item.cgpa < 5.0 else 0.16
        factors.append(RiskFactor(
            factor="Declining academic performance",
            impact=impact,
            description=f"Cumulative GPA of {item.cgpa:.2f} indicates academic vulnerability."
        ))
        interventions.append("Academic support")

    if item.backlog_count >= 1:
        impact = 0.22 if item.backlog_count >= 3 else 0.12
        factors.append(RiskFactor(
            factor="Multiple course backlogs",
            impact=impact,
            description=f"{item.backlog_count} pending backlog courses requiring clearance."
        ))
        if "Academic support" not in interventions:
            interventions.append("Academic support")

    if item.lms_engagement_score < 55:
        factors.append(RiskFactor(
            factor="Low engagement",
            impact=0.14,
            description=f"LMS digital participation score ({item.lms_engagement_score}%) indicates disengagement."
        ))
        interventions.append("Peer mentoring")

    if item.fee_payment_status == "Overdue":
        factors.append(RiskFactor(
            factor="Tuition fee overdue",
            impact=0.12,
            description="Bursar office records pending balance requiring emergency aid."
        ))
        interventions.append("Financial aid referral")

    if item.commute_distance_km > 25:
        factors.append(RiskFactor(
            factor="High commute distance",
            impact=0.08,
            description=f"Daily travel distance ({item.commute_distance_km} km) induces commute fatigue."
        ))
        interventions.append("Counselling")

    if item.past_counselling_visits >= 2:
        factors.append(RiskFactor(
            factor="Prior counselling visits",
            impact=0.10,
            description=f"{item.past_counselling_visits} wellness center visits indicate ongoing personal distress."
        ))
        if "Counselling" not in interventions:
            interventions.append("Counselling")

    # If factors are empty, give baseline monitoring
    if not factors:
        factors.append(RiskFactor(
            factor="Satisfactory academic trajectory",
            impact=0.05,
            description="Student demonstrates solid attendance and benchmark grades."
        ))
        interventions.append("Regular monitoring")

    factors.sort(key=lambda x: x.impact, reverse=True)
    top_factors = factors[:3]

    if not interventions:
        interventions = ["Regular monitoring"]

    return top_factors, interventions

@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "EduCare ML Service",
        "model_loaded": MODEL is not None,
        "metadata": METADATA
    }

@app.post("/predict", response_model=PredictionResult)
def predict_single(data: StudentFeatureInput):
    global MODEL
    if MODEL is None:
        load_artifacts()

    low_th = data.low_threshold or 0.35
    high_th = data.high_threshold or 0.65

    # If model is loaded, predict with ML classifier
    if MODEL is not None:
        feat_dict = encode_features(data)
        features = METADATA['features']
        X = pd.DataFrame([feat_dict])[features]
        prob = float(MODEL.predict_proba(X)[0, 1])
    else:
        # Fallback heuristic
        prob = max(0.05, min(0.95, (100 - data.attendance) * 0.005 + (10 - data.cgpa) * 0.05 + data.backlog_count * 0.08))

    prob_rounded = round(prob, 2)

    # Determine risk level
    if prob_rounded >= high_th:
        risk_level = "High"
    elif prob_rounded >= low_th:
        risk_level = "Medium"
    else:
        risk_level = "Low"

    top_factors, suggested_interventions = explain_prediction(data, prob_rounded)

    return PredictionResult(
        student_id=data.student_id or "UNKNOWN",
        dropout_probability=prob_rounded,
        risk_level=risk_level,
        top_contributing_factors=top_factors,
        suggested_interventions=suggested_interventions,
        model_version="RandomForest-v1"
    )

@app.post("/predict/batch", response_model=BatchPredictionResult)
def predict_batch(payload: BatchPredictInput):
    results = []
    for s in payload.students:
        s.low_threshold = payload.low_threshold
        s.high_threshold = payload.high_threshold
        results.append(predict_single(s))

    return BatchPredictionResult(
        predictions=results,
        total_processed=len(results)
    )

if __name__ == '__main__':
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
