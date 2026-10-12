/**
 * CredVault Backend API Test Suite
 * Validates all 9 SRS endpoints, edge cases, auth guards, and database constraints.
 */

const { startServer } = require('./src/server');

const BASE_URL = 'http://localhost:5000';

async function runTests() {
  const server = await startServer();
  console.log('\n--- Starting Automated Test Suite ---\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // 1. Health Check
    console.log('1. Testing System Health');
    const healthRes = await fetch(`${BASE_URL}/api/health`);
    const healthData = await healthRes.json();
    assert(healthRes.status === 200 && healthData.status === 'ok', 'GET /api/health returns 200 OK');

    // 2. Request Certificate (Valid)
    console.log('\n2. Testing Request Certificate (POST /api/applications)');
    const newAppPayload = {
      name: 'Ananya Deshmukh',
      phone: '9876501234',
      gender: 'Female',
      city: 'Pune',
      state: 'Maharashtra',
    };
    const appRes = await fetch(`${BASE_URL}/api/applications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newAppPayload),
    });
    const appData = await appRes.json();
    assert(appRes.status === 201, 'POST /api/applications returns 201 Created');
    assert(appData.success === true, 'Response contains success: true');
    assert(typeof appData.applicationId === 'string' && appData.applicationId.startsWith('APP-'), 'Generated valid applicationId');
    assert(appData.status === 'Pending', 'Initial application status is "Pending"');
    const createdAppId = appData.applicationId;

    // 2b. Request Certificate Validation Error
    console.log('\n2b. Testing Request Certificate Validation Failure');
    const invalidAppRes = await fetch(`${BASE_URL}/api/applications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: '', phone: '123' }),
    });
    assert(invalidAppRes.status === 400, 'Returns 400 Bad Request on invalid payload');

    // 3. Track Application (Valid)
    console.log('\n3. Testing Track Application (GET /api/applications/track/:applicationId)');
    const trackRes = await fetch(`${BASE_URL}/api/applications/track/${createdAppId}`);
    const trackData = await trackRes.json();
    assert(trackRes.status === 200, `Track returns 200 for ${createdAppId}`);
    assert(trackData.name === 'Ananya Deshmukh', 'Track returns correct applicant name');
    assert(trackData.status === 'Pending', 'Track returns Pending status');

    // 3b. Track Application (Not Found)
    const trackNotFoundRes = await fetch(`${BASE_URL}/api/applications/track/APP-9999`);
    assert(trackNotFoundRes.status === 404, 'Track returns 404 for unknown applicationId');

    // 4. Verify Certificate (Valid Seed)
    console.log('\n4. Testing Verify Certificate (GET /api/certificates/verify/:certificateId)');
    const verifyRes = await fetch(`${BASE_URL}/api/certificates/verify/CERT-0001`);
    const verifyData = await verifyRes.json();
    assert(verifyRes.status === 200, 'Verify returns 200 for valid CERT-0001');
    assert(verifyData.name === 'Aarav Sharma', 'Certificate matches recipient name');
    assert(verifyData.status === 'Valid', 'Certificate status is Valid');

    // 4b. Verify Revoked Certificate
    const verifyRevokedRes = await fetch(`${BASE_URL}/api/certificates/verify/CERT-0002`);
    const verifyRevokedData = await verifyRevokedRes.json();
    assert(verifyRevokedRes.status === 200 && verifyRevokedData.status === 'Revoked', 'Verify returns status Revoked for CERT-0002');

    // 4c. Verify Certificate (Not Found)
    const verifyNotFoundRes = await fetch(`${BASE_URL}/api/certificates/verify/CERT-9999`);
    assert(verifyNotFoundRes.status === 404, 'Verify returns 404 for unknown certificateId');

    // 5. Admin Login (Valid)
    console.log('\n5. Testing Admin Login (POST /api/admin/login)');
    const loginRes = await fetch(`${BASE_URL}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'admin' }),
    });
    const loginData = await loginRes.json();
    assert(loginRes.status === 200, 'Admin login returns 200 OK');
    assert(typeof loginData.token === 'string', 'Admin login returns JWT token');
    const adminToken = loginData.token;

    // 5b. Admin Login (Invalid)
    const invalidLoginRes = await fetch(`${BASE_URL}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'wrongpassword' }),
    });
    assert(invalidLoginRes.status === 401, 'Admin login returns 401 on incorrect credentials');

    // 6. Admin List Applications (Protected)
    console.log('\n6. Testing Admin List Applications (GET /api/admin/applications)');
    const unauthAppListRes = await fetch(`${BASE_URL}/api/admin/applications`);
    assert(unauthAppListRes.status === 401, 'Access denied without token (401)');

    const authAppListRes = await fetch(`${BASE_URL}/api/admin/applications`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const authAppListData = await authAppListRes.json();
    assert(authAppListRes.status === 200, 'Admin list applications returns 200 with token');
    assert(Array.isArray(authAppListData.applications), 'Returns array of applications');

    // 7. Admin Approve Application
    console.log('\n7. Testing Admin Approve Application (PATCH /api/admin/applications/:id/approve)');
    const approveRes = await fetch(`${BASE_URL}/api/admin/applications/${createdAppId}/approve`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const approveData = await approveRes.json();
    assert(approveRes.status === 200, 'Approve returns 200 OK');
    assert(approveData.status === 'Approved', 'Application status updated to Approved');
    assert(typeof approveData.certificateId === 'string' && approveData.certificateId.startsWith('CERT-'), 'Certificate ID generated');
    const generatedCertId = approveData.certificateId;

    // Immediately verify that newly generated certificate can be verified publicly
    const verifyNewCertRes = await fetch(`${BASE_URL}/api/certificates/verify/${generatedCertId}`);
    const verifyNewCertData = await verifyNewCertRes.json();
    assert(verifyNewCertRes.status === 200 && verifyNewCertData.status === 'Valid', 'Newly generated certificate is immediately verifiable as Valid');

    // 8. Admin Reject Application
    console.log('\n8. Testing Admin Reject Application (PATCH /api/admin/applications/:id/reject)');
    // Submit a disposable application to reject
    const appToRejectRes = await fetch(`${BASE_URL}/api/applications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Karan Mehra',
        phone: '9811223344',
        gender: 'Male',
        city: 'Noida',
        state: 'Uttar Pradesh',
      }),
    });
    const appToRejectData = await appToRejectRes.json();
    const rejectAppId = appToRejectData.applicationId;

    const rejectRes = await fetch(`${BASE_URL}/api/admin/applications/${rejectAppId}/reject`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ reason: 'Invalid identity records provided' }),
    });
    const rejectData = await rejectRes.json();
    assert(rejectRes.status === 200, 'Reject returns 200 OK');
    assert(rejectData.status === 'Rejected', 'Application status set to Rejected');

    // 9. Admin List Certificates
    console.log('\n9. Testing Admin List Certificates (GET /api/admin/certificates)');
    const certListRes = await fetch(`${BASE_URL}/api/admin/certificates`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const certListData = await certListRes.json();
    assert(certListRes.status === 200, 'Admin list certificates returns 200 OK');
    assert(Array.isArray(certListData.certificates), 'Returns certificates array');

    // 10. Admin Revoke Certificate
    console.log('\n10. Testing Admin Revoke Certificate');
    const revokeRes = await fetch(`${BASE_URL}/api/admin/certificates/${generatedCertId}/revoke`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const revokeData = await revokeRes.json();
    assert(revokeRes.status === 200, 'Revoke endpoint returns 200 OK');
    assert(revokeData.status === 'Revoked', 'Certificate status updated to Revoked');

    // Check certificate status is Revoked via public verify
    const verifyAfterRevoke = await fetch(`${BASE_URL}/api/certificates/verify/${generatedCertId}`);
    const verifyAfterRevokeData = await verifyAfterRevoke.json();
    assert(verifyAfterRevokeData.status === 'Revoked', 'Public verification reflects Revoked status');

    // Check application status is STILL Approved (SRS rule: original application record remains unchanged!)
    const checkOriginalApp = await fetch(`${BASE_URL}/api/applications/track/${createdAppId}`);
    const checkOriginalAppData = await checkOriginalApp.json();
    assert(checkOriginalAppData.status === 'Approved', 'SRS rule verified: original application record unchanged upon certificate revocation');

    // Also test GET method revoke endpoint for SRS row 9 support
    const revokeGetRes = await fetch(`${BASE_URL}/api/admin/certificates/CERT-0001/revoke`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(revokeGetRes.status === 200, 'GET /api/admin/certificates/:id/revoke also succeeds');

    console.log('\n========================================');
    console.log(`Test Results: ${passed} Passed, ${failed} Failed`);
    console.log('========================================\n');
  } catch (err) {
    console.error('Test execution error:', err);
    failed++;
  } finally {
    server.close();
    process.exit(failed > 0 ? 1 : 0);
  }
}

runTests();
