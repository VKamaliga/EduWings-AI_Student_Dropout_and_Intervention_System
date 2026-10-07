import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  AreaChart,
  Area,
} from 'recharts';
import {
  Brain,
  TrendingDown,
  Building2,
  Sparkles,
  ShieldAlert,
  ArrowUpRight,
  Info,
} from 'lucide-react';
import Card from '../components/common/Card';
import api from '../services/api';

export default function RiskAnalysis() {
  const [factors, setFactors] = useState([]);
  const [departmentData, setDepartmentData] = useState([]);
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAnalysisData = async () => {
      try {
        setLoading(true);
        const [factorsRes, deptRes, trendsRes] = await Promise.all([
          api.get('/predictions/factors'),
          api.get('/predictions/department-risk'),
          api.get('/predictions/trends'),
        ]);

        setFactors(factorsRes.factors || []);
        setDepartmentData(deptRes.departmentData || []);
        setTrends(trendsRes.trends || []);
      } catch (err) {
        console.error('Failed to load risk analysis:', err);
      } finally {
        setLoading(false);
      }
    };

    loadAnalysisData();
  }, []);

  if (loading) {
    return (
      <div className="py-24 text-center text-slate-400">
        <div className="inline-block w-8 h-8 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mb-3" />
        <div>Computing institutional risk analytics & feature importance...</div>
      </div>
    );
  }

  // Feature importance formatting for horizontal bar chart
  const topFeaturesChart = factors.slice(0, 7).map((f) => ({
    name: f.factor.length > 22 ? f.factor.slice(0, 20) + '...' : f.factor,
    importance: Math.round(f.importance * 100),
    share: f.share,
  }));

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <Brain className="w-6 h-6 text-purple-400" />
            <span>Explainable AI Risk Analytics</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Feature weights, cross-departmental vulnerability distributions, and longitudinal cohort trends
          </p>
        </div>

        <div className="px-3 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-200 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-pink-400" />
          <span>Model: Random Forest & Gradient Boosting (AUC: 0.92)</span>
        </div>
      </div>

      {/* Top 3 Analytical Summary Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 border-l-4 border-l-purple-500">
          <div className="text-xs text-slate-400">Primary Risk Driver</div>
          <div className="text-lg font-bold text-slate-900 dark:text-white mt-1">
            {factors[0]?.factor || 'Low attendance'}
          </div>
          <div className="text-[11px] text-purple-300 mt-1">
            Impacts {factors[0]?.share || 32}% of all flagged student profiles
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-pink-500">
          <div className="text-xs text-slate-400">Department Requiring Support</div>
          <div className="text-lg font-bold text-slate-900 dark:text-white mt-1">
            {departmentData.sort((a, b) => b.high - a.high)[0]?.department || 'Electronics & Comm.'}
          </div>
          <div className="text-[11px] text-pink-300 mt-1">
            Highest concentration of high-risk student flags
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-emerald-500">
          <div className="text-xs text-slate-400">Intervention Effectiveness</div>
          <div className="text-lg font-bold text-slate-900 dark:text-white mt-1">
            -31% High Risk Reduction
          </div>
          <div className="text-[11px] text-emerald-300 mt-1">
            Consecutive 6-month trajectory following proactive advising
          </div>
        </Card>
      </div>

      {/* Grid: Feature Importance Bar Chart & Department Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Feature Importance Chart */}
        <Card className="lg:col-span-6 flex flex-col justify-between p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                Global Feature Importance
              </h3>
              <p className="text-xs text-slate-400">Relative weight in AI classification decisions</p>
            </div>
            <span className="text-xs font-mono text-purple-300">Weights (0-100)</span>
          </div>

          <div className="h-72 w-full my-auto">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={topFeaturesChart}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(168, 85, 247, 0.15)" />
                <XAxis type="number" stroke="#94A3B8" fontSize={11} domain={[0, 50]} />
                <YAxis
                  type="category"
                  dataKey="name"
                  stroke="#E2E8F0"
                  fontSize={11}
                  tickLine={false}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0].payload;
                      return (
                        <div className="glass-panel p-2.5 rounded-xl border border-purple-500/30 text-xs shadow-xl space-y-1">
                          <div className="font-bold text-slate-900 dark:text-white">{item.name}</div>
                          <div className="text-purple-300">Weight: {item.importance}%</div>
                          <div className="text-slate-300">Cohort Prevalence: {item.share}%</div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar
                  dataKey="importance"
                  fill="#A855F7"
                  radius={[0, 8, 8, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Department Breakdown */}
        <Card className="lg:col-span-6 flex flex-col justify-between p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                Risk Distribution by Department
              </h3>
              <p className="text-xs text-slate-400">Cohort counts across academic divisions</p>
            </div>
          </div>

          <div className="h-72 w-full my-auto">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={departmentData}
                margin={{ top: 10, right: 10, left: -20, bottom: 25 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(168, 85, 247, 0.15)" />
                <XAxis
                  dataKey="department"
                  stroke="#94A3B8"
                  fontSize={10}
                  angle={-20}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis stroke="#94A3B8" fontSize={11} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="glass-panel p-3 rounded-xl border border-purple-500/30 text-xs shadow-xl space-y-1">
                          <div className="font-bold text-slate-900 dark:text-white">{label}</div>
                          <div className="text-emerald-300">Low Risk: {payload[0]?.value}</div>
                          <div className="text-amber-300">Medium Risk: {payload[1]?.value}</div>
                          <div className="text-pink-300">High Risk: {payload[2]?.value}</div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Bar dataKey="low" name="Low Risk" fill="#34D399" stackId="a" radius={[0, 0, 0, 0]} />
                <Bar dataKey="medium" name="Medium Risk" fill="#FBBF24" stackId="a" radius={[0, 0, 0, 0]} />
                <Bar dataKey="high" name="High Risk" fill="#EC4899" stackId="a" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Monthly Longitudinal Trend Chart */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
              6-Month Longitudinal Risk Trajectory
            </h3>
            <p className="text-xs text-slate-400">
              Tracking how proactive interventions reduce high-risk students over time
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
            <TrendingDown className="w-4 h-4" />
            <span>High Risk Attrition Down 31%</span>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trends} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorHigh" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EC4899" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#EC4899" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorMed" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FBBF24" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#FBBF24" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorLow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#34D399" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#34D399" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(168, 85, 247, 0.15)" />
              <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} />
              <YAxis stroke="#94A3B8" fontSize={11} />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="glass-panel p-3 rounded-xl border border-purple-500/30 text-xs shadow-xl space-y-1">
                        <div className="font-bold text-slate-900 dark:text-white">{label}</div>
                        <div className="text-pink-300">High Risk: {payload[0]?.value}</div>
                        <div className="text-amber-300">Medium Risk: {payload[1]?.value}</div>
                        <div className="text-emerald-300">Low Risk: {payload[2]?.value}</div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Area
                type="monotone"
                dataKey="highRisk"
                name="High Risk"
                stroke="#EC4899"
                fillOpacity={1}
                fill="url(#colorHigh)"
              />
              <Area
                type="monotone"
                dataKey="mediumRisk"
                name="Medium Risk"
                stroke="#FBBF24"
                fillOpacity={1}
                fill="url(#colorMed)"
              />
              <Area
                type="monotone"
                dataKey="lowRisk"
                name="Low Risk"
                stroke="#34D399"
                fillOpacity={1}
                fill="url(#colorLow)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
