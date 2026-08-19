'use strict';

const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'fintrack.db');

const db = new Database(DB_PATH);

db.pragma('journal_mode = WAL');

// ─────────────────────────────────────────────────────────────
// DATABASE TABLES
// ─────────────────────────────────────────────────────────────

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    note TEXT NOT NULL DEFAULT '',
    category TEXT NOT NULL DEFAULT '',
    date TEXT NOT NULL DEFAULT '',
    type TEXT NOT NULL DEFAULT '',
    amount REAL NOT NULL DEFAULT 0,
    recurring INTEGER NOT NULL DEFAULT 0,
    mark TEXT NOT NULL DEFAULT '',
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
  
  CREATE TABLE IF NOT EXISTS budgets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      category TEXT NOT NULL DEFAULT '',
      budget_limit REAL NOT NULL DEFAULT 0,
      FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS goals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL DEFAULT '',
    current REAL NOT NULL DEFAULT 0,
    target REAL NOT NULL DEFAULT 0,
    targetDate TEXT NOT NULL DEFAULT '',
    color TEXT NOT NULL DEFAULT '',
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL UNIQUE,
    name TEXT NOT NULL DEFAULT '',
    email TEXT NOT NULL DEFAULT '',
    currency TEXT NOT NULL DEFAULT 'INR',
    darkTheme INTEGER NOT NULL DEFAULT 1,
    budgetAlerts INTEGER NOT NULL DEFAULT 1,
    paymentReminders INTEGER NOT NULL DEFAULT 1,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
`);

// ─────────────────────────────────────────────────────────────
// CREATE NEW USER
// ─────────────────────────────────────────────────────────────

function createUser(name, email, phone) {
  const existingUser = db
    .prepare('SELECT * FROM users WHERE email = ?')
    .get(email);

  if (existingUser) {
    return existingUser;
  }

  const result = db
    .prepare(`
      INSERT INTO users (name, email, phone)
      VALUES (?, ?, ?)
    `)
    .run(name, email, phone);

  const userId = result.lastInsertRowid;

  // Create empty settings for this user
  db.prepare(`
    INSERT INTO settings
    (user_id, name, email, currency, darkTheme, budgetAlerts, paymentReminders)
    VALUES (?, ?, ?, 'INR', 1, 1, 1)
  `).run(userId, name, email);

  return db
    .prepare('SELECT * FROM users WHERE id = ?')
    .get(userId);
}

// ─────────────────────────────────────────────────────────────
// GET USER
// ─────────────────────────────────────────────────────────────

function getUserByEmail(email) {
  return db
    .prepare('SELECT * FROM users WHERE email = ?')
    .get(email);
}

// ─────────────────────────────────────────────────────────────
// RESET USER DATA
// ─────────────────────────────────────────────────────────────

function resetUserData(userId) {
  const transaction = db.transaction(() => {
    db.prepare(
      'DELETE FROM transactions WHERE user_id = ?'
    ).run(userId);

    db.prepare(
      'DELETE FROM budgets WHERE user_id = ?'
    ).run(userId);

    db.prepare(
      'DELETE FROM goals WHERE user_id = ?'
    ).run(userId);

    // Keep profile details but reset preferences
    const user = db
      .prepare('SELECT name, email FROM users WHERE id = ?')
      .get(userId);

    if (user) {
      db.prepare(`
        UPDATE settings
        SET
          name = ?,
          email = ?,
          currency = 'INR',
          darkTheme = 1,
          budgetAlerts = 1,
          paymentReminders = 1
        WHERE user_id = ?
      `).run(
        user.name,
        user.email,
        userId
      );
    }
  });

  transaction();

  console.log(`[db] Data reset for user ${userId}`);
}

// ─────────────────────────────────────────────────────────────
// INITIALIZE DATABASE
// ─────────────────────────────────────────────────────────────

function initDb() {
  console.log('[db] Database ready:', DB_PATH);
}

// ─────────────────────────────────────────────────────────────

module.exports = {
  db,
  initDb,
  createUser,
  getUserByEmail,
  resetUserData,
};