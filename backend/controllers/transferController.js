import db from '../config/db.js';
import { logAuditEvent } from '../middlewares/loggerMiddleware.js';

export const getTransfers = (req, res) => {
  try {
    const { baseId } = req.query;

    let query = `
      SELECT 
        t.id,
        t.quantity,
        t.status,
        t.notes,
        t.timestamp,
        sb.name as source_base_name,
        sb.code as source_base_code,
        db_base.name as destination_base_name,
        db_base.code as destination_base_code,
        e.name as equipment_name,
        e.category as equipment_category,
        u.full_name as initiated_by_user
      FROM transfers t
      JOIN bases sb ON t.source_base_id = sb.id
      JOIN bases db_base ON t.destination_base_id = db_base.id
      JOIN equipment_types e ON t.equipment_type_id = e.id
      JOIN users u ON t.initiated_by = u.id
      WHERE 1=1
    `;

    const params = [];
    if (baseId) {
      query += ` AND (t.source_base_id = ? OR t.destination_base_id = ?) `;
      params.push(Number(baseId), Number(baseId));
    }

    query += ` ORDER BY t.timestamp DESC `;

    const transfers = db.prepare(query).all(...params);
    return res.status(200).json(transfers);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const createTransfer = (req, res) => {
  const executeAtomicTransfer = db.transaction((transferData) => {
    const { sourceBaseId, destinationBaseId, equipmentTypeId, quantity, notes, userId, reqIp } = transferData;

    // 1. Validate bases and equipment
    const sourceBase = db.prepare('SELECT name FROM bases WHERE id = ?').get(sourceBaseId);
    const destBase = db.prepare('SELECT name FROM bases WHERE id = ?').get(destinationBaseId);
    const equipment = db.prepare('SELECT name FROM equipment_types WHERE id = ?').get(equipmentTypeId);

    if (!sourceBase || !destBase || !equipment) {
      throw new Error('Invalid source base, destination base, or equipment type.');
    }

    // 2. Check source base available stock
    const purchasesRes = db.prepare('SELECT COALESCE(SUM(quantity), 0) as total FROM purchases WHERE base_id = ? AND equipment_type_id = ?').get(sourceBaseId, equipmentTypeId);
    const transfersInRes = db.prepare('SELECT COALESCE(SUM(quantity), 0) as total FROM transfers WHERE destination_base_id = ? AND equipment_type_id = ? AND status = "COMPLETED"').get(sourceBaseId, equipmentTypeId);
    const transfersOutRes = db.prepare('SELECT COALESCE(SUM(quantity), 0) as total FROM transfers WHERE source_base_id = ? AND equipment_type_id = ? AND status = "COMPLETED"').get(sourceBaseId, equipmentTypeId);
    const assignedRes = db.prepare('SELECT COALESCE(SUM(quantity), 0) as total FROM assignments WHERE base_id = ? AND equipment_type_id = ? AND status = "ACTIVE"').get(sourceBaseId, equipmentTypeId);
    const expendedRes = db.prepare('SELECT COALESCE(SUM(quantity), 0) as total FROM expenditures WHERE base_id = ? AND equipment_type_id = ?').get(sourceBaseId, equipmentTypeId);

    const purchases = purchasesRes ? (purchasesRes.total || 0) : 0;
    const transfersIn = transfersInRes ? (transfersInRes.total || 0) : 0;
    const transfersOut = transfersOutRes ? (transfersOutRes.total || 0) : 0;
    const assigned = assignedRes ? (assignedRes.total || 0) : 0;
    const expended = expendedRes ? (expendedRes.total || 0) : 0;

    const availableStock = purchases + transfersIn - transfersOut - assigned - expended;

    if (availableStock < quantity) {
      throw new Error(`Insufficient stock at ${sourceBase.name}. Available: ${availableStock}, Requested: ${quantity}`);
    }

    // 3. Insert Transfer Record
    const insertTransfer = db.prepare(`
      INSERT INTO transfers (source_base_id, destination_base_id, equipment_type_id, quantity, status, notes, timestamp, initiated_by)
      VALUES (?, ?, ?, ?, 'COMPLETED', ?, CURRENT_TIMESTAMP, ?)
    `);
    const transferResult = insertTransfer.run(sourceBaseId, destinationBaseId, equipmentTypeId, quantity, notes || '', userId);

    // 4. Log Action in Audit Table
    const details = `Atomic Transfer: ${quantity} x ${equipment.name} moved from ${sourceBase.name} to ${destBase.name}`;
    logAuditEvent(userId, 'TRANSFER_EXECUTE', details, reqIp);

    return transferResult.lastInsertRowid;
  });

  try {
    const { sourceBaseId, destinationBaseId, equipmentTypeId, quantity, notes } = req.body;
    const userId = req.user.id;

    if (!sourceBaseId || !destinationBaseId || !equipmentTypeId || !quantity || quantity <= 0) {
      return res.status(400).json({ message: 'Source base, destination base, equipment type, and quantity > 0 are required.' });
    }

    if (Number(sourceBaseId) === Number(destinationBaseId)) {
      return res.status(400).json({ message: 'Source and destination bases cannot be identical.' });
    }

    const transferId = executeAtomicTransfer({
      sourceBaseId: Number(sourceBaseId),
      destinationBaseId: Number(destinationBaseId),
      equipmentTypeId: Number(equipmentTypeId),
      quantity: Number(quantity),
      notes: notes || '',
      userId,
      reqIp: req.ip
    });

    return res.status(201).json({
      message: 'Atomic asset transfer completed successfully.',
      transferId
    });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
};
