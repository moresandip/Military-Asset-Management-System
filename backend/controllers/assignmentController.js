import db from '../config/db.js';
import { logAuditEvent } from '../middlewares/loggerMiddleware.js';

export const getAssignments = (req, res) => {
  try {
    const { baseId } = req.query;

    let query = `
      SELECT 
        a.id,
        a.assigned_to_personnel,
        a.quantity,
        a.assignment_date,
        a.status,
        b.name as base_name,
        e.name as equipment_name,
        e.category as equipment_category,
        u.full_name as assigned_by_user
      FROM assignments a
      JOIN bases b ON a.base_id = b.id
      JOIN equipment_types e ON a.equipment_type_id = e.id
      JOIN users u ON a.assigned_by = u.id
      WHERE 1=1
    `;

    const params = [];
    if (baseId) {
      query += ` AND a.base_id = ? `;
      params.push(Number(baseId));
    }

    query += ` ORDER BY a.assignment_date DESC `;

    const assignments = db.prepare(query).all(...params);
    return res.status(200).json(assignments);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const createAssignment = (req, res) => {
  try {
    const { baseId, equipmentTypeId, assignedToPersonnel, quantity } = req.body;
    const userId = req.user.id;

    if (!baseId || !equipmentTypeId || !assignedToPersonnel || !quantity || quantity <= 0) {
      return res.status(400).json({ message: 'baseId, equipmentTypeId, assignedToPersonnel, and quantity > 0 are required.' });
    }

    const base = db.prepare('SELECT name FROM bases WHERE id = ?').get(baseId);
    const equipment = db.prepare('SELECT name FROM equipment_types WHERE id = ?').get(equipmentTypeId);

    if (!base || !equipment) {
      return res.status(404).json({ message: 'Base or equipment type not found.' });
    }

    const stmt = db.prepare(`
      INSERT INTO assignments (base_id, equipment_type_id, assigned_to_personnel, quantity, assignment_date, status, assigned_by)
      VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, 'ACTIVE', ?)
    `);

    const result = stmt.run(baseId, equipmentTypeId, assignedToPersonnel, Number(quantity), userId);

    logAuditEvent(userId, 'ASSIGNMENT_CREATE', `Assigned ${quantity} x ${equipment.name} to ${assignedToPersonnel} at ${base.name}`, req.ip);

    return res.status(201).json({
      message: 'Equipment assignment successfully logged.',
      assignmentId: result.lastInsertRowid
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const returnAssignment = (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const assignment = db.prepare('SELECT * FROM assignments WHERE id = ?').get(id);
    if (!assignment) return res.status(404).json({ message: 'Assignment record not found.' });

    db.prepare('UPDATE assignments SET status = "RETURNED" WHERE id = ?').run(id);

    logAuditEvent(userId, 'ASSIGNMENT_RETURN', `Returned assignment #${id} (${assignment.quantity} items)`, req.ip);

    return res.status(200).json({ message: 'Assignment status updated to RETURNED.' });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const getExpenditures = (req, res) => {
  try {
    const { baseId } = req.query;

    let query = `
      SELECT 
        ex.id,
        ex.quantity,
        ex.reason,
        ex.date,
        b.name as base_name,
        e.name as equipment_name,
        e.category as equipment_category,
        u.full_name as recorded_by_user
      FROM expenditures ex
      JOIN bases b ON ex.base_id = b.id
      JOIN equipment_types e ON ex.equipment_type_id = e.id
      JOIN users u ON ex.recorded_by = u.id
      WHERE 1=1
    `;

    const params = [];
    if (baseId) {
      query += ` AND ex.base_id = ? `;
      params.push(Number(baseId));
    }

    query += ` ORDER BY ex.date DESC `;

    const expenditures = db.prepare(query).all(...params);
    return res.status(200).json(expenditures);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const createExpenditure = (req, res) => {
  try {
    const { baseId, equipmentTypeId, quantity, reason } = req.body;
    const userId = req.user.id;

    if (!baseId || !equipmentTypeId || !quantity || quantity <= 0 || !reason) {
      return res.status(400).json({ message: 'baseId, equipmentTypeId, quantity > 0, and reason are required.' });
    }

    const base = db.prepare('SELECT name FROM bases WHERE id = ?').get(baseId);
    const equipment = db.prepare('SELECT name FROM equipment_types WHERE id = ?').get(equipmentTypeId);

    if (!base || !equipment) {
      return res.status(404).json({ message: 'Base or equipment type not found.' });
    }

    const stmt = db.prepare(`
      INSERT INTO expenditures (base_id, equipment_type_id, quantity, reason, date, recorded_by)
      VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, ?)
    `);

    const result = stmt.run(baseId, equipmentTypeId, Number(quantity), reason, userId);

    logAuditEvent(userId, 'EXPENDITURE_LOG', `Recorded expenditure of ${quantity} x ${equipment.name} at ${base.name}. Reason: ${reason}`, req.ip);

    return res.status(201).json({
      message: 'Asset expenditure successfully logged.',
      expenditureId: result.lastInsertRowid
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
