import json
import urllib.request
import urllib.error

BASE_URL = "http://127.0.0.1:8000"

def post_json(endpoint: str, data: dict) -> tuple:
    url = f"{BASE_URL}{endpoint}"
    req = urllib.request.Request(
        url,
        data=json.dumps(data).encode("utf-8"),
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req, timeout=5) as response:
        status = response.status
        body = json.loads(response.read().decode("utf-8"))
        return status, body

def get_json(endpoint: str) -> tuple:
    url = f"{BASE_URL}{endpoint}"
    with urllib.request.urlopen(url, timeout=5) as response:
        status = response.status
        body = json.loads(response.read().decode("utf-8"))
        return status, body

def run_tests():
    print("🧪 Running ML Service Validation Tests...\n")

    # 1. Health check
    try:
        status, health = get_json("/health")
        print(f"✅ Health Check [{status}]: service={health.get('service')}, model_loaded={health.get('model_loaded')}")
    except Exception as e:
        print(f"❌ Failed to reach ML service: {e}")
        return

    # 2. Critical High Risk Student (S1129)
    student_s1129 = {
        "student_id": "S1129",
        "attendance": 55.0,
        "cgpa": 4.82,
        "internal_marks": 35.0,
        "backlog_count": 5,
        "assignment_submission_rate": 54.0,
        "lms_engagement_score": 35.0,
        "fee_payment_status": "Overdue",
        "family_income_bracket": "<2L",
        "first_generation_learner": False,
        "commute_distance_km": 28.0,
        "past_counselling_visits": 0,
        "semester": 8
    }
    status, res_s1129 = post_json("/predict", student_s1129)
    prob_s1129 = res_s1129["dropout_probability"]
    level_s1129 = res_s1129["risk_level"]
    print(f"\n[Test 1] S1129 (Attendance 55%, CGPA 4.82, 5 Backlogs):")
    print(f"  Probability: {int(prob_s1129 * 100)}% | Risk Level: {level_s1129} | Version: {res_s1129['model_version']}")
    print(f"  Top Contributing Factors:")
    for f in res_s1129["top_contributing_factors"]:
        print(f"    - {f['factor']}: {int(f['impact'] * 100)}% ({f['description']})")
    assert level_s1129 == "High", f"Expected High, got {level_s1129}"
    assert res_s1129["model_version"] == "ML-RandomForest-v1"
    print("  ✅ S1129 scored High as expected!")

    # 3. Medium Risk Student (S1042)
    student_s1042 = {
        "student_id": "S1042",
        "attendance": 68.0,
        "cgpa": 6.20,
        "internal_marks": 60.0,
        "backlog_count": 1,
        "assignment_submission_rate": 64.0,
        "lms_engagement_score": 58.0,
        "fee_payment_status": "Paid",
        "family_income_bracket": "5-10L",
        "first_generation_learner": False,
        "commute_distance_km": 12.0,
        "past_counselling_visits": 1,
        "semester": 4
    }
    status, res_s1042 = post_json("/predict", student_s1042)
    prob_s1042 = res_s1042["dropout_probability"]
    level_s1042 = res_s1042["risk_level"]
    print(f"\n[Test 2] S1042 (Attendance 68%, CGPA 6.20, 1 Backlog):")
    print(f"  Probability: {int(prob_s1042 * 100)}% | Risk Level: {level_s1042}")
    assert level_s1042 == "Medium", f"Expected Medium, got {level_s1042}"
    print("  ✅ S1042 scored Medium as expected!")

    # 4. Low Risk Student (S1078)
    student_s1078 = {
        "student_id": "S1078",
        "attendance": 92.0,
        "cgpa": 8.60,
        "internal_marks": 88.0,
        "backlog_count": 0,
        "assignment_submission_rate": 95.0,
        "lms_engagement_score": 90.0,
        "fee_payment_status": "Paid",
        "family_income_bracket": ">10L",
        "first_generation_learner": False,
        "commute_distance_km": 4.0,
        "past_counselling_visits": 0,
        "semester": 4
    }
    status, res_s1078 = post_json("/predict", student_s1078)
    prob_s1078 = res_s1078["dropout_probability"]
    level_s1078 = res_s1078["risk_level"]
    print(f"\n[Test 3] S1078 (Attendance 92%, CGPA 8.60, 0 Backlogs):")
    print(f"  Probability: {int(prob_s1078 * 100)}% | Risk Level: {level_s1078}")
    assert level_s1078 == "Low", f"Expected Low, got {level_s1078}"
    print("  ✅ S1078 scored Low as expected!")

    print("\n🎉 All ML Inference validation checks passed successfully!")

if __name__ == "__main__":
    run_tests()
