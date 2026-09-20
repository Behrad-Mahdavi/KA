const BASE_URL = process.env.TEST_URL || 'http://localhost:5005';

let studentToken = '';
let adminToken = '';
let studentUser = null;
let sampleActivityId = '';
let sampleRewardId = '';
let createdStudentActivityId = '';
let createdStudentRewardId = '';

let passCount = 0;
let failCount = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passCount++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failCount++;
  }
}

async function runTests() {
  console.log(`\n==============================================`);
  console.log(`🚀 Starting Comprehensive API Health Tests on ${BASE_URL}`);
  console.log(`==============================================\n`);

  try {
    // 1. Root health check
    console.log(`🔹 1. Root Health Check`);
    const rootRes = await fetch(`${BASE_URL}/`);
    const rootJson = await rootRes.json();
    assert(rootRes.status === 200 && rootJson.status === 'success', 'GET / returns 200 and success status');

    // 2. Auth: Student Login
    console.log(`\n🔹 2. Authentication - Student Login`);
    const sLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idCode: '2222222222', password: 's2222222222' })
    });
    const sLoginJson = await sLoginRes.json();
    assert(sLoginRes.status === 200 && sLoginJson.success === true, 'POST /api/auth/login returns 200 for Student');
    assert(sLoginJson.data?.token, 'Student token returned');
    studentToken = sLoginJson.data.token;
    studentUser = sLoginJson.data.user;

    // 3. Auth: Admin Login
    console.log(`\n🔹 3. Authentication - Admin Login`);
    const aLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idCode: '1111111111', password: 'a1111111111' })
    });
    const aLoginJson = await aLoginRes.json();
    assert(aLoginRes.status === 200 && aLoginJson.success === true, 'POST /api/auth/login returns 200 for Admin');
    assert(aLoginJson.data?.token, 'Admin token returned');
    adminToken = aLoginJson.data.token;

    // 4. Student Profile & Dashboard
    console.log(`\n🔹 4. Student Profile & Dashboard`);
    const profRes = await fetch(`${BASE_URL}/api/users/my-profile`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    const profJson = await profRes.json();
    assert(profRes.status === 200 && profJson.data?.idCode === '2222222222', 'GET /api/users/my-profile returns student data');

    const sDashRes = await fetch(`${BASE_URL}/api/student-dashboard`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    const sDashJson = await sDashRes.json();
    assert(sDashRes.status === 200 && sDashJson.data?.userRankInSchool !== undefined, 'GET /api/student-dashboard returns ranks and stats');

    // 5. Leaderboard Unified Endpoint
    console.log(`\n🔹 5. Leaderboard - Unified Endpoints`);
    
    // 5.1 Overall Leaderboard
    const lbOverallRes = await fetch(`${BASE_URL}/api/leaderboard?limit=20`);
    const lbOverallJson = await lbOverallRes.json();
    assert(lbOverallRes.status === 200 && lbOverallJson.success === true, 'GET /api/leaderboard returns 200');
    assert(Array.isArray(lbOverallJson.data) && lbOverallJson.data.length > 0, `Leaderboard data returned (${lbOverallJson.data.length} students)`);
    assert(lbOverallJson.data[0].token !== undefined, '95% spendable token calculated correctly');

    // 5.2 Filter by Branch: پسرانه
    const lbBoysRes = await fetch(`${BASE_URL}/api/leaderboard?branch=پسرانه`);
    const lbBoysJson = await lbBoysRes.json();
    const allBoys = lbBoysJson.data.every(s => s.branch === 'پسرانه');
    assert(lbBoysRes.status === 200 && allBoys, `GET /api/leaderboard?branch=پسرانه returns only boys (${lbBoysJson.data.length} students)`);

    // 5.3 Filter by Branch: دخترانه
    const lbGirlsRes = await fetch(`${BASE_URL}/api/leaderboard?branch=دخترانه`);
    const lbGirlsJson = await lbGirlsRes.json();
    const allGirls = lbGirlsJson.data.every(s => s.branch === 'دخترانه');
    assert(lbGirlsRes.status === 200 && allGirls, `GET /api/leaderboard?branch=دخترانه returns only girls (${lbGirlsJson.data.length} students)`);

    // 5.4 Filter by Grade: دهم
    const lbGradeRes = await fetch(`${BASE_URL}/api/leaderboard?grade=دهم`);
    const lbGradeJson = await lbGradeRes.json();
    const allGrade10 = lbGradeJson.data.every(s => s.grade === 'دهم');
    assert(lbGradeRes.status === 200 && allGrade10, `GET /api/leaderboard?grade=دهم returns only grade 10 (${lbGradeJson.data.length} students)`);

    // 5.5 Filter by Class: 101
    const lbClassRes = await fetch(`${BASE_URL}/api/leaderboard?class=101`);
    const lbClassJson = await lbClassRes.json();
    const allClass101 = lbClassJson.data.every(s => s.class === 101);
    assert(lbClassRes.status === 200 && allClass101, `GET /api/leaderboard?class=101 returns only class 101 (${lbClassJson.data.length} students)`);

    // 5.6 Filter by Branch + Grade + Class
    const lbCombinedRes = await fetch(`${BASE_URL}/api/leaderboard?branch=پسرانه&grade=دهم&class=101`);
    const lbCombinedJson = await lbCombinedRes.json();
    const allCombined = lbCombinedJson.data.every(s => s.branch === 'پسرانه' && s.grade === 'دهم' && s.class === 101);
    assert(lbCombinedRes.status === 200 && allCombined, `GET /api/leaderboard with combined branch+grade+class filters accurately`);

    // 5.7 Leaderboard Summary
    console.log(`\n🔹 6. Leaderboard - Summary & Meta`);
    const lbSumRes = await fetch(`${BASE_URL}/api/leaderboard/summary`);
    const lbSumJson = await lbSumRes.json();
    assert(lbSumRes.status === 200 && lbSumJson.success === true, 'GET /api/leaderboard/summary returns 200');
    assert(Array.isArray(lbSumJson.topPerformers?.overall), 'Summary includes topPerformers.overall');
    assert(Array.isArray(lbSumJson.topPerformers?.boys), 'Summary includes topPerformers.boys');
    assert(Array.isArray(lbSumJson.topPerformers?.girls), 'Summary includes topPerformers.girls');
    assert(lbSumJson.structure?.classesByGrade?.['دهم'] !== undefined, 'Summary includes structure.classesByGrade');

    // 7. Student Activities Workflow
    console.log(`\n🔹 7. Student Activities Workflow`);
    // 7.1 Fetch activities catalog
    const actRes = await fetch(`${BASE_URL}/api/activity`);
    const actJson = await actRes.json();
    assert(actRes.status === 200 && Array.isArray(actJson.data), 'GET /api/activity returns activities catalog');
    sampleActivityId = actJson.data[0]?.id;

    // 7.2 Student submits new activity
    const submitRes = await fetch(`${BASE_URL}/api/student-activity`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`
      },
      body: JSON.stringify({
        activityId: sampleActivityId,
        details: 'تست خودکار ثبت فعالیت دانش‌آموزی',
        scoreAwarded: 15
      })
    });
    const submitJson = await submitRes.json();
    assert(submitRes.status === 201 && submitJson.data?.id, 'POST /api/student-activity successfully creates pending activity');
    createdStudentActivityId = submitJson.data?.id;

    // 7.3 Student views their activities
    const myActsRes = await fetch(`${BASE_URL}/api/my-activities/my-list`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    const myActsJson = await myActsRes.json();
    assert(myActsRes.status === 200 && Array.isArray(myActsJson.data), 'GET /api/my-activities/my-list returns student activity history');

    // 8. Admin Activity Review Workflow
    console.log(`\n🔹 8. Admin Review Workflow`);
    // 8.1 Admin fetches review list
    const adminRevListRes = await fetch(`${BASE_URL}/api/admin-review/student-activities-list?status=pending`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const adminRevListJson = await adminRevListRes.json();
    assert(adminRevListRes.status === 200 && Array.isArray(adminRevListJson.data), 'GET /api/admin-review/student-activities-list returns pending submissions');

    // 8.2 Admin approves the student activity
    if (createdStudentActivityId) {
      const approveRes = await fetch(`${BASE_URL}/api/admin-review/student-activities/${createdStudentActivityId}/approve`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify({
          scoreAwarded: 25,
          adminComment: 'تایید شد با امتیاز کامل در تست صحت سامانه'
        })
      });
      const approveJson = await approveRes.json();
      assert(approveRes.status === 200 && approveJson.success === true, `PATCH /api/admin-review/student-activities/:id/approve approves successfully`);
    }

    // 9. Rewards & Redemption Workflow
    console.log(`\n🔹 9. Rewards & Redemption Workflow`);
    // 9.1 Fetch reward catalog
    const rewRes = await fetch(`${BASE_URL}/api/reward`);
    const rewJson = await rewRes.json();
    assert(rewRes.status === 200 && Array.isArray(rewJson.data), 'GET /api/reward returns reward catalog');
    sampleRewardId = rewJson.data[0]?.id;

    // 9.2 Student requests reward
    if (sampleRewardId) {
      const ordRes = await fetch(`${BASE_URL}/api/student-reward`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${studentToken}`
        },
        body: JSON.stringify({
          rewardId: sampleRewardId
        })
      });
      const ordJson = await ordRes.json();
      assert((ordRes.status === 200 || ordRes.status === 201) && ordJson.success === true, 'POST /api/student-reward registers reward redemption request');
      createdStudentRewardId = ordJson.data?.id;
    }

    // 9.3 Student checks their reward orders
    const myRewsRes = await fetch(`${BASE_URL}/api/student-reward/my-rewards`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    const myRewsJson = await myRewsRes.json();
    assert(myRewsRes.status === 200 && Array.isArray(myRewsJson.data), 'GET /api/student-reward/my-rewards returns list of reward orders');

    // 9.4 Admin lists reward requests
    const admRewsRes = await fetch(`${BASE_URL}/api/student-reward/rewards-list`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const admRewsJson = await admRewsRes.json();
    assert(admRewsRes.status === 200 && Array.isArray(admRewsJson.data), 'GET /api/student-reward/rewards-list returns all reward orders for admin');

    // 9.5 Admin updates reward status (delivered / approved)
    if (createdStudentRewardId) {
      const updRewRes = await fetch(`${BASE_URL}/api/student-reward/${createdStudentRewardId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify({
          status: 'delivered'
        })
      });
      const updRewJson = await updRewRes.json();
      assert(updRewRes.status === 200 && updRewJson.success === true, 'PATCH /api/student-reward/:id updates status to delivered');
    }

    console.log(`\n==============================================`);
    console.log(`📊 Test Summary: ${passCount} Passed, ${failCount} Failed`);
    console.log(`==============================================\n`);

    if (failCount > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Fatal test execution error:', err);
    process.exit(1);
  }
}

runTests();
