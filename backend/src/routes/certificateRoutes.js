const express = require('express');
const router = express.Router();
const { db } = require('../db');

/**
 * 3. Verify Certificate
 * GET /api/certificates/verify/:certificateId
 * Param: certificateId
 * Response: 200: certificateId, name, phone, issuedOn, status / 404: not found
 */
router.get('/verify/:certificateId', async (req, res) => {
  try {
    const { certificateId } = req.params;

    if (!certificateId) {
      return res.status(400).json({
        success: false,
        message: 'Certificate ID is required',
      });
    }

    const cert = await db.get(
      `SELECT certificateId, applicationId, name, phone, issuedOn, status
       FROM Certificates
       WHERE UPPER(certificateId) = UPPER(?)`,
      [certificateId.trim()]
    );

    if (!cert) {
      return res.status(404).json({
        success: false,
        message: `Certificate with ID '${certificateId}' not found`,
      });
    }

    return res.status(200).json({
      success: true,
      certificateId: cert.certificateId,
      name: cert.name,
      phone: cert.phone,
      issuedOn: cert.issuedOn,
      status: cert.status,
      applicationId: cert.applicationId,
    });
  } catch (error) {
    console.error('Error verifying certificate:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while verifying certificate',
      error: error.message,
    });
  }
});

module.exports = router;
