const Database = require('better-sqlite3');
const db = new Database('links.db');

function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS tracked_links (
      id TEXT PRIMARY KEY,
      original_url TEXT NOT NULL,
      created_by TEXT NOT NULL,
      created_at INTEGER NOT NULL
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS click_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      link_id TEXT NOT NULL,
      discord_user_id TEXT NOT NULL,
      discord_username TEXT NOT NULL,
      discord_discriminator TEXT,
      discord_avatar TEXT,
      ip_address TEXT,
      user_agent TEXT,
      timestamp INTEGER NOT NULL,
      FOREIGN KEY (link_id) REFERENCES tracked_links(id)
    )
  `);

  console.log('✅ Database initialized');
}

function createLink(id, originalUrl, createdBy) {
  const stmt = db.prepare(`
    INSERT INTO tracked_links (id, original_url, created_by, created_at)
    VALUES (?, ?, ?, ?)
  `);
  return stmt.run(id, originalUrl, createdBy, Date.now());
}

function getLink(id) {
  const stmt = db.prepare('SELECT * FROM tracked_links WHERE id = ?');
  return stmt.get(id);
}

function getLinkByUrl(url) {
  const stmt = db.prepare('SELECT * FROM tracked_links WHERE original_url = ?');
  return stmt.get(url);
}

function logClick(linkId, discordData, ipAddress, userAgent) {
  const stmt = db.prepare(`
    INSERT INTO click_logs (
      link_id, discord_user_id, discord_username, 
      discord_discriminator, discord_avatar, 
      ip_address, user_agent, timestamp
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  return stmt.run(
    linkId,
    discordData.id,
    discordData.username,
    discordData.discriminator || null,
    discordData.avatar,
    ipAddress,
    userAgent,
    Date.now()
  );
}

function getClickStats(linkId) {
  const stmt = db.prepare(`
    SELECT * FROM click_logs 
    WHERE link_id = ? 
    ORDER BY timestamp DESC
  `);
  return stmt.all(linkId);
}

function getAllLinks() {
  const stmt = db.prepare('SELECT * FROM tracked_links ORDER BY created_at DESC');
  return stmt.all();
}

module.exports = {
  initDatabase,
  createLink,
  getLink,
  getLinkByUrl,
  logClick,
  getClickStats,
  getAllLinks
};