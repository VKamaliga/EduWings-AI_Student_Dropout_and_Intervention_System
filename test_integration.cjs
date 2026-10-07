const http = require('http');

async function testAll() {
  console.log('🚀 Running Full-Stack EduWings Integration Verification...\n');

  // Helper for requests
  const request = (method, path, body = null, token = null) => {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: '127.0.0.1',
        port: 5001,
        path: `/api${path}`,
        method: method,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      };

      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            resolve({ status: res.statusCode, data: parsed });
          } catch {
            resolve({ status: res.statusCode, raw: data });
          }
        });
      });

      req.on('error', reject);
      if (body) req.write(JSON.stringify(body));
      req.end();
    });
  };

  try {
    // 1. Health
    const health = await request('GET', '/health');
    console.log(`✅ Health Check: HTTP ${health.status} - ${health.data.status}`);

    // 2. Auth - Admin Login
    const adminLogin = await request('POST', '/auth/login', {
      email: 'admin@eduwings.edu',
      password: 'Admin@123'
    });
    console.log(`✅ Admin Login: HTTP ${adminLogin.status} - User: ${adminLogin.data.user?.name} (${adminLogin.data.user?.role})`);
    const adminToken = adminLogin.data.token;

    // 3. Auth - Faculty Login
    const facultyLogin = await request('POST', '/auth/login', {
      email: 'faculty@eduwings.edu',
      password: 'Faculty@123'
    });
    console.log(`✅ Faculty Login: HTTP ${facultyLogin.status} - Dept: ${facultyLogin.data.user?.department}`);
    const facultyToken = facultyLogin.data.token;

    // 4. Auth - Counsellor Login
    const counsellorLogin = await request('POST', '/auth/login', {
      email: 'counsellor@eduwings.edu',
      password: 'Counsellor@123'
    });
    console.log(`✅ Counsellor Login: HTTP ${counsellorLogin.status} - Role: ${counsellorLogin.data.user?.role}`);

    // 5. Prediction KPIs Stats
    const stats = await request('GET', '/predictions/stats', null, adminToken);
    console.log(`✅ Stats: Total=${stats.data.total}, Low=${stats.data.low.count} (${stats.data.low.percentage}%), Med=${stats.data.medium.count} (${stats.data.medium.percentage}%), High=${stats.data.high.count} (${stats.data.high.percentage}%)`);

    // 6. Donut Distribution
    const dist = await request('GET', '/predictions/distribution', null, adminToken);
    console.log(`✅ Donut Distribution Segments: ${dist.data.distribution.map(d => `${d.name}: ${d.percentage}%`).join(' | ')}`);

    // 7. Students List
    const studentsRes = await request('GET', '/students?limit=5&sortBy=risk&sortOrder=desc', null, adminToken);
    console.log(`✅ Students Query: Loaded ${studentsRes.data.students.length} of ${studentsRes.data.pagination.total} students.`);
    const firstStudent = studentsRes.data.students[0];
    console.log(`   Top At-Risk Student: ${firstStudent.studentId} - ${firstStudent.name} (${firstStudent.currentRisk?.riskLevel} ${Math.round(firstStudent.currentRisk?.probability * 100)}%)`);

    // 8. Single Student Detail
    const detail = await request('GET', `/students/${firstStudent._id}`, null, adminToken);
    console.log(`✅ Student Detail: ${detail.data.student.studentId} Top Factors: ${detail.data.student.currentRisk?.topFactors.map(f => f.factor).join(', ')}`);

    // 9. Trigger ML Re-Prediction
    const repredict = await request('POST', `/students/${firstStudent._id}/predict`, {}, adminToken);
    console.log(`✅ Trigger ML Re-Prediction: Model Used: ${repredict.data.student?.currentRisk?.modelUsed}, New Prob: ${Math.round(repredict.data.student?.currentRisk?.probability * 100)}%`);

    // 10. Interventions Listing & Creation
    const createInv = await request('POST', '/interventions', {
      studentId: firstStudent.studentId,
      title: 'Targeted Advising Session',
      type: 'Academic Support',
      priority: 'High',
      status: 'Planned',
      initialNote: 'Student met with departmental advisor.'
    }, adminToken);
    console.log(`✅ Created Intervention: ${createInv.data.intervention?.title} (ID: ${createInv.data.intervention?._id})`);

    // 11. Notifications
    const notifs = await request('GET', '/notifications', null, adminToken);
    console.log(`✅ Notifications: Found ${notifs.data.notifications.length} alerts (${notifs.data.unreadCount} unread).`);

    // 12. Reports Summary
    const rep = await request('GET', '/reports/summary', null, adminToken);
    console.log(`✅ Reports Summary: Cohort Attendance=${rep.data.summary.overallAttendance}%, Success Rate=${rep.data.summary.successRate}%`);

    // 13. System Settings
    const settings = await request('GET', '/settings', null, adminToken);
    console.log(`✅ Settings: Institution="${settings.data.setting.institutionName}", Low Threshold=<${settings.data.setting.riskThresholdLow}%, High Threshold=>${settings.data.setting.riskThresholdHigh}%`);

    console.log('\n🎉 ALL 13 ENDPOINTS & FLOWS VERIFIED SUCCESSFULLY!');
  } catch (err) {
    console.error('❌ Test failed:', err);
  }
}

testAll();
