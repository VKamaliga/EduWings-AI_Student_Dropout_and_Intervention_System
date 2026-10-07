const RISK_THRESHOLDS = {
  LOW: 35, // < 35%
  MEDIUM: 65, // 35 - 65%
  HIGH: 65, // > 65%
};

const DEPARTMENTS = [
  'Computer Science',
  'Electronics & Comm.',
  'Mechanical Engineering',
  'Civil Engineering',
  'Information Technology',
  'Data Science & AI',
];

const INTERVENTION_TYPES = [
  'Counselling',
  'Academic Support',
  'Attendance Follow-up',
  'Financial Aid Referral',
  'Parent Meeting',
  'Peer Mentoring',
  'Career Guidance',
];

const INTERVENTION_STATUSES = ['Planned', 'In Progress', 'Completed', 'Cancelled'];

const USER_ROLES = {
  ADMIN: 'admin',
  FACULTY: 'faculty',
  COUNSELLOR: 'counsellor',
};

// Map primary risk factors to supportive interventions
const FACTOR_INTERVENTION_MAP = {
  low_attendance: {
    label: 'Low attendance',
    intervention: 'Attendance Follow-up',
    description: 'Attendance below 75% threshold required by university norms.',
  },
  declining_cgpa: {
    label: 'Declining academic performance',
    intervention: 'Academic Support',
    description: 'Internal scores or CGPA trending downward over recent evaluations.',
  },
  high_backlogs: {
    label: 'Multiple course backlogs',
    intervention: 'Academic Support',
    description: 'Accumulation of un-cleared subjects requiring focused remedial tutoring.',
  },
  low_engagement: {
    label: 'Low digital LMS engagement',
    intervention: 'Peer Mentoring',
    description: 'Infrequent portal access and low assignment turn-in rates.',
  },
  fee_overdue: {
    label: 'Overdue tuition fee',
    intervention: 'Financial Aid Referral',
    description: 'Financial distress impacting enrollment stability.',
  },
  long_commute: {
    label: 'High commute distance',
    intervention: 'Counselling',
    description: 'Daily travel fatigue exceeding 30km impacting daily attendance.',
  },
  frequent_counselling: {
    label: 'Frequent past counselling visits',
    intervention: 'Counselling',
    description: 'Prior distress signals indicating ongoing psychosocial needs.',
  },
  low_assignments: {
    label: 'Incomplete assignment submissions',
    intervention: 'Peer Mentoring',
    description: 'Assignment completion rate below 65%.',
  },
};

module.exports = {
  RISK_THRESHOLDS,
  DEPARTMENTS,
  INTERVENTION_TYPES,
  INTERVENTION_STATUSES,
  USER_ROLES,
  FACTOR_INTERVENTION_MAP,
};
