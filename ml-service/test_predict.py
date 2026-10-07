import requests
import json

def test_endpoints():
    base_url = "http://127.0.0.1:8000"
    
    # 1. Health
    try:
        r = requests.get(f"{base_url}/health", timeout=3)
        print("Health Check:", r.status_code, r.json().get("status"))
    except Exception as e:
        print("Service not running yet:", e)
        return

    # 2. Predict High Risk Student (e.g. S1024)
    sample_student = {
        "student_id": "S1024",
        "attendance": 52.0,
        "cgpa": 4.8,
        "internal_marks": 45.0,
        "backlog_count": 3,
        "assignment_submission_rate": 48.0,
        "lms_engagement_score": 35.0,
        "fee_payment_status": "Pending",
        "family_income_bracket": "2-5L",
        "first_generation_learner": False,
        "commute_distance_km": 28.0,
        "past_counselling_visits": 2,
        "semester": 4,
        "low_threshold": 0.35,
        "high_threshold": 0.65
    }

    r = requests.post(f"{base_url}/predict", json=sample_student)
    print("\nPredict S1024:", r.status_code)
    data = r.json()
    print(f"Probability: {data['dropout_probability'] * 100}% | Risk Level: {data['risk_level']}")
    print("Top Factors:", [f['factor'] for f in data['top_contributing_factors']])
    print("Suggested Interventions:", data['suggested_interventions'])

    # 3. Predict Low Risk Student (e.g. S1078)
    sample_low = {
        "student_id": "S1078",
        "attendance": 92.0,
        "cgpa": 8.6,
        "internal_marks": 88.0,
        "backlog_count": 0,
        "assignment_submission_rate": 95.0,
        "lms_engagement_score": 90.0,
        "fee_payment_status": "Paid",
        "family_income_bracket": ">10L",
        "first_generation_learner": False,
        "commute_distance_km": 4.0,
        "past_counselling_visits": 0,
        "semester": 4,
        "low_threshold": 0.35,
        "high_threshold": 0.65
    }

    r_low = requests.post(f"{base_url}/predict", json=sample_low)
    print("\nPredict S1078:", r_low.status_code)
    data_low = r_low.json()
    print(f"Probability: {data_low['dropout_probability'] * 100}% | Risk Level: {data_low['risk_level']}")

if __name__ == '__main__':
    test_endpoints()
