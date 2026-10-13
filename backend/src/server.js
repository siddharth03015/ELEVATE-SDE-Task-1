require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initDb } = require('./db');

const applicationRoutes = require('./routes/applicationRoutes');
const certificateRoutes = require('./routes/certificateRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging in development
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Root API information
app.get('/', (req, res) => {
  res.json({
    project: 'CredVault Backend API',
    description: 'Certificate Issuing & Verification Platform API',
    version: '1.0.0',
    endpoints: {
      requestCertificate: 'POST /api/applications',
      trackApplication: 'GET /api/applications/track/:applicationId',
      verifyCertificate: 'GET /api/certificates/verify/:certificateId',
      adminLogin: 'POST /api/admin/login',
      adminListApplications: 'GET /api/admin/applications',
      adminApproveApplication: 'PATCH /api/admin/applications/:applicationId/approve',
      adminRejectApplication: 'PATCH /api/admin/applications/:applicationId/reject',
      adminListCertificates: 'GET /api/admin/certificates',
      adminRevokeCertificate: 'GET/PATCH /api/admin/certificates/:certificateId/revoke',
    },
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime(), timestamp: new Date() });
});

// Public platform summary stats
app.get('/api/stats', async (req, res) => {
  try {
    const { db } = require('./db');
    const appCount = await db.get(`SELECT COUNT(*) as total FROM Applications`);
    const certCount = await db.get(`SELECT COUNT(*) as total FROM Certificates`);
    const validCount = await db.get(`SELECT COUNT(*) as total FROM Certificates WHERE status = 'Valid'`);
    res.json({
      success: true,
      applications: appCount ? appCount.total : 0,
      certificates: certCount ? certCount.total : 0,
      verified: validCount ? validCount.total : 0,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Mount routes matching SRS specifications
app.use('/api/applications', applicationRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/admin', adminRoutes);

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Endpoint ${req.method} ${req.originalUrl} not found`,
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('[Unhandled Error]:', err);
  res.status(500).json({
    success: false,
    message: 'An internal server error occurred',
    error: process.env.NODE_ENV === 'production' ? undefined : err.message,
  });
});

// Initialize database and start server
async function startServer() {
  try {
    await initDb();
    const server = app.listen(PORT, () => {
      console.log(`=======================================================`);
      console.log(`  CredVault Backend Server Running on Port ${PORT}`);
      console.log(`  Base URL: http://localhost:${PORT}`);
      console.log(`  Health Check: http://localhost:${PORT}/api/health`);
      console.log(`=======================================================`);
    });
    return server;
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
