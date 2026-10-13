const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { db, generateNextCertificateId } = require('../db');
const { adminAuth, generateToken } = require('../middleware/auth');
const { validateAdminLogin } = require('../middleware/validation');

/**
 * 4. Admin Login
 * POST /api/admin/login
 * Body: username, password
 * Response: 200: success, message, token or admin session / 401: invalid login
 */
router.post('/login', validateAdminLogin, async (req, res) => {
  try {
    const { username, password } = req.body;

    const admin = await db.get(
      `SELECT username, password FROM Admins WHERE username = ?`,
      [username.trim()]
    );

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password',
      });
    }

    // Support bcrypt hashed password and fallback plain text
    let isMatch = false;
    try {
      isMatch = await bcrypt.compare(password, admin.password);
    } catch {
      isMatch = false;
    }
    if (!isMatch && admin.password === password) {
      isMatch = true;
    }

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password',
      });
    }

    const token = generateToken({ username: admin.username });

    return res.status(200).json({
      success: true,
      message: 'Admin login successful',
      token,
      admin: {
        username: admin.username,
      },
    });
  } catch (error) {
    console.error('Error in admin login:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during login',
      error: error.message,
    });
  }
});

/**
 * 5. Admin List Applications
 * GET /api/admin/applications
 * Auth: Admin protected route
 * Response: 200: list of all applications
 */
router.get('/applications', adminAuth, async (req, res) => {
  try {
    const applications = await db.all(
      `SELECT applicationId, name, phone, gender, city, state, status, submittedAt, rejectReason
       FROM Applications
       ORDER BY submittedAt DESC, applicationId DESC`
    );

    return res.status(200).json({
      success: true,
      count: applications.length,
      applications,
    });
  } catch (error) {
    console.error('Error fetching applications:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while fetching applications',
      error: error.message,
    });
  }
});

/**
 * 6. Admin Approve Application
 * PATCH /api/admin/applications/:applicationId/approve
 * Param: applicationId
 * Response: 200: application approved, certificateId generated
 */
router.patch('/applications/:applicationId/approve', adminAuth, async (req, res) => {
  try {
    const { applicationId } = req.params;

    const app = await db.get(
      `SELECT * FROM Applications WHERE UPPER(applicationId) = UPPER(?)`,
      [applicationId.trim()]
    );

    if (!app) {
      return res.status(404).json({
        success: false,
        message: `Application with ID '${applicationId}' not found`,
      });
    }

    if (app.status === 'Approved') {
      // Find existing certificate
      const existingCert = await db.get(
        `SELECT certificateId FROM Certificates WHERE UPPER(applicationId) = UPPER(?)`,
        [app.applicationId]
      );
      return res.status(200).json({
        success: true,
        message: 'Application is already approved',
        applicationId: app.applicationId,
        certificateId: existingCert ? existingCert.certificateId : null,
        status: 'Approved',
      });
    }

    // 1. Update application status to 'Approved'
    await db.run(
      `UPDATE Applications SET status = 'Approved', rejectReason = NULL WHERE applicationId = ?`,
      [app.applicationId]
    );

    // 2. Generate new Certificate ID
    const certificateId = await generateNextCertificateId();
    const issuedOn = new Date().toISOString().split('T')[0];

    // 3. Create Certificate record
    await db.run(
      `INSERT INTO Certificates (certificateId, applicationId, name, phone, issuedOn, status)
       VALUES (?, ?, ?, ?, ?, 'Valid')`,
      [certificateId, app.applicationId, app.name, app.phone, issuedOn]
    );

    return res.status(200).json({
      success: true,
      message: 'Application approved successfully and certificate issued',
      applicationId: app.applicationId,
      certificateId,
      status: 'Approved',
      certificate: {
        certificateId,
        applicationId: app.applicationId,
        name: app.name,
        phone: app.phone,
        issuedOn,
        status: 'Valid',
      },
    });
  } catch (error) {
    console.error('Error approving application:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while approving application',
      error: error.message,
    });
  }
});

/**
 * 7. Admin Reject Application
 * PATCH /api/admin/applications/:applicationId/reject
 * Param: applicationId, optional body: reason
 * Response: 200: application rejected
 */
router.patch('/applications/:applicationId/reject', adminAuth, async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { reason } = req.body || {};

    const app = await db.get(
      `SELECT * FROM Applications WHERE UPPER(applicationId) = UPPER(?)`,
      [applicationId.trim()]
    );

    if (!app) {
      return res.status(404).json({
        success: false,
        message: `Application with ID '${applicationId}' not found`,
      });
    }

    const rejectReason = reason ? String(reason).trim() : 'Application rejected by administrator';

    await db.run(
      `UPDATE Applications SET status = 'Rejected', rejectReason = ? WHERE applicationId = ?`,
      [rejectReason, app.applicationId]
    );

    return res.status(200).json({
      success: true,
      message: 'Application rejected successfully',
      applicationId: app.applicationId,
      status: 'Rejected',
      reason: rejectReason,
    });
  } catch (error) {
    console.error('Error rejecting application:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while rejecting application',
      error: error.message,
    });
  }
});

/**
 * 8. Admin List Certificates
 * GET /api/admin/certificates
 * Auth: Admin protected route
 * Response: 200: list of issued certificates
 */
router.get('/certificates', adminAuth, async (req, res) => {
  try {
    const certificates = await db.all(
      `SELECT c.certificateId, c.applicationId, c.name, c.phone, c.issuedOn, c.status, a.city, a.state
       FROM Certificates c
       LEFT JOIN Applications a ON UPPER(c.applicationId) = UPPER(a.applicationId)
       ORDER BY c.issuedOn DESC, c.certificateId DESC`
    );

    return res.status(200).json({
      success: true,
      count: certificates.length,
      certificates,
    });
  } catch (error) {
    console.error('Error fetching certificates:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while fetching certificates',
      error: error.message,
    });
  }
});

/**
 * Helper function for revoking certificate
 * When a certificate is revoked, only the certificate status changes to Revoked.
 * The original application record remains unchanged!
 */
async function handleRevokeCertificate(req, res) {
  try {
    const { certificateId } = req.params;

    const cert = await db.get(
      `SELECT * FROM Certificates WHERE UPPER(certificateId) = UPPER(?)`,
      [certificateId.trim()]
    );

    if (!cert) {
      return res.status(404).json({
        success: false,
        message: `Certificate with ID '${certificateId}' not found`,
      });
    }

    await db.run(
      `UPDATE Certificates SET status = 'Revoked' WHERE certificateId = ?`,
      [cert.certificateId]
    );

    return res.status(200).json({
      success: true,
      message: 'Certificate revoked successfully',
      certificateId: cert.certificateId,
      status: 'Revoked',
    });
  } catch (error) {
    console.error('Error revoking certificate:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while revoking certificate',
      error: error.message,
    });
  }
}

/**
 * 9. Admin Revoke Certificate
 * Supporting both GET and PATCH to fully satisfy SRS table row 9 & REST conventions
 * GET /api/admin/certificates/:certificateId/revoke
 * PATCH /api/admin/certificates/:certificateId/revoke
 */
router.get('/certificates/:certificateId/revoke', adminAuth, handleRevokeCertificate);
router.patch('/certificates/:certificateId/revoke', adminAuth, handleRevokeCertificate);

module.exports = router;
