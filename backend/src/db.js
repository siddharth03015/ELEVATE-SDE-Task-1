const path = require('path');
const fs = require('fs');

const DB_PATH = process.env.DATABASE_PATH || path.join(__dirname, '..', 'credvault.db');

let dbDriver = null;
let db = null;

// Try loading sqlite3, or fall back to native node:sqlite (Node 22.5+)
try {
  const sqlite3 = require('sqlite3').verbose();
  const rawDb = new sqlite3.Database(DB_PATH);
  
  db = {
    run: (sql, params = []) =>
      new Promise((resolve, reject) => {
        rawDb.run(sql, params, function (err) {
          if (err) return reject(err);
          resolve({ lastID: this.lastID, changes: this.changes });
        });
      }),
    get: (sql, params = []) =>
      new Promise((resolve, reject) => {
        rawDb.get(sql, params, (err, row) => {
          if (err) return reject(err);
          resolve(row);
        });
      }),
    all: (sql, params = []) =>
      new Promise((resolve, reject) => {
        rawDb.all(sql, params, (err, rows) => {
          if (err) return reject(err);
          resolve(rows || []);
        });
      }),
    exec: (sql) =>
      new Promise((resolve, reject) => {
        rawDb.exec(sql, (err) => {
          if (err) return reject(err);
          resolve();
        });
      }),
    close: () =>
      new Promise((resolve, reject) => {
        rawDb.close((err) => {
          if (err) return reject(err);
          resolve();
        });
      }),
  };
  dbDriver = 'sqlite3';
} catch (e) {
  // Fallback to native node:sqlite
  const { DatabaseSync } = require('node:sqlite');
  const rawDb = new DatabaseSync(DB_PATH);
  
  db = {
    run: async (sql, params = []) => {
      const stmt = rawDb.prepare(sql);
      const result = stmt.run(...params);
      return { lastID: result.lastInsertRowid, changes: result.changes };
    },
    get: async (sql, params = []) => {
      const stmt = rawDb.prepare(sql);
      return stmt.get(...params);
    },
    all: async (sql, params = []) => {
      const stmt = rawDb.prepare(sql);
      return stmt.all(...params) || [];
    },
    exec: async (sql) => {
      rawDb.exec(sql);
    },
    close: async () => {
      rawDb.close();
    },
  };
  dbDriver = 'node:sqlite';
}

console.log(`[Database] Initialized using driver: ${dbDriver} at ${DB_PATH}`);

// Initialize schema and seed data
async function initDb() {
  await db.exec(`
    CREATE TABLE IF NOT EXISTS Applications (
      applicationId TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      gender TEXT NOT NULL,
      city TEXT NOT NULL,
      state TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Pending' CHECK(status IN ('Pending', 'Approved', 'Rejected')),
      submittedAt TEXT NOT NULL,
      rejectReason TEXT DEFAULT NULL
    );

    CREATE TABLE IF NOT EXISTS Certificates (
      certificateId TEXT PRIMARY KEY,
      applicationId TEXT NOT NULL,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      issuedOn TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Valid' CHECK(status IN ('Valid', 'Revoked')),
      FOREIGN KEY (applicationId) REFERENCES Applications(applicationId)
    );

    CREATE TABLE IF NOT EXISTS Admins (
      username TEXT PRIMARY KEY,
      password TEXT NOT NULL
    );
  `);

  // Seed default admin if none exists
  const adminExists = await db.get(`SELECT username FROM Admins WHERE username = ?`, ['admin']);
  if (!adminExists) {
    const bcrypt = require('bcryptjs');
    const defaultPassword = process.env.ADMIN_DEFAULT_PASSWORD || 'admin';
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);
    await db.run(
      `INSERT INTO Admins (username, password) VALUES (?, ?)`,
      ['admin', hashedPassword]
    );
    console.log('[Database] Seeded default admin: admin / admin');
  }

  // Seed initial applications if empty
  const appCount = await db.get(`SELECT COUNT(*) as count FROM Applications`);
  if (appCount && appCount.count === 0) {
    const seedApps = [
      ['APP-0001', 'Aarav Sharma', '9876543210', 'Male', 'Mumbai', 'Maharashtra', 'Approved', '2026-10-01'],
      ['APP-0002', 'Priya Patel', '9123456789', 'Female', 'Ahmedabad', 'Gujarat', 'Pending', '2026-10-05'],
      ['APP-0003', 'Rohan Gupta', '9988776655', 'Male', 'Delhi', 'Delhi', 'Rejected', '2026-10-03'],
      ['APP-0004', 'Sneha Reddy', '9654321870', 'Female', 'Hyderabad', 'Telangana', 'Approved', '2026-10-07'],
      ['APP-0005', 'Vikram Singh', '9012345678', 'Male', 'Jaipur', 'Rajasthan', 'Pending', '2026-10-10'],
    ];

    for (const app of seedApps) {
      await db.run(
        `INSERT INTO Applications (applicationId, name, phone, gender, city, state, status, submittedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        app
      );
    }

    const seedCerts = [
      ['CERT-0001', 'APP-0001', 'Aarav Sharma', '9876543210', '2026-10-02', 'Valid'],
      ['CERT-0002', 'APP-0004', 'Sneha Reddy', '9654321870', '2026-10-08', 'Revoked'],
    ];

    for (const cert of seedCerts) {
      await db.run(
        `INSERT INTO Certificates (certificateId, applicationId, name, phone, issuedOn, status)
         VALUES (?, ?, ?, ?, ?, ?)`,
        cert
      );
    }
    console.log('[Database] Seeded initial applications and certificates');
  }
}

// Sequential ID Generators
async function generateNextApplicationId() {
  const rows = await db.all(`SELECT applicationId FROM Applications`);
  let maxNum = 0;
  for (const r of rows) {
    if (r.applicationId && r.applicationId.startsWith('APP-')) {
      const num = parseInt(r.applicationId.replace('APP-', ''), 10);
      if (!isNaN(num) && num > maxNum) maxNum = num;
    }
  }
  return `APP-${String(maxNum + 1).padStart(4, '0')}`;
}

async function generateNextCertificateId() {
  const rows = await db.all(`SELECT certificateId FROM Certificates`);
  let maxNum = 0;
  for (const r of rows) {
    if (r.certificateId && r.certificateId.startsWith('CERT-')) {
      const num = parseInt(r.certificateId.replace('CERT-', ''), 10);
      if (!isNaN(num) && num > maxNum) maxNum = num;
    }
  }
  return `CERT-${String(maxNum + 1).padStart(4, '0')}`;
}

module.exports = {
  db,
  initDb,
  generateNextApplicationId,
  generateNextCertificateId,
};
