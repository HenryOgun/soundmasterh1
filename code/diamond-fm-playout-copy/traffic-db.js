const initSqlJs = require('sql.js');
const path = require('path');
const fs   = require('fs');
const os   = require('os');

// Playout keeps its OWN local traffic DB — never shares with the Traffic Manager.
// Remote slots are synced into this DB via HTTP from the Traffic Manager.
function _electronDataPath(appName) {
  const home = os.homedir();
  if (process.platform === 'darwin') return path.join(home, 'Library', 'Application Support', appName);
  if (process.platform === 'win32')  return path.join(process.env.APPDATA || path.join(home, 'AppData', 'Roaming'), appName);
  return path.join(home, '.config', appName);
}

let DATA_DIR;
if (process.env.DIAMOND_DATA_DIR) {
  DATA_DIR = process.env.DIAMOND_DATA_DIR;
} else if (process.env.USER_DATA) {
  DATA_DIR = path.join(process.env.USER_DATA, 'data');
} else {
  // Always use Playout's own app-data folder — never touch the Traffic Manager's DB
  DATA_DIR = path.join(_electronDataPath('Diamond FM Playout'), 'data');
}

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
const dbPath = path.join(DATA_DIR, 'radio-traffic.db');
console.log('[traffic-db] Using DB at:', dbPath);

let _sqlDb = null;

function saveDb() {
  if (!_sqlDb) return;
  try { const data = _sqlDb.export(); fs.writeFileSync(dbPath, Buffer.from(data)); } catch {}
}
function saveDbAsync() {
  if (!_sqlDb) return;
  try { const data = _sqlDb.export(); fs.writeFile(dbPath, Buffer.from(data), () => {}); } catch {}
}
setInterval(saveDbAsync, 30000);
process.on('exit',        saveDb);
process.on('before-exit', saveDb);
process.on('SIGINT',  () => { saveDb(); process.exit(0); });
process.on('SIGTERM', () => { saveDb(); process.exit(0); });

// better-sqlite3 compatibility shim — same .prepare().get()/.run()/.all() API
const tdb = {
  prepare(sql) {
    return {
      run(...args) {
        const params = (args.length === 1 && Array.isArray(args[0])) ? args[0] : args;
        _sqlDb.run(sql, params.length ? params : undefined);
        const r = _sqlDb.exec('SELECT last_insert_rowid() as id');
        return { lastInsertRowid: r[0] ? r[0].values[0][0] : null, changes: 1 };
      },
      get(...args) {
        const params = (args.length === 1 && Array.isArray(args[0])) ? args[0] : args;
        const stmt = _sqlDb.prepare(sql);
        if (params.length) stmt.bind(params);
        const row = stmt.step() ? stmt.getAsObject() : undefined;
        stmt.free();
        return row;
      },
      all(...args) {
        const params = (args.length === 1 && Array.isArray(args[0])) ? args[0] : args;
        const stmt = _sqlDb.prepare(sql);
        if (params.length) stmt.bind(params);
        const rows = [];
        while (stmt.step()) rows.push(stmt.getAsObject());
        stmt.free();
        return rows;
      }
    };
  },
  exec(sql) { _sqlDb.exec(sql); },
  pragma(str) { try { _sqlDb.run(`PRAGMA ${str}`); } catch {} }
};

