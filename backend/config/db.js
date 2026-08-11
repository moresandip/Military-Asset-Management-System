import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbFilePath = path.join(dataDir, 'military_assets.json');

// Default initial state
const defaultSchema = {
  sequences: {
    bases: 0,
    users: 0,
    equipment_types: 0,
    purchases: 0,
    transfers: 0,
    assignments: 0,
    expenditures: 0,
    audit_logs: 0
  },
  bases: [],
  users: [],
  equipment_types: [],
  purchases: [],
  transfers: [],
  assignments: [],
  expenditures: [],
  audit_logs: []
};

let store = { ...defaultSchema };

function loadStore() {
  if (fs.existsSync(dbFilePath)) {
    try {
      const data = fs.readFileSync(dbFilePath, 'utf8');
      store = JSON.parse(data);
    } catch (e) {
      console.error('Error reading JSON DB, initializing fresh store:', e);
      store = { ...defaultSchema };
    }
  } else {
    saveStore();
  }
}

function saveStore() {
  fs.writeFileSync(dbFilePath, JSON.stringify(store, null, 2), 'utf8');
}

loadStore();

export function initDb() {
  loadStore();
}

// Database Engine providing prepare(), run(), get(), all(), transaction()
const db = {
  exec(sql) {
    if (sql.includes('DELETE FROM')) {
      if (sql.includes('audit_logs')) store.audit_logs = [];
      if (sql.includes('expenditures')) store.expenditures = [];
      if (sql.includes('assignments')) store.assignments = [];
      if (sql.includes('transfers')) store.transfers = [];
      if (sql.includes('purchases')) store.purchases = [];
      if (sql.includes('equipment_types')) store.equipment_types = [];
      if (sql.includes('users')) store.users = [];
      if (sql.includes('bases')) store.bases = [];
      if (sql.includes('sqlite_sequence')) {
        Object.keys(store.sequences).forEach(k => store.sequences[k] = 0);
      }
      saveStore();
    }
  },

  transaction(fn) {
    return (...args) => {
      const backup = JSON.stringify(store);
      try {
        const result = fn(...args);
        saveStore();
        return result;
      } catch (err) {
        store = JSON.parse(backup);
        throw err;
      }
    };
  },

  prepare(sql) {
    const cleanSql = sql.replace(/\s+/g, ' ').trim();

    return {
      run(...params) {
        // DELETE
        if (cleanSql.startsWith('DELETE FROM')) {
          const match = cleanSql.match(/DELETE FROM (\w+)/i);
          if (match) {
            const table = match[1];
            if (store[table]) store[table] = [];
            saveStore();
          }
          return { changes: 1 };
        }

        // UPDATE
        if (cleanSql.startsWith('UPDATE assignments SET status = "RETURNED" WHERE id = ?')) {
          const id = Number(params[0]);
          const item = store.assignments.find(a => a.id === id);
          if (item) item.status = 'RETURNED';
          saveStore();
          return { changes: 1 };
        }

        // INSERT INTO bases
        if (cleanSql.includes('INSERT INTO bases')) {
          store.sequences.bases += 1;
          const newRecord = {
            id: store.sequences.bases,
            name: params[0],
            location: params[1],
            code: params[2],
            created_at: new Date().toISOString()
          };
          store.bases.push(newRecord);
          saveStore();
          return { lastInsertRowid: newRecord.id };
        }

        // INSERT INTO users
        if (cleanSql.includes('INSERT INTO users')) {
          store.sequences.users += 1;
          const newRecord = {
            id: store.sequences.users,
            username: params[0],
            password_hash: params[1],
            role: params[2],
            base_id: params[3] ? Number(params[3]) : null,
            full_name: params[4],
            rank: params[5],
            created_at: new Date().toISOString()
          };
          store.users.push(newRecord);
          saveStore();
          return { lastInsertRowid: newRecord.id };
        }

        // INSERT INTO equipment_types
        if (cleanSql.includes('INSERT INTO equipment_types')) {
          store.sequences.equipment_types += 1;
          const newRecord = {
            id: store.sequences.equipment_types,
            name: params[0],
            category: params[1],
            model_number: params[2],
            unit_of_measure: params[3],
            created_at: new Date().toISOString()
          };
          store.equipment_types.push(newRecord);
          saveStore();
          return { lastInsertRowid: newRecord.id };
        }

        // INSERT INTO purchases
        if (cleanSql.includes('INSERT INTO purchases')) {
          store.sequences.purchases += 1;
          const newRecord = {
            id: store.sequences.purchases,
            base_id: Number(params[0]),
            equipment_type_id: Number(params[1]),
            quantity: Number(params[2]),
            unit_cost: Number(params[3] || 0),
            supplier: params[4],
            date: params[5] || new Date().toISOString(),
            created_by: Number(params[6])
          };
          store.purchases.push(newRecord);
          saveStore();
          return { lastInsertRowid: newRecord.id };
        }

        // INSERT INTO transfers
        if (cleanSql.includes('INSERT INTO transfers')) {
          store.sequences.transfers += 1;
          const newRecord = {
            id: store.sequences.transfers,
            source_base_id: Number(params[0]),
            destination_base_id: Number(params[1]),
            equipment_type_id: Number(params[2]),
            quantity: Number(params[3]),
            status: params[4] || 'COMPLETED',
            notes: params[5] || '',
            timestamp: params[6] || new Date().toISOString(),
            initiated_by: Number(params[7])
          };
          store.transfers.push(newRecord);
          saveStore();
          return { lastInsertRowid: newRecord.id };
        }

        // INSERT INTO assignments
        if (cleanSql.includes('INSERT INTO assignments')) {
          store.sequences.assignments += 1;
          const newRecord = {
            id: store.sequences.assignments,
            base_id: Number(params[0]),
            equipment_type_id: Number(params[1]),
            assigned_to_personnel: params[2],
            quantity: Number(params[3]),
            assignment_date: params[4] || new Date().toISOString(),
            status: params[5] || 'ACTIVE',
            assigned_by: Number(params[6])
          };
          store.assignments.push(newRecord);
          saveStore();
          return { lastInsertRowid: newRecord.id };
        }

        // INSERT INTO expenditures
        if (cleanSql.includes('INSERT INTO expenditures')) {
          store.sequences.expenditures += 1;
          const newRecord = {
            id: store.sequences.expenditures,
            base_id: Number(params[0]),
            equipment_type_id: Number(params[1]),
            quantity: Number(params[2]),
            reason: params[3],
            date: params[4] || new Date().toISOString(),
            recorded_by: Number(params[5])
          };
          store.expenditures.push(newRecord);
          saveStore();
          return { lastInsertRowid: newRecord.id };
        }

        // INSERT INTO audit_logs
        if (cleanSql.includes('INSERT INTO audit_logs')) {
          store.sequences.audit_logs += 1;
          const newRecord = {
            id: store.sequences.audit_logs,
            user_id: params[0] ? Number(params[0]) : null,
            action: params[1],
            details: params[2],
            ip_address: params[3] || '127.0.0.1',
            created_at: params[4] || new Date().toISOString()
          };
          store.audit_logs.push(newRecord);
          saveStore();
          return { lastInsertRowid: newRecord.id };
        }

        return { lastInsertRowid: 1, changes: 1 };
      },

      get(...params) {
        if (cleanSql.includes('SELECT * FROM users WHERE username = ?')) {
          return store.users.find(u => u.username === params[0]) || null;
        }

        if (cleanSql.includes('SELECT * FROM users WHERE id = ?') || cleanSql.includes('SELECT id, username, role, base_id, full_name, rank FROM users WHERE id = ?')) {
          return store.users.find(u => u.id === Number(params[0])) || null;
        }

        if (cleanSql.includes('SELECT id, name, location, code FROM bases WHERE id = ?') || cleanSql.includes('SELECT name FROM bases WHERE id = ?')) {
          return store.bases.find(b => b.id === Number(params[0])) || null;
        }

        if (cleanSql.includes('SELECT name FROM equipment_types WHERE id = ?')) {
          return store.equipment_types.find(e => e.id === Number(params[0])) || null;
        }

        if (cleanSql.includes('SELECT * FROM assignments WHERE id = ?')) {
          return store.assignments.find(a => a.id === Number(params[0])) || null;
        }

        // Aggregation SUM query for Purchases
        if (cleanSql.includes('FROM purchases WHERE')) {
          let list = store.purchases;
          if (params.length === 2) {
            list = list.filter(p => p.base_id === Number(params[0]) && p.equipment_type_id === Number(params[1]));
          } else if (params.length === 1) {
            if (cleanSql.includes('base_id = ?')) list = list.filter(p => p.base_id === Number(params[0]));
            if (cleanSql.includes('equipment_type_id = ?')) list = list.filter(p => p.equipment_type_id === Number(params[1]));
          }
          const total = list.reduce((acc, cur) => acc + (cur.quantity || 0), 0);
          return { total };
        }

        // Aggregation SUM query for Transfers In/Out
        if (cleanSql.includes('FROM transfers WHERE')) {
          let list = store.transfers.filter(t => t.status === 'COMPLETED');
          if (cleanSql.includes('destination_base_id = ?')) {
            if (params.length === 2) {
              list = list.filter(t => t.destination_base_id === Number(params[0]) && t.equipment_type_id === Number(params[1]));
            } else if (params.length === 1) {
              list = list.filter(t => t.destination_base_id === Number(params[0]));
            }
          }
          if (cleanSql.includes('source_base_id = ?')) {
            if (params.length === 2) {
              list = list.filter(t => t.source_base_id === Number(params[0]) && t.equipment_type_id === Number(params[1]));
            } else if (params.length === 1) {
              list = list.filter(t => t.source_base_id === Number(params[0]));
            }
          }
          const total = list.reduce((acc, cur) => acc + (cur.quantity || 0), 0);
          return { total };
        }

        // Aggregation SUM for Assignments
        if (cleanSql.includes('FROM assignments WHERE')) {
          let list = store.assignments.filter(a => a.status === 'ACTIVE');
          if (params.length === 2) {
            list = list.filter(a => a.base_id === Number(params[0]) && a.equipment_type_id === Number(params[1]));
          } else if (params.length === 1) {
            if (cleanSql.includes('base_id = ?')) list = list.filter(a => a.base_id === Number(params[0]));
            if (cleanSql.includes('equipment_type_id = ?')) list = list.filter(a => a.equipment_type_id === Number(params[0]));
          }
          const total = list.reduce((acc, cur) => acc + (cur.quantity || 0), 0);
          return { total };
        }

        // Aggregation SUM for Expenditures
        if (cleanSql.includes('FROM expenditures WHERE')) {
          let list = store.expenditures;
          if (params.length === 2) {
            list = list.filter(ex => ex.base_id === Number(params[0]) && ex.equipment_type_id === Number(params[1]));
          } else if (params.length === 1) {
            if (cleanSql.includes('base_id = ?')) list = list.filter(ex => ex.base_id === Number(params[0]));
            if (cleanSql.includes('equipment_type_id = ?')) list = list.filter(ex => ex.equipment_type_id === Number(params[0]));
          }
          const total = list.reduce((acc, cur) => acc + (cur.quantity || 0), 0);
          return { total };
        }

        return { total: 0 };
      },

      all(...params) {
        // bases
        if (cleanSql.includes('SELECT * FROM bases')) {
          return store.bases;
        }

        // equipment_types
        if (cleanSql.includes('SELECT * FROM equipment_types')) {
          return store.equipment_types;
        }

        // users
        if (cleanSql.includes('SELECT u.id, u.username')) {
          return store.users.map(u => {
            const b = store.bases.find(base => base.id === u.base_id);
            return { ...u, base_name: b ? b.name : 'All Bases (Global)' };
          });
        }

        // purchases
        if (cleanSql.includes('FROM purchases p')) {
          let list = store.purchases;
          if (cleanSql.includes('p.base_id = ?')) {
            list = list.filter(p => p.base_id === Number(params[0]));
          }
          return list.map(p => {
            const b = store.bases.find(base => base.id === p.base_id);
            const e = store.equipment_types.find(eq => eq.id === p.equipment_type_id);
            const u = store.users.find(usr => usr.id === p.created_by);
            return {
              ...p,
              base_name: b ? b.name : 'Unknown Base',
              base_code: b ? b.code : 'N/A',
              equipment_name: e ? e.name : 'Unknown Equipment',
              equipment_category: e ? e.category : 'N/A',
              created_by_user: u ? u.full_name : 'System'
            };
          }).sort((a, b) => new Date(b.date) - new Date(a.date));
        }

        // transfers
        if (cleanSql.includes('FROM transfers t')) {
          let list = store.transfers;
          if (cleanSql.includes('t.source_base_id = ? OR t.destination_base_id = ?')) {
            const bid = Number(params[0]);
            list = list.filter(t => t.source_base_id === bid || t.destination_base_id === bid);
          }
          return list.map(t => {
            const sb = store.bases.find(base => base.id === t.source_base_id);
            const db_base = store.bases.find(base => base.id === t.destination_base_id);
            const e = store.equipment_types.find(eq => eq.id === t.equipment_type_id);
            const u = store.users.find(usr => usr.id === t.initiated_by);
            return {
              ...t,
              source_base_name: sb ? sb.name : 'Unknown Base',
              source_base_code: sb ? sb.code : 'N/A',
              destination_base_name: db_base ? db_base.name : 'Unknown Base',
              destination_base_code: db_base ? db_base.code : 'N/A',
              equipment_name: e ? e.name : 'Unknown Equipment',
              equipment_category: e ? e.category : 'N/A',
              initiated_by_user: u ? u.full_name : 'System'
            };
          }).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        }

        // assignments
        if (cleanSql.includes('FROM assignments a')) {
          let list = store.assignments;
          if (cleanSql.includes('a.base_id = ?')) {
            list = list.filter(a => a.base_id === Number(params[0]));
          }
          return list.map(a => {
            const b = store.bases.find(base => base.id === a.base_id);
            const e = store.equipment_types.find(eq => eq.id === a.equipment_type_id);
            const u = store.users.find(usr => usr.id === a.assigned_by);
            return {
              ...a,
              base_name: b ? b.name : 'Unknown Base',
              equipment_name: e ? e.name : 'Unknown Equipment',
              equipment_category: e ? e.category : 'N/A',
              assigned_by_user: u ? u.full_name : 'System'
            };
          }).sort((a, b) => new Date(b.assignment_date) - new Date(a.assignment_date));
        }

        // expenditures
        if (cleanSql.includes('FROM expenditures ex')) {
          let list = store.expenditures;
          if (cleanSql.includes('ex.base_id = ?')) {
            list = list.filter(ex => ex.base_id === Number(params[0]));
          }
          return list.map(ex => {
            const b = store.bases.find(base => base.id === ex.base_id);
            const e = store.equipment_types.find(eq => eq.id === ex.equipment_type_id);
            const u = store.users.find(usr => usr.id === ex.recorded_by);
            return {
              ...ex,
              base_name: b ? b.name : 'Unknown Base',
              equipment_name: e ? e.name : 'Unknown Equipment',
              equipment_category: e ? e.category : 'N/A',
              recorded_by_user: u ? u.full_name : 'System'
            };
          }).sort((a, b) => new Date(b.date) - new Date(a.date));
        }

        // audit_logs
        if (cleanSql.includes('FROM audit_logs a')) {
          let list = store.audit_logs;
          if (cleanSql.includes('a.action = ?')) {
            list = list.filter(a => a.action === params[0]);
          }
          if (cleanSql.includes('a.user_id = ?')) {
            list = list.filter(a => a.user_id === Number(params[params.length - 1]));
          }
          return list.map(a => {
            const u = store.users.find(usr => usr.id === a.user_id);
            const b = u ? store.bases.find(base => base.id === u.base_id) : null;
            return {
              ...a,
              username: u ? u.username : 'SYSTEM',
              full_name: u ? u.full_name : 'System Administrator',
              role: u ? u.role : 'ADMIN',
              base_name: b ? b.name : 'Global Operations'
            };
          }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        }

        // Category breakdown
        if (cleanSql.includes('FROM equipment_types e') && cleanSql.includes('GROUP BY e.category')) {
          const categories = ['WEAPON', 'VEHICLE', 'AMMUNITION', 'EQUIPMENT'];
          return categories.map(cat => {
            const eqIds = store.equipment_types.filter(e => e.category === cat).map(e => e.id);
            const purchased = store.purchases.filter(p => eqIds.includes(p.equipment_type_id)).reduce((acc, c) => acc + c.quantity, 0);
            const assigned = store.assignments.filter(a => eqIds.includes(a.equipment_type_id) && a.status === 'ACTIVE').reduce((acc, c) => acc + c.quantity, 0);
            const expended = store.expenditures.filter(ex => eqIds.includes(ex.equipment_type_id)).reduce((acc, c) => acc + c.quantity, 0);
            return { category: cat, purchased, assigned, expended };
          });
        }

        // Equipment stock breakdown
        if (cleanSql.includes('FROM equipment_types e')) {
          return store.equipment_types.map(e => {
            const purchased = store.purchases.filter(p => p.equipment_type_id === e.id).reduce((a, c) => a + c.quantity, 0);
            const tIn = store.transfers.filter(t => t.equipment_type_id === e.id && t.status === 'COMPLETED').reduce((a, c) => a + c.quantity, 0);
            const tOut = store.transfers.filter(t => t.equipment_type_id === e.id && t.status === 'COMPLETED').reduce((a, c) => a + c.quantity, 0);
            const assigned = store.assignments.filter(a => a.equipment_type_id === e.id && a.status === 'ACTIVE').reduce((a, c) => a + c.quantity, 0);
            const expended = store.expenditures.filter(ex => ex.equipment_type_id === e.id).reduce((a, c) => a + c.quantity, 0);

            const net_stock = purchased; // global or base scoped
            return {
              id: e.id,
              name: e.name,
              category: e.category,
              unit_of_measure: e.unit_of_measure,
              net_stock,
              active_assigned: assigned,
              total_expended: expended
            };
          });
        }

        return [];
      }
    };
  }
};

export default db;
