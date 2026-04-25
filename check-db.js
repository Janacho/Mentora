const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

const db = new Database(path.join(__dirname, 'dev.db'));

async function main() {
  const users = db.prepare('SELECT email, role, password FROM "User"').all();
  console.log('=== USERS ===');
  for (const u of users) {
    const hasPwd = !!u.password;
    let match = 'n/a';
    if (hasPwd) {
      const m1 = await bcrypt.compare('alumno123', u.password);
      const m2 = await bcrypt.compare('tutor123', u.password);
      match = m1 ? 'alumno123' : m2 ? 'tutor123' : 'NO_MATCH';
    }
    console.log(`${u.email} | ${u.role} | pwd:${hasPwd} | match:${match}`);
  }

  const admins = db.prepare('SELECT email, password FROM "AdminUser"').all();
  console.log('\n=== ADMIN USERS ===');
  for (const a of admins) {
    const ok = a.password ? await bcrypt.compare('admin123', a.password) : false;
    console.log(`${a.email} | pwd:${!!a.password} | match:${ok ? 'admin123' : 'NO_MATCH'}`);
  }
}

main().catch(console.error);