async function init() {
  const wasmPath = path.join(path.dirname(require.resolve('sql.js')), '..', 'dist', 'sql-wasm.wasm');
  const SQL = await initSqlJs({ wasmBinary: fs.readFileSync(wasmPath) });

  let data = null;
  if (fs.existsSync(dbPath)) {
    try { data = fs.readFileSync(dbPath); } catch {}
  }
  try {
    _sqlDb = data ? new SQL.Database(data) : new SQL.Database();
  } catch(e) {
    console.warn('[traffic-db] DB corrupt, deleting and recreating:', e.message);
    try { fs.unlinkSync(dbPath); } catch {}
    _sqlDb = new SQL.Database();
  }

  tdb.pragma('foreign_keys = ON');

  tdb.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      name       TEXT NOT NULL,
      email      TEXT UNIQUE NOT NULL,
      password   TEXT NOT NULL,
      role       TEXT NOT NULL DEFAULT 'sales',
      active     INTEGER DEFAULT 1,
      created_at INTEGER DEFAULT (strftime('%s','now'))
    );
    CREATE TABLE IF NOT EXISTS station_settings (
      key   TEXT PRIMARY KEY,
      value TEXT
    );
    CREATE TABLE IF NOT EXISTS clients (
      id             INTEGER PRIMARY KEY AUTOINCREMENT,
      name           TEXT NOT NULL,
      contact_person TEXT,
      phone          TEXT,
      email          TEXT,
      address        TEXT,
      industry       TEXT,
      agency_id      INTEGER,
      agent_id       INTEGER,
      notes          TEXT,
      active         INTEGER DEFAULT 1,
      created_at     INTEGER DEFAULT (strftime('%s','now'))
    );
    CREATE TABLE IF NOT EXISTS agencies (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      name            TEXT NOT NULL,
      contact_person  TEXT,
      phone           TEXT,
      email           TEXT,
      address         TEXT,
      commission_rate REAL DEFAULT 0,
      active          INTEGER DEFAULT 1,
      created_at      INTEGER DEFAULT (strftime('%s','now'))
    );
    CREATE TABLE IF NOT EXISTS agents (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      name            TEXT NOT NULL,
      phone           TEXT,
      email           TEXT,
      commission_rate REAL DEFAULT 0,
      active          INTEGER DEFAULT 1,
      created_at      INTEGER DEFAULT (strftime('%s','now'))
    );
    CREATE TABLE IF NOT EXISTS rate_cards (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      name        TEXT NOT NULL,
      type        TEXT NOT NULL DEFAULT 'spot',
      duration    INTEGER DEFAULT 30,
      rate        REAL NOT NULL DEFAULT 0,
      description TEXT,
      active      INTEGER DEFAULT 1,
      created_at  INTEGER DEFAULT (strftime('%s','now'))
    );
    CREATE TABLE IF NOT EXISTS orders (
      id                INTEGER PRIMARY KEY AUTOINCREMENT,
      order_number      TEXT UNIQUE NOT NULL,
      client_id         INTEGER NOT NULL,
      agency_id         INTEGER,
      agent_id          INTEGER,
      start_date        TEXT NOT NULL,
      end_date          TEXT NOT NULL,
      total_spots       INTEGER DEFAULT 0,
      total_amount      REAL DEFAULT 0,
      agency_commission REAL DEFAULT 0,
      agent_commission  REAL DEFAULT 0,
      status            TEXT DEFAULT 'active',
      notes             TEXT,
      created_by        INTEGER,
      created_at        INTEGER DEFAULT (strftime('%s','now'))
    );
    CREATE TABLE IF NOT EXISTS order_items (
      id             INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id       INTEGER NOT NULL,
      rate_card_id   INTEGER,
      description    TEXT,
      spots          INTEGER DEFAULT 1,
      duration       INTEGER DEFAULT 30,
      unit_rate      REAL NOT NULL DEFAULT 0,
      total_rate     REAL NOT NULL DEFAULT 0,
      days           TEXT DEFAULT '[]',
      time_slots     TEXT DEFAULT '[]',
      material_title TEXT,
      material_ref   TEXT,
      created_at     INTEGER DEFAULT (strftime('%s','now'))
    );
    CREATE TABLE IF NOT EXISTS schedule_slots (
      id             INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id       INTEGER,
      order_item_id  INTEGER,
      client_id      INTEGER,
      air_date       TEXT NOT NULL,
      air_time       TEXT NOT NULL,
      duration       INTEGER DEFAULT 30,
      material_title TEXT,
      material_ref   TEXT,
      status         TEXT DEFAULT 'scheduled',
      notes          TEXT,
      created_at     INTEGER DEFAULT (strftime('%s','now'))
    );
    CREATE TABLE IF NOT EXISTS invoices (
      id             INTEGER PRIMARY KEY AUTOINCREMENT,
      invoice_number TEXT UNIQUE NOT NULL,
      order_id       INTEGER,
      client_id      INTEGER NOT NULL,
      issue_date     TEXT NOT NULL,
      due_date       TEXT NOT NULL,
      subtotal       REAL DEFAULT 0,
      vat_rate       REAL DEFAULT 0,
      vat_amount     REAL DEFAULT 0,
      total          REAL DEFAULT 0,
      paid_amount    REAL DEFAULT 0,
      balance        REAL DEFAULT 0,
      status         TEXT DEFAULT 'unpaid',
      notes          TEXT,
      created_at     INTEGER DEFAULT (strftime('%s','now'))
    );
    CREATE TABLE IF NOT EXISTS payments (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      invoice_id   INTEGER NOT NULL,
      client_id    INTEGER NOT NULL,
      amount       REAL NOT NULL,
      payment_date TEXT NOT NULL,
      method       TEXT DEFAULT 'cash',
      reference    TEXT,
      notes        TEXT,
      created_at   INTEGER DEFAULT (strftime('%s','now'))
    );
  `);

  // Schema migrations
  const addCol = (sql) => { try { _sqlDb.exec(sql); } catch {} };
  addCol('ALTER TABLE orders ADD COLUMN week_pattern TEXT DEFAULT "all"');
  addCol('ALTER TABLE orders ADD COLUMN product_type TEXT');
  addCol('ALTER TABLE orders ADD COLUMN day_parts TEXT DEFAULT "[]"');
  addCol('ALTER TABLE orders ADD COLUMN material_title TEXT');
  addCol('ALTER TABLE orders ADD COLUMN audio_cut TEXT');
  addCol('ALTER TABLE orders ADD COLUMN material_ref TEXT');
  addCol('ALTER TABLE orders ADD COLUMN spots_per_day INTEGER');
  addCol('ALTER TABLE orders ADD COLUMN day_schedule TEXT');
  addCol('ALTER TABLE orders ADD COLUMN specific_dates TEXT');
  addCol('ALTER TABLE orders ADD COLUMN schedule_mode TEXT DEFAULT "days"');
  addCol('ALTER TABLE order_items ADD COLUMN break_position TEXT DEFAULT "any"');
  addCol('ALTER TABLE order_items ADD COLUMN audio_cut TEXT');
  addCol('ALTER TABLE schedule_slots ADD COLUMN day_part TEXT');
  addCol('ALTER TABLE schedule_slots ADD COLUMN break_position TEXT DEFAULT "any"');
  addCol('ALTER TABLE schedule_slots ADD COLUMN audio_cut TEXT');
  addCol('ALTER TABLE schedule_slots ADD COLUMN break_number INTEGER DEFAULT 1');
  addCol('ALTER TABLE schedule_slots ADD COLUMN product_type TEXT');
  addCol('ALTER TABLE schedule_slots ADD COLUMN remote_synced INTEGER DEFAULT 0');
  addCol('ALTER TABLE schedule_slots ADD COLUMN remote_id INTEGER');
  addCol('ALTER TABLE schedule_slots ADD COLUMN played_at TEXT');
  addCol('ALTER TABLE station_settings ADD COLUMN IF NOT EXISTS key TEXT');
  try { _sqlDb.exec('DROP INDEX IF EXISTS idx_slots_remote_id'); } catch {}
  try { _sqlDb.exec('CREATE UNIQUE INDEX IF NOT EXISTS idx_slots_remote_id ON schedule_slots(remote_id)'); } catch {}
  // Ensure remote_traffic_url setting exists
  try { tdb.prepare('INSERT OR IGNORE INTO station_settings (key,value) VALUES (?,?)').run('remote_traffic_url', ''); } catch {}
  // On startup: reset 'aired' slots whose scheduled time is still in the future.
  // - remote_synced=1: TM is the source of truth — doRemoteSync will restore correct statuses.
  // - remote_synced=0 WITHOUT played_at: stale ghost rows from old sessions — safe to reset.
  // - remote_synced=0 WITH played_at: legitimately played THIS session — keep as aired.
  // Use JS Date for local time (avoids SQLite localtime issues on Windows).
  try {
    const _n = new Date();
    const _td = `${_n.getFullYear()}-${String(_n.getMonth()+1).padStart(2,'0')}-${String(_n.getDate()).padStart(2,'0')}`;
    const _tm = `${String(_n.getHours()).padStart(2,'0')}:${String(_n.getMinutes()).padStart(2,'0')}`;
    tdb.prepare(
      "UPDATE schedule_slots SET status='scheduled' WHERE status='aired' " +
      "AND (remote_synced=1 OR played_at IS NULL) " +
      "AND (air_date > ? OR (air_date = ? AND substr(air_time,1,5) > ?))"
    ).run(_td, _td, _tm);
  } catch {}

  tdb.exec(`
    CREATE TABLE IF NOT EXISTS log_templates (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      name        TEXT NOT NULL,
      description TEXT,
      type        TEXT DEFAULT 'standard',
      active      INTEGER DEFAULT 1,
      created_at  INTEGER DEFAULT (strftime('%s','now'))
    );
    CREATE TABLE IF NOT EXISTS template_breaks (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      template_id  INTEGER NOT NULL,
      break_number INTEGER NOT NULL,
      break_time   TEXT NOT NULL,
      duration     INTEGER DEFAULT 300,
      day_part     TEXT,
      fill_rule    TEXT DEFAULT 'sequential',
      notes        TEXT
    );
    CREATE TABLE IF NOT EXISTS day_parts (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      name       TEXT NOT NULL,
      start_time TEXT NOT NULL,
      end_time   TEXT NOT NULL,
      sort_order INTEGER DEFAULT 0
    );
  `);

  // Seed default day parts
  if (!tdb.prepare('SELECT COUNT(*) as c FROM day_parts').get().c) {
    const dp = tdb.prepare('INSERT INTO day_parts (name,start_time,end_time,sort_order) VALUES (?,?,?,?)');
    dp.run('Overnight','00:00','05:00',0);
    dp.run('Morning Drive','05:00','10:00',1);
    dp.run('Midday','10:00','14:00',2);
    dp.run('Afternoon Drive','14:00','19:00',3);
    dp.run('Evening','19:00','23:59',4);
  }

  // Seed default admin
  const bcrypt = require('bcryptjs');
  if (!tdb.prepare("SELECT id FROM users WHERE role='admin'").get()) {
    const hash = bcrypt.hashSync('8701Login', 10);
    tdb.prepare('INSERT OR IGNORE INTO users (name,email,password,role) VALUES (?,?,?,?)').run('Administrator', 'admin@station.com', hash, 'admin');
  }

  // Default settings
  [
    ['station_name', 'Diamond FM'],
    ['station_address', ''],
    ['station_phone', ''],
    ['station_email', ''],
    ['currency', 'NGN'],
    ['vat_rate', '7.5'],
  ].forEach(([k, v]) => tdb.prepare('INSERT OR IGNORE INTO station_settings (key,value) VALUES (?,?)').run(k, v));

  // Backfill client_id on slots logged without one — match via audio_cut, material_ref, or title
  try {
    const unlinked = tdb.prepare("SELECT id, audio_cut, material_ref, material_title FROM schedule_slots WHERE client_id IS NULL").all();
    const fix = tdb.prepare("UPDATE schedule_slots SET client_id=? WHERE id=?");
    for (const s of unlinked) {
      const match = tdb.prepare(
        "SELECT client_id FROM orders WHERE (audio_cut=? OR material_ref=? OR material_title=?) ORDER BY CASE status WHEN 'active' THEN 0 ELSE 1 END, id DESC LIMIT 1"
      ).get(s.audio_cut||'', s.material_ref||'', s.material_title||'');
      if (match?.client_id) fix.run(match.client_id, s.id);
    }
  } catch {}

  saveDb();
  return tdb;
}

tdb.init = init;
module.exports = tdb;
