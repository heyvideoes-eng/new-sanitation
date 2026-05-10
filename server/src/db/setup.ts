import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = path.resolve(__dirname, '../../data/saaf.db');

if (!fs.existsSync(path.dirname(dbPath))) {
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
}

export const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

export const initDB = async () => {
  // Drop tables to apply schema changes (Destructive re-seed)
  db.exec('PRAGMA foreign_keys = OFF');
  db.exec(`
    DROP TABLE IF EXISTS facilities;
    DROP TABLE IF EXISTS users;
    DROP TABLE IF EXISTS cleaners;
    DROP TABLE IF EXISTS stall_status;
    DROP TABLE IF EXISTS sensor_readings;
    DROP TABLE IF EXISTS cleanliness_status;
    DROP TABLE IF EXISTS maintenance_tasks;
    DROP TABLE IF EXISTS crowd_queue;
    DROP TABLE IF EXISTS budget_log;
    DROP TABLE IF EXISTS predicted_rush;
    DROP TABLE IF EXISTS user_feedback;
    DROP TABLE IF EXISTS inspection_reports;
    DROP TABLE IF EXISTS photos;
  `);
  db.exec('PRAGMA foreign_keys = ON');

  // Create Tables
  db.exec(`
    CREATE TABLE facilities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      location TEXT NOT NULL,
      address TEXT,
      type TEXT,
      total_stalls INTEGER NOT NULL,
      lat REAL,
      lng REAL,
      rating REAL DEFAULT 5.0,
      review_count INTEGER DEFAULT 0,
      status TEXT DEFAULT 'OPEN',
      hours TEXT,
      source_tag TEXT,
      ward_number TEXT,
      zone TEXT,
      owning_agency TEXT,
      contractor_name TEXT,
      contract_type TEXT,
      compliance_score REAL DEFAULT 100,
      is_active INTEGER DEFAULT 1
    );

    CREATE TABLE users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT CHECK(role IN ('admin', 'inspector')) DEFAULT 'admin',
      name TEXT
    );

    CREATE TABLE cleaners (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cleaner_id TEXT UNIQUE NOT NULL,
      pin_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT DEFAULT 'cleaner',
      assigned_zone TEXT
    );

    CREATE TABLE stall_status (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      facility_id INTEGER,
      stall_number INTEGER,
      is_occupied INTEGER DEFAULT 0,
      last_updated TEXT,
      FOREIGN KEY (facility_id) REFERENCES facilities(id)
    );

    CREATE TABLE sensor_readings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      facility_id INTEGER,
      ammonia_level REAL,
      humidity REAL,
      floor_wet INTEGER DEFAULT 0,
      flush_count INTEGER DEFAULT 0,
      tissue_level REAL,
      soap_level REAL,
      timestamp TEXT,
      FOREIGN KEY (facility_id) REFERENCES facilities(id)
    );

    CREATE TABLE cleanliness_status (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      facility_id INTEGER,
      status TEXT CHECK(status IN ('GREEN', 'AMBER', 'RED')),
      reason TEXT,
      updated_at TEXT,
      FOREIGN KEY (facility_id) REFERENCES facilities(id)
    );

    CREATE TABLE maintenance_tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      facility_id INTEGER,
      status TEXT CHECK(status IN ('PENDING', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED')),
      priority TEXT CHECK(priority IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')) DEFAULT 'MEDIUM',
      issue_reason TEXT,
      description TEXT,
      created_at TEXT,
      started_at TEXT,
      completed_at TEXT,
      assigned_to TEXT,
      cost_estimate REAL,
      verification_photo TEXT,
      location_coords TEXT,
      FOREIGN KEY (facility_id) REFERENCES facilities(id)
    );

    CREATE TABLE budget_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      task_id INTEGER,
      facility_id INTEGER,
      amount REAL,
      category TEXT, -- 'cleaning', 'repair', 'supplies'
      description TEXT,
      created_at TEXT,
      FOREIGN KEY (task_id) REFERENCES maintenance_tasks(id),
      FOREIGN KEY (facility_id) REFERENCES facilities(id)
    );

    CREATE TABLE crowd_queue (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      facility_id INTEGER,
      current_users INTEGER,
      wait_time_mins REAL,
      pressure_level TEXT,
      timestamp TEXT,
      FOREIGN KEY (facility_id) REFERENCES facilities(id)
    );

    CREATE TABLE user_feedback (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      facility_id INTEGER,
      rating INTEGER,
      issue_type TEXT,
      comment TEXT,
      lat REAL,
      lng REAL,
      photo_url TEXT,
      source TEXT DEFAULT 'citizen', -- 'citizen', 'inspector'
      timestamp TEXT,
      FOREIGN KEY (facility_id) REFERENCES facilities(id)
    );

    CREATE TABLE inspection_reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      facility_id INTEGER,
      inspector_id INTEGER,
      score REAL,
      checklist_json TEXT, -- detailed results
      notes TEXT,
      status TEXT DEFAULT 'COMPLETED',
      created_at TEXT,
      FOREIGN KEY (facility_id) REFERENCES facilities(id),
      FOREIGN KEY (inspector_id) REFERENCES users(id)
    );

    CREATE TABLE photos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      facility_id INTEGER,
      task_id INTEGER,
      feedback_id INTEGER,
      url TEXT NOT NULL,
      lat REAL,
      lng REAL,
      note TEXT,
      created_at TEXT,
      FOREIGN KEY (facility_id) REFERENCES facilities(id),
      FOREIGN KEY (task_id) REFERENCES maintenance_tasks(id),
      FOREIGN KEY (feedback_id) REFERENCES user_feedback(id)
    );

    CREATE TABLE predicted_rush (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      facility_id INTEGER,
      predicted_at TEXT,
      surge_in_mins REAL,
      confidence_pct REAL,
      source TEXT,
      FOREIGN KEY (facility_id) REFERENCES facilities(id)
    );
  `);

  console.log('Database schema initialized');
  await seedDB();
};

