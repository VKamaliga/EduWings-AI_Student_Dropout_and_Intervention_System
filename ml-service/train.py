import os
import json
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, roc_auc_score, classification_report
import joblib

def generate_synthetic_dataset(num_samples=3500, random_state=42):
    """
    Generates a realistic student cohort covering the entire spectrum:
    - High-performing / low-risk students (~60%)
    - Borderline / medium-risk students (~25%)
    - Critical / high-risk students (~15%)
    Risk is a clear, realistic function of attendance, CGPA, backlogs, engagement, fees, and socioeconomic factors.
    """
    np.random.seed(random_state)

    # Risk segment indicator: 0: high-risk (~18%), 1: medium-risk (~27%), 2: low-risk (~55%)
    segment = np.random.choice([0, 1, 2], size=num_samples, p=[0.18, 0.27, 0.55])

    # 1. Attendance (%: 0 to 100)
    attendance = np.where(
        segment == 0,
        np.random.uniform(38, 62, num_samples),
        np.where(
            segment == 1,
            np.random.uniform(62, 77, num_samples),
            np.random.uniform(77, 98, num_samples)
        )
    )

    # 2. CGPA (0.0 to 10.0)
    cgpa = np.where(
        segment == 0,
        np.random.uniform(3.2, 5.5, num_samples),
        np.where(
            segment == 1,
            np.random.uniform(5.5, 7.2, num_samples),
            np.random.uniform(7.2, 9.8, num_samples)
        )
    )

    # 3. Backlog Count (integer)
    backlogs = np.where(
        segment == 0,
        np.random.choice([2, 3, 4, 5, 6], p=[0.15, 0.30, 0.25, 0.20, 0.10], size=num_samples),
        np.where(
            segment == 1,
            np.random.choice([0, 1, 2], p=[0.35, 0.45, 0.20], size=num_samples),
            np.zeros(num_samples, dtype=int)
        )
    )

    # 4. Internal marks (%: 0 to 100)
    internal_marks = np.clip(cgpa * 10.0 + np.random.normal(0, 4.0, num_samples), 25, 98)

    # 5. Assignment submission rate (%: 0 to 100)
    assignment_rate = np.clip(attendance * 0.95 + np.random.normal(0, 5.5, num_samples), 20, 100)

    # 6. LMS engagement score (%: 0 to 100)
    lms_score = np.clip(attendance * 0.90 + np.random.normal(0, 7.5, num_samples), 15, 100)

    # 7. Fee payment status (0: Paid, 1: Pending, 2: Overdue)
    fee_status = np.where(
        segment == 0,
        np.random.choice([0, 1, 2], p=[0.20, 0.35, 0.45], size=num_samples),
        np.where(
            segment == 1,
            np.random.choice([0, 1, 2], p=[0.60, 0.30, 0.10], size=num_samples),
            np.random.choice([0, 1, 2], p=[0.90, 0.08, 0.02], size=num_samples)
        )
    )

    # 8. Family income bracket (0: <2L, 1: 2-5L, 2: 5-10L, 3: >10L)
    income = np.random.choice([0, 1, 2, 3], p=[0.20, 0.40, 0.25, 0.15], size=num_samples)

    # 9. First generation learner (0 or 1)
    first_gen = np.random.binomial(1, 0.30, size=num_samples)

    # 10. Commute distance in km (2 to 45)
    commute = np.clip(np.random.exponential(10.0, num_samples) + 2.0, 2, 45)

    # 11. Past counselling visits (0 to 5)
    counselling = np.where(
        segment == 0,
        np.random.poisson(1.5, num_samples),
        np.random.poisson(0.3, num_samples)
    )
    counselling = np.clip(counselling, 0, 5)

    # 12. Semester (1 to 8)
    semester = np.random.randint(1, 9, size=num_samples)

    # Deterministic risk logit based on core academic, behavioral & socioeconomic factors
    z_att = np.where(attendance < 75, (75 - attendance) / 14.0, (75 - attendance) / 30.0)
    z_cgpa = np.where(cgpa < 6.5, (6.5 - cgpa) / 1.1, (6.5 - cgpa) / 2.2)
    z_backlogs = backlogs * 0.65
    z_asg = (75 - assignment_rate) / 25.0 * 0.35
    z_lms = (65 - lms_score) / 25.0 * 0.35
    z_fee = np.where(fee_status == 2, 0.65, np.where(fee_status == 1, 0.30, 0.0))
    z_income = np.where(income == 0, 0.25, np.where(income == 1, 0.10, -0.10))
    z_first = first_gen * 0.15
    z_commute = np.maximum(0.0, (commute - 25.0) * 0.015)
    z_couns = counselling * 0.15

    # Ground truth logit with small stochastic variance
    logit = -2.3 + z_att + z_cgpa + z_backlogs + z_asg + z_lms + z_fee + z_income + z_first + z_commute + z_couns
    gt_prob = np.clip(1.0 / (1.0 + np.exp(-logit)), 0.04, 0.96)

    # Probabilistic Bernoulli dropout outcome
    dropout = np.random.binomial(1, gt_prob)

    df = pd.DataFrame({
        'attendance': np.round(attendance, 1),
        'cgpa': np.round(cgpa, 2),
        'internal_marks': np.round(internal_marks, 1),
        'backlog_count': backlogs.astype(int),
        'assignment_submission_rate': np.round(assignment_rate, 1),
        'lms_engagement_score': np.round(lms_score, 1),
        'fee_payment_status': fee_status.astype(int),
        'family_income_bracket': income.astype(int),
        'first_generation_learner': first_gen.astype(int),
        'commute_distance_km': np.round(commute, 1),
        'past_counselling_visits': counselling.astype(int),
        'semester': semester.astype(int),
        'dropout': dropout,
        'ground_truth_prob': np.round(gt_prob, 4)
    })

    return df

def train_and_save_model():
    print("🔬 Generating synthetic cohort of 3,500 students...")
    df = generate_synthetic_dataset(num_samples=3500)
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

    # Compute feature cohort statistics for per-student explainability
    feature_stats = {}
    for col in features:
        feature_stats[col] = {
            'mean': round(float(X[col].mean()), 2),
            'std': round(float(X[col].std()), 2),
            'median': round(float(X[col].median()), 2)
        }

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.25, random_state=42, stratify=y
    )

    print("🤖 Training Random Forest Classifier with calibrated tree depth...")
    model = RandomForestClassifier(
        n_estimators=150,
        max_depth=9,
        min_samples_leaf=6,
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
    print(f"   ROC-AUC:  {auc:.4f}")
    print("\nClassification Report:\n", classification_report(y_test, y_pred))

    # Feature Importances
    importances = dict(zip(features, [round(float(v), 4) for v in model.feature_importances_]))
    print("📊 Top Feature Importances:")
    for k, v in sorted(importances.items(), key=lambda item: item[1], reverse=True):
        print(f"   - {k}: {v*100:.2f}%")

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
            'feature_stats': feature_stats,
            'accuracy': round(float(acc), 4),
            'roc_auc': round(float(auc), 4),
            'model_type': 'RandomForestClassifier',
            'version': '1.0.0'
        }, f, indent=2)
    print(f"📄 Metadata saved to: {meta_path}")

if __name__ == '__main__':
    train_and_save_model()
