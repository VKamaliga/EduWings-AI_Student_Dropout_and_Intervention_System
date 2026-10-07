import React, { useState, useEffect } from 'react';
import { Users, ShieldCheck, AlertCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import KpiCard from '../components/common/KpiCard';
import RiskDonutChart from '../components/dashboard/RiskDonutChart';
import AtRiskStudentsTable from '../components/dashboard/AtRiskStudentsTable';
import StudentDetailPanel from '../components/dashboard/StudentDetailPanel';
import api from '../services/api';

export default function Dashboard() {
  const [stats, setStats] = useState({
    total: 0,
    low: { count: 0, percentage: 0 },
    medium: { count: 0, percentage: 0 },
    high: { count: 0, percentage: 0 },
  });
  const [distribution, setDistribution] = useState([]);
  const [atRiskStudents, setAtRiskStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboardData = async () => {
    try {
      const [statsRes, distRes, studentsRes] = await Promise.all([
        api.get('/predictions/stats'),
        api.get('/predictions/distribution'),
        api.get('/students?limit=15&sortBy=risk&sortOrder=desc'),
      ]);

      setStats(statsRes);
      setDistribution(distRes.distribution || []);

      const students = studentsRes.students || [];
      setAtRiskStudents(students);

      // Default selected student: look for S1024 first (matches mockup) or the first student
      const mockupDefault = students.find((s) => s.studentId === 'S1024') || students[0];
      setSelectedStudent(mockupDefault || null);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards Row (Matching mockup top row) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <KpiCard
          title="Total Students"
          value={loading ? '...' : stats.total}
          icon={Users}
          variant="purple"
        />
        <KpiCard
          title="Low Risk"
          value={loading ? '...' : stats.low.count}
          percentage={loading ? null : stats.low.percentage}
          icon={ShieldCheck}
          variant="mint"
        />
        <KpiCard
          title="Medium Risk"
          value={loading ? '...' : stats.medium.count}
          percentage={loading ? null : stats.medium.percentage}
          icon={AlertCircle}
          variant="amber"
        />
        <KpiCard
          title="High Risk"
          value={loading ? '...' : stats.high.count}
          percentage={loading ? null : stats.high.percentage}
          icon={AlertTriangle}
          variant="pink"
        />
      </div>

      {/* Middle Row: Donut Chart + At-Risk Students Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        <div className="lg:col-span-6 flex flex-col">
          <RiskDonutChart data={distribution} />
        </div>
        <div className="lg:col-span-6 flex flex-col">
          <AtRiskStudentsTable
            students={atRiskStudents}
            selectedStudentId={selectedStudent?.studentId}
            onSelectStudent={(student) => setSelectedStudent(student)}
          />
        </div>
      </div>

      {/* Bottom Row: Active Student Detail Profile */}
      <div>
        <StudentDetailPanel student={selectedStudent} />
      </div>
    </div>
  );
}