const seedDB = async () => {
  // Always clear and re-seed for this update to ensure schema consistency
  console.log('Re-seeding database with Dehradun real-world data...');
  
  db.exec('PRAGMA foreign_keys = OFF');
  db.exec('DELETE FROM facilities');
  db.exec('DELETE FROM stall_status');
  db.exec('DELETE FROM sensor_readings');
  db.exec('DELETE FROM cleanliness_status');
  db.exec('DELETE FROM maintenance_tasks');
  db.exec('DELETE FROM crowd_queue');
  db.exec('DELETE FROM budget_log');
  db.exec('DELETE FROM predicted_rush');
  db.exec('DELETE FROM user_feedback');
  db.exec('PRAGMA foreign_keys = ON');

  // Seed Admin and Inspector
  const adminPass = await bcrypt.hash('Admin@123', 10);
  const inspectorPass = await bcrypt.hash('Inspector@123', 10);
  
  db.prepare('INSERT OR IGNORE INTO users (username, password_hash, name, role) VALUES (?, ?, ?, ?)').run(
    'admin@saaf.local', adminPass, 'System Administrator', 'admin'
  );
  db.prepare('INSERT OR IGNORE INTO users (username, password_hash, name, role) VALUES (?, ?, ?, ?)').run(
    'inspector@saaf.local', inspectorPass, 'Ward Inspector', 'inspector'
  );

  // Seed Cleaners
  const c1Pin = await bcrypt.hash('1234', 10);
  const c2Pin = await bcrypt.hash('5678', 10);
  db.prepare('INSERT OR IGNORE INTO cleaners (cleaner_id, pin_hash, name, assigned_zone) VALUES (?, ?, ?, ?)').run(
    'CLEANER1', c1Pin, 'Ram Kumar', 'Zone A - Platform'
  );
  db.prepare('INSERT OR IGNORE INTO cleaners (cleaner_id, pin_hash, name, assigned_zone) VALUES (?, ?, ?, ?)').run(
    'CLEANER2', c2Pin, 'Sunita Devi', 'Zone B - Food Court'
  );

  const insertFacility = db.prepare(`
    INSERT INTO facilities (name, location, address, type, total_stalls, lat, lng, rating, review_count, status, hours, source_tag, ward_number, zone, owning_agency, contractor_name, contract_type)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const dehradunFacilities = [
    ['SBM Toilet – Old Cantt Market', 'Old Cantt Market', 'Quarter Deck Rd, Bharuwala Colony, Clement Town, Uttarakhand 248002', 'public', 12, 30.2705, 78.0055, 4.5, 12, 'OPEN', 'Open · Closes 12 am', 'SBM / Field survey', 'Ward 18', 'Clement Town', 'Cantonment Board', 'CleanCity Pvt Ltd', 'Direct ULB'],
    ['SBM Toilet – Quarter Deck Market', 'Quarter Deck Market', 'Market, Quarter Deck Rd, New Cantt, Bharuwala Colony, Clement Town, Dehradun, Uttarakhand 248002', 'public', 8, 30.2710, 78.0060, 3.8, 5, 'OPEN', 'Open · Closes 12 am', 'SBM / Field survey', 'Ward 18', 'Clement Town', 'Cantonment Board', 'CleanCity Pvt Ltd', 'Direct ULB'],
    ['SBM Toilet – ISBT Flyover', 'ISBT Flyover', '22, ISBT Flyover, near ISBT Flyover, ISBT, Morowala, Subhash Nagar, Shewala Kala, Uttarakhand 248171', 'transport', 24, 30.2850, 77.9980, 4.0, 32, 'OPEN', 'Hours not specified', 'ISBT flyover', 'Ward 12', 'Transport Corridor', 'Nagar Nigam Dehradun', 'EcoSan Solutions', 'PPP Model'],
    ['SBM Toilet – Highway Corridor', 'Near ISBT', 'Ambala–Dehradun–Rishikesh Rd, near ISBT, Morowala, Majra, Dehradun, Uttarakhand 248002', 'transport', 32, 30.2860, 77.9970, 3.4, 45, 'OPEN', 'Open 24 hours', 'Highway corridor', 'Ward 12', 'Transport Corridor', 'Nagar Nigam Dehradun', 'EcoSan Solutions', 'SBM-U 2.0'],
  ];

  for (const f of dehradunFacilities) {
    const info = insertFacility.run(...f);
    const facilityId = info.lastInsertRowid;

    // Initial stall status
    for (let i = 1; i <= (f[4] as number); i++) {
      db.prepare('INSERT INTO stall_status (facility_id, stall_number, is_occupied, last_updated) VALUES (?, ?, ?, ?)')
        .run(facilityId, i, 0, new Date().toISOString());
    }

    // Initial cleanliness status
    db.prepare('INSERT INTO cleanliness_status (facility_id, status, reason, updated_at) VALUES (?, ?, ?, ?)')
      .run(facilityId, 'GREEN', 'System Reset', new Date().toISOString());
      
    // Initial crowd queue
    db.prepare('INSERT INTO crowd_queue (facility_id, current_users, wait_time_mins, pressure_level, timestamp) VALUES (?, ?, ?, ?, ?)')
      .run(facilityId, Math.floor(Math.random() * 5), Math.floor(Math.random() * 5), 'LOW', new Date().toISOString());

    // Sample Inspection
    db.prepare(`
      INSERT INTO inspection_reports (facility_id, inspector_id, score, checklist_json, notes, created_at)
      VALUES (?, (SELECT id FROM users WHERE role = 'inspector' LIMIT 1), ?, ?, ?, ?)
    `).run(
      facilityId, 
      85 + Math.random() * 10, 
      JSON.stringify({ water: true, lighting: true, smell: 'low', bins: true }),
      'Routine inspection – all systems functional.',
      new Date().toISOString()
    );

    // Sample Feedback
    db.prepare(`
      INSERT INTO user_feedback (facility_id, rating, issue_type, comment, timestamp)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      facilityId,
      4 + Math.floor(Math.random() * 2),
      'None',
      'Very clean and well maintained.',
      new Date().toISOString()
    );
  }

  // Sample Budget Logs for the past 7 days
  const now = new Date();
  const facilityIds = db.prepare('SELECT id FROM facilities').all() as { id: number }[];
  
  for (let d = 7; d >= 0; d--) {
    const date = new Date(now.getTime() - d * 24 * 60 * 60 * 1000);
    for (const { id } of facilityIds) {
      if (Math.random() > 0.5) {
        const amount = 500 + Math.random() * 1000;
        db.prepare(`
          INSERT INTO budget_log (facility_id, amount, category, description, created_at)
          VALUES (?, ?, ?, ?, ?)
        `).run(
          id,
          amount,
          Math.random() > 0.5 ? 'cleaning' : 'supplies',
          'Periodic maintenance and resource refill.',
          date.toISOString()
        );
      }
    }
  }

  console.log('Database seeded successfully with rich Dehradun data and interactive history');
};
