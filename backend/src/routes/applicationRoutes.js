const express = require('express');
const router = express.Router();
const { db, generateNextApplicationId } = require('../db');
const { validateApplication } = require('../middleware/validation');

/**
 * 1. Request Certificate
 * POST /api/applications
 * Body: name, phone, gender, city, state
 * Response: 201: success, message, applicationId, status
 */
router.post('/', validateApplication, async (req, res) => {
  try {
    const { name, phone, gender, city, state } = req.body;
    const applicationId = await generateNextApplicationId();
    const status = 'Pending';
    const submittedAt = new Date().toISOString().split('T')[0];

    await db.run(
      `INSERT INTO Applications (applicationId, name, phone, gender, city, state, status, submittedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [applicationId, name, phone, gender, city, state, status, submittedAt]
    );

    return res.status(201).json({
      success: true,
      message: 'Certificate application submitted successfully',
      applicationId,
      status,
      data: {
        applicationId,
        name,
        phone,
        gender,
        city,
        state,
        status,
        submittedAt,
      },
    });
  } catch (error) {
    console.error('Error submitting application:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while processing application',
      error: error.message,
    });
  }
});

/**
 * 2. Track Application
 * GET /api/applications/track/:applicationId
 * Param: applicationId
 * Response: 200: applicationId, name, status, submittedAt / 404: not found
 */
router.get('/track/:applicationId', async (req, res) => {
  try {
    const { applicationId } = req.params;

    if (!applicationId) {
      return res.status(400).json({
        success: false,
        message: 'Application ID is required',
      });
    }

    const app = await db.get(
      `SELECT applicationId, name, phone, gender, city, state, status, submittedAt, rejectReason
       FROM Applications
       WHERE UPPER(applicationId) = UPPER(?)`,
      [applicationId.trim()]
    );

    if (!app) {
      return res.status(404).json({
        success: false,
        message: `Application with ID '${applicationId}' not found`,
      });
    }

    return res.status(200).json({
      success: true,
      applicationId: app.applicationId,
      name: app.name,
      status: app.status,
      submittedAt: app.submittedAt,
      // Additional helpful details
      phone: app.phone,
      gender: app.gender,
      city: app.city,
      state: app.state,
      rejectReason: app.rejectReason || undefined,
    });
  } catch (error) {
    console.error('Error tracking application:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while tracking application',
      error: error.message,
    });
  }
});

module.exports = router;
