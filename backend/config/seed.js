import db, { initDb } from './db.js';
import bcrypt from 'bcryptjs';

async function seedDatabase() {
  initDb();
  console.log('Seeding military asset management database...');

  // 1. Clear existing data
  db.prepare('DELETE FROM audit_logs').run();
  db.prepare('DELETE FROM expenditures').run();
  db.prepare('DELETE FROM assignments').run();
  db.prepare('DELETE FROM transfers').run();
  db.prepare('DELETE FROM purchases').run();
  db.prepare('DELETE FROM equipment_types').run();
  db.prepare('DELETE FROM users').run();
  db.prepare('DELETE FROM bases').run();

  // Reset auto-increments
  db.prepare("DELETE FROM sqlite_sequence").run();

  // 2. Insert Bases
  const insertBase = db.prepare('INSERT INTO bases (name, location, code) VALUES (?, ?, ?)');
  const base1 = insertBase.run('Fort Alpha Command', 'Sector 7, Nevada', 'FA-01');
  const base2 = insertBase.run('Fort Bravo Forward Base', 'North Ridge, Alaska', 'FB-02');
  const base3 = insertBase.run('Vanguard Outpost Delta', 'Bialystok Regional Garrison', 'VO-03');

  const base1Id = base1.lastInsertRowid;
  const base2Id = base2.lastInsertRowid;
  const base3Id = base3.lastInsertRowid;

  // 3. Insert Users
  const salt = await bcrypt.genSalt(10);
  const adminPass = await bcrypt.hash('AdminPass123!', salt);
  const cmdPass = await bcrypt.hash('CommandPass123!', salt);
  const logPass = await bcrypt.hash('LogisticsPass123!', salt);

  const insertUser = db.prepare(`
    INSERT INTO users (username, password_hash, role, base_id, full_name, rank)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const admin = insertUser.run('admin_user', adminPass, 'ADMIN', null, 'General Arthur Vance', 'General of the Army');
  const commander1 = insertUser.run('commander_alpha', cmdPass, 'BASE_COMMANDER', base1Id, 'Col. Sarah Jenkins', 'Colonel');
  const commander2 = insertUser.run('commander_bravo', cmdPass, 'BASE_COMMANDER', base2Id, 'Lt. Col. Marcus Vance', 'Lieutenant Colonel');
  const logistics = insertUser.run('logistics_officer', logPass, 'LOGISTICS_OFFICER', base1Id, 'Capt. David Miller', 'Captain');

  // 4. Insert Equipment Types
  const insertEq = db.prepare(`
    INSERT INTO equipment_types (name, category, model_number, unit_of_measure)
    VALUES (?, ?, ?, ?)
  `);

  const eqM4 = insertEq.run('M4A1 Carbine', 'WEAPON', 'M4A1-5.56', 'RIFLES');
  const eqHumvee = insertEq.run('HMMWV M1114 Armored Vehicle', 'VEHICLE', 'M1114-UAH', 'VEHICLES');
  const eqAmmo556 = insertEq.run('5.56x45mm NATO Ammunition', 'AMMUNITION', 'M855-556', 'ROUNDS');
  const eqNVG = insertEq.run('AN/PVS-14 Night Vision Monocular', 'EQUIPMENT', 'PVS-14', 'UNITS');
  const eqJavelin = insertEq.run('FGM-148 Javelin Missile System', 'WEAPON', 'FGM-148F', 'SYSTEMS');

  const eqM4Id = eqM4.lastInsertRowid;
  const eqHumveeId = eqHumvee.lastInsertRowid;
  const eqAmmo556Id = eqAmmo556.lastInsertRowid;
  const eqNVGId = eqNVG.lastInsertRowid;
  const eqJavelinId = eqJavelin.lastInsertRowid;

  // 5. Insert Historical Purchases
  const insertPurchase = db.prepare(`
    INSERT INTO purchases (base_id, equipment_type_id, quantity, unit_cost, supplier, date, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  // Fort Alpha purchases
  insertPurchase.run(base1Id, eqM4Id, 250, 1200.00, 'Colt Defense LLC', '2026-01-10 09:00:00', logistics.lastInsertRowid);
  insertPurchase.run(base1Id, eqHumveeId, 30, 220000.00, 'AM General', '2026-01-12 11:30:00', logistics.lastInsertRowid);
  insertPurchase.run(base1Id, eqAmmo556Id, 50000, 0.45, 'Federal Cartridge Co.', '2026-01-15 14:00:00', logistics.lastInsertRowid);
  insertPurchase.run(base1Id, eqNVGId, 120, 3400.00, 'L3Harris Technologies', '2026-01-18 10:15:00', logistics.lastInsertRowid);
  insertPurchase.run(base1Id, eqJavelinId, 15, 175000.00, 'Raytheon Lockheed Martin', '2026-01-20 16:45:00', logistics.lastInsertRowid);

  // Fort Bravo purchases
  insertPurchase.run(base2Id, eqM4Id, 180, 1200.00, 'Colt Defense LLC', '2026-01-11 08:30:00', admin.lastInsertRowid);
  insertPurchase.run(base2Id, eqHumveeId, 20, 220000.00, 'AM General', '2026-01-14 13:20:00', admin.lastInsertRowid);
  insertPurchase.run(base2Id, eqAmmo556Id, 35000, 0.45, 'Federal Cartridge Co.', '2026-01-16 15:10:00', admin.lastInsertRowid);
  insertPurchase.run(base2Id, eqNVGId, 80, 3400.00, 'L3Harris Technologies', '2026-01-19 12:00:00', admin.lastInsertRowid);

  // Vanguard Outpost Delta purchases
  insertPurchase.run(base3Id, eqM4Id, 90, 1200.00, 'Colt Defense LLC', '2026-01-13 10:00:00', admin.lastInsertRowid);
  insertPurchase.run(base3Id, eqAmmo556Id, 20000, 0.45, 'Federal Cartridge Co.', '2026-01-17 09:30:00', admin.lastInsertRowid);

  // 6. Insert Cross-Base Transfers
  const insertTransfer = db.prepare(`
    INSERT INTO transfers (source_base_id, destination_base_id, equipment_type_id, quantity, status, notes, timestamp, initiated_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertTransfer.run(base1Id, base2Id, eqM4Id, 30, 'COMPLETED', 'Tactical deployment reinforcement for Arctic Division', '2026-02-01 10:00:00', logistics.lastInsertRowid);
  insertTransfer.run(base1Id, base2Id, eqAmmo556Id, 10000, 'COMPLETED', 'Quarterly ammunition allocation rebalance', '2026-02-03 14:30:00', logistics.lastInsertRowid);
  insertTransfer.run(base2Id, base3Id, eqNVGId, 15, 'COMPLETED', 'Forward outpost night recon equipment transfer', '2026-02-05 09:15:00', commander2.lastInsertRowid);
  insertTransfer.run(base1Id, base3Id, eqHumveeId, 5, 'COMPLETED', 'Base security patrol vehicle transfer', '2026-02-07 11:45:00', logistics.lastInsertRowid);

  // 7. Insert Assignments
  const insertAssignment = db.prepare(`
    INSERT INTO assignments (base_id, equipment_type_id, assigned_to_personnel, quantity, assignment_date, status, assigned_by)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  insertAssignment.run(base1Id, eqM4Id, '1st Infantry Platoon Alpha', 40, '2026-02-02 08:00:00', 'ACTIVE', commander1.lastInsertRowid);
  insertAssignment.run(base1Id, eqNVGId, 'Reconnaissance Squad Bravo', 20, '2026-02-04 10:30:00', 'ACTIVE', commander1.lastInsertRowid);
  insertAssignment.run(base2Id, eqM4Id, 'Arctic Sentry Unit Delta', 35, '2026-02-03 09:00:00', 'ACTIVE', commander2.lastInsertRowid);

  // 8. Insert Expenditures
  const insertExpenditure = db.prepare(`
    INSERT INTO expenditures (base_id, equipment_type_id, quantity, reason, date, recorded_by)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  insertExpenditure.run(base1Id, eqAmmo556Id, 5000, 'Live-fire marksmanship training exercise', '2026-02-06 16:00:00', commander1.lastInsertRowid);
  insertExpenditure.run(base2Id, eqAmmo556Id, 3000, 'Extreme weather ballistics testing', '2026-02-08 15:30:00', commander2.lastInsertRowid);
  insertExpenditure.run(base1Id, eqM4Id, 2, 'Combat damage beyond repair during field operations', '2026-02-09 11:00:00', commander1.lastInsertRowid);

  // 9. Insert Audit Logs
  const insertAudit = db.prepare(`
    INSERT INTO audit_logs (user_id, action, details, ip_address, created_at)
    VALUES (?, ?, ?, ?, ?)
  `);

  insertAudit.run(admin.lastInsertRowid, 'AUTH_LOGIN', 'User admin_user logged into global system portal', '127.0.0.1', '2026-02-01 08:00:00');
  insertAudit.run(logistics.lastInsertRowid, 'PURCHASE_CREATE', 'Logged purchase of 250 M4A1 Carbines for Fort Alpha Command', '127.0.0.1', '2026-01-10 09:00:00');
  insertAudit.run(logistics.lastInsertRowid, 'TRANSFER_EXECUTE', 'Transferred 30 M4A1 Carbines from Fort Alpha Command to Fort Bravo Forward Base', '127.0.0.1', '2026-02-01 10:00:00');
  insertAudit.run(commander1.lastInsertRowid, 'EXPENDITURE_LOG', 'Recorded expenditure of 5000 rounds 5.56mm Ammo at Fort Alpha Command', '127.0.0.1', '2026-02-06 16:00:00');

  console.log('Database successfully seeded with military bases, users, equipment, purchases, transfers, assignments, and audit trails!');
}

export { seedDatabase };

// Only auto-run when called directly (npm run seed)
if (process.argv[1].includes('seed.js')) {
  seedDatabase().catch((err) => {
    console.error('Failed to seed database:', err);
    process.exit(1);
  });
}
