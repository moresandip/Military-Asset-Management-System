import db from '../config/db.js';
import { logAuditEvent } from '../middlewares/loggerMiddleware.js';

export const getPurchases = (req, res) => {
  try {
    const { baseId, equipmentTypeId } = req.query;

    let query = `
      SELECT 
        p.id,
        p.quantity,
        p.unit_cost,
        p.supplier,
        p.date,
        b.name as base_name,
        b.code as base_code,
        e.name as equipment_name,
        e.category as equipment_category,
        u.full_name as created_by_user
      FROM purchases p
      JOIN bases b ON p.base_id = b.id
      JOIN equipment_types e ON p.equipment_type_id = e.id
      JOIN users u ON p.created_by = u.id
      WHERE 1=1
    `;

    const params = [];
    if (baseId) {
      query += ` AND p.base_id = ? `;
      params.push(Number(baseId));
    }
    if (equipmentTypeId) {
      query += ` AND p.equipment_type_id = ? `;
      params.push(Number(equipmentTypeId));
    }

    query += ` ORDER BY p.date DESC `;

    const purchases = db.prepare(query).all(...params);
    return res.status(200).json(purchases);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const createPurchase = (req, res) => {
  try {
    const { baseId, equipmentTypeId, quantity, unitCost, supplier } = req.body;
    const userId = req.user.id;

    if (!baseId || !equipmentTypeId || !quantity || quantity <= 0) {
      return res.status(400).json({ message: 'Missing or invalid parameters. baseId, equipmentTypeId, and quantity > 0 are required.' });
    }

    const base = db.prepare('SELECT name FROM bases WHERE id = ?').get(baseId);
    const equipment = db.prepare('SELECT name FROM equipment_types WHERE id = ?').get(equipmentTypeId);

    if (!base || !equipment) {
      return res.status(404).json({ message: 'Target military base or equipment type not found.' });
    }

    const stmt = db.prepare(`
      INSERT INTO purchases (base_id, equipment_type_id, quantity, unit_cost, supplier, date, created_by)
      VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, ?)
    `);

    const result = stmt.run(baseId, equipmentTypeId, Number(quantity), Number(unitCost || 0), supplier || 'General Defense Procurement', userId);

    const details = `Procured ${quantity} x ${equipment.name} for ${base.name} (Supplier: ${supplier || 'Default Defense Supplier'})`;
    logAuditEvent(userId, 'PURCHASE_CREATE', details, req.ip);

    return res.status(201).json({
      message: 'Purchase intake successfully recorded.',
      purchaseId: result.lastInsertRowid
    });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to record purchase: ' + err.message });
  }
};
