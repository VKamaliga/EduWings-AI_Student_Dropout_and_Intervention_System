import os
import json
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.metrics import accuracy_score, roc_auc_score, classification_report
import joblib

def generate_synthetic_dataset(num_samples=1500, random_state=42):
    np.random.seed(random_state)

    attendance = np.random.normal(loc=76, scale=14, size=num_samples)
    attendance = np.clip(attendance, 35, 100)

    cgpa = np.random.normal(loc=7.1, scale=1.4, size=num_samples)
    cgpa = np.clip(cgpa, 3.2, 9.9)

    internal_marks = np.clip(cgpa * 10 + np.random.normal(0, 5, size=num_samples), 30, 98)

    # Backlogs correlated with low CGPA and attendance
    backlog_prob = np.clip(0.6 - (cgpa / 14) - (attendance / 250), 0.02, 0.85)
    backlogs = np.random.binomial(n=5, p=backlog_prob)

    assignment_rate = np.clip(attendance * 0.9 + np.random.normal(5, 8, size=num_samples), 25, 100)
    lms_engagement = np.clip(attendance * 0.85 + np.random.normal(8, 10, size=num_samples), 20, 100)

    fee_choices = [0, 1, 2] # 0: Paid, 1: Pending, 2: Overdue
    fee_probs = [0.70, 0.18, 0.12]
    fee_status = np.random.choice(fee_choices, size=num_samples, p=fee_probs)

    income_choices = [0, 1, 2, 3] # 0: <2L, 1: 2-5L, 2: 5-10L, 3: >10L
    income_probs = [0.20, 0.40, 0.28, 0.12]
    income_bracket = np.random.choice(income_choices, size=num_samples, p=income_probs)

    first_gen = np.random.binomial(n=1, p=0.35, size=num_samples)
    commute_distance = np.random.exponential(scale=10, size=num_samples) + 2
    commute_distance = np.clip(commute_distance, 2, 45)

    counselling_visits = np.random.poisson(lam=0.6, size=num_samples)
    counselling_visits = np.clip(counselling_visits, 0, 5)

    semester = np.random.randint(1, 9, size=num_samples)

    # Calculate underlying ground truth risk score (logit)
    logit = (
        -3.5
        + 0.045 * (75 - attendance)
        + 0.55 * (6.5 - cgpa)
        + 0.50 * backlogs
        + 0.025 * (70 - assignment_rate)
        + 0.025 * (65 - lms_engagement)
        + 0.65 * (fee_status == 2)
        + 0.25 * (fee_status == 1)
        + 0.015 * commute_distance
        + 0.18 * counselling_visits
        + 0.20 * (first_gen == 1)
        + np.random.normal(0, 0.35, size=num_samples)
    )

    prob = 1.0 / (1.0 + np.exp(-logit))
    # Threshold to binary dropout outcome for supervised training (~18% positive class)
    dropout = (prob > 0.48).astype(int)

    df = pd.DataFrame({
        'attendance': attendance,
        'cgpa': cgpa,
        'internal_marks': internal_marks,
        'backlog_count': backlogs,
        'assignment_submission_rate': assignment_rate,
        'lms_engagement_score': lms_engagement,
        'fee_payment_status': fee_status,
        'family_income_bracket': income_bracket,
        'first_generation_learner': first_gen,
        'commute_distance_km': commute_distance,
        'past_counselling_visits': counselling_visits,
        'semester': semester,
        'dropout': dropout,
        'ground_truth_prob': prob
    })

    return df

def train_and_save_model():
    print("🔬 Generating synthetic cohort of 1,500 students...")
    df = generate_synthetic_dataset(num_samples=1500)
    print(f"Dataset generated with {len(df)} samples. Attrition rate: {df['dropout'].mean()*100:.1f}%")

    features = [
        'attendance',
        'cgpa',
        'internal_marks',
        'backlog_count',
        'assignment_submission_rate',
        'lms_engagement_score',
        'fee_payment_status',
        'family_income_bracket',
        'first_generation_learner',
        'commute_distance_km',
        'past_counselling_visits',
        'semester'
    ]

    X = df[features]
    y = df['dropout']

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.25, random_state=42, stratify=y
    )

    print("🤖 Training Random Forest Classifier...")
    model = RandomForestClassifier(
        n_estimators=120,
        max_depth=8,
        min_samples_split=4,
        class_weight='balanced',
        random_state=42
    )
    model.fit(X_train, y_train)

    # Evaluation
    y_pred = model.predict(X_test)
    y_prob = model.predict_proba(X_test)[:, 1]

    acc = accuracy_score(y_test, y_pred)
    auc = roc_auc_score(y_test, y_prob)

    print(f"✅ Model Performance:")
    print(f"   Accuracy: {acc * 100:.2f}%")
    print(f"   ROC-AUC:  {auc:.3f}")
    print("\nClassification Report:\n", classification_report(y_test, y_pred))

    # Feature Importance
    importances = dict(zip(features, [round(float(v), 4) for v in model.feature_importances_]))
    print("📊 Top Feature Importances:")
    for k, v in sorted(importances.items(), key=lambda item: item[1], reverse=True)[:5]:
        print(f"   - {k}: {v*100:.1f}%")

    # Save artifact
    model_dir = os.path.join(os.path.dirname(__file__), 'model')
    os.makedirs(model_dir, exist_ok=True)

    model_path = os.path.join(model_dir, 'model.joblib')
    joblib.dump(model, model_path)
    print(f"💾 Model saved to: {model_path}")

    meta_path = os.path.join(model_dir, 'feature_names.json')
    with open(meta_path, 'w') as f:
        json.dump({
            'features': features,
            'importances': importances,
            'accuracy': round(float(acc), 4),
            'roc_auc': round(float(auc), 4),
            'model_type': 'RandomForestClassifier',
            'version': '1.0.0'
        }, f, indent=2)
    print(f"📄 Metadata saved to: {meta_path}")

if __name__ == '__main__':
    train_and_save_model()
