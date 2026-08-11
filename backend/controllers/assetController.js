import db from '../config/db.js';

export const getDashboardMetrics = (req, res) => {
  try {
    const { baseId, equipmentTypeId, startDate } = req.query;

    let baseFilter = '';
    let eqFilter = '';
    const params = [];

    if (baseId) {
      baseFilter = ' AND base_id = ? ';
      params.push(Number(baseId));
    }

    if (equipmentTypeId) {
      eqFilter = ' AND equipment_type_id = ? ';
      params.push(Number(equipmentTypeId));
    }

    // 1. Total Purchases
    let purchaseQuery = `SELECT COALESCE(SUM(quantity), 0) as total FROM purchases WHERE 1=1`;
    const purchaseParams = [];
    if (baseId) { purchaseQuery += ` AND base_id = ?`; purchaseParams.push(Number(baseId)); }
    if (equipmentTypeId) { purchaseQuery += ` AND equipment_type_id = ?`; purchaseParams.push(Number(equipmentTypeId)); }
    if (startDate) { purchaseQuery += ` AND date >= ?`; purchaseParams.push(startDate); }

    const purchasesResult = db.prepare(purchaseQuery).get(...purchaseParams);
    const purchases = purchasesResult ? purchasesResult.total : 0;

    // 2. Transfers In
    let transferInQuery = `SELECT COALESCE(SUM(quantity), 0) as total FROM transfers WHERE status = 'COMPLETED'`;
    const transferInParams = [];
    if (baseId) { transferInQuery += ` AND destination_base_id = ?`; transferInParams.push(Number(baseId)); }
    if (equipmentTypeId) { transferInQuery += ` AND equipment_type_id = ?`; transferInParams.push(Number(equipmentTypeId)); }
    if (startDate) { transferInQuery += ` AND timestamp >= ?`; transferInParams.push(startDate); }

    const transfersInResult = db.prepare(transferInQuery).get(...transferInParams);
    const transfersIn = transfersInResult ? transfersInResult.total : 0;

    // 3. Transfers Out
    let transferOutQuery = `SELECT COALESCE(SUM(quantity), 0) as total FROM transfers WHERE status = 'COMPLETED'`;
    const transferOutParams = [];
    if (baseId) { transferOutQuery += ` AND source_base_id = ?`; transferOutParams.push(Number(baseId)); }
    if (equipmentTypeId) { transferOutQuery += ` AND equipment_type_id = ?`; transferOutParams.push(Number(equipmentTypeId)); }
    if (startDate) { transferOutQuery += ` AND timestamp >= ?`; transferOutParams.push(startDate); }

    const transfersOutResult = db.prepare(transferOutQuery).get(...transferOutParams);
    const transfersOut = transfersOutResult ? transfersOutResult.total : 0;

    // Net Movement calculation
    const netMovement = purchases + transfersIn - transfersOut;

    // 4. Assigned Assets (Active)
    let assignedQuery = `SELECT COALESCE(SUM(quantity), 0) as total FROM assignments WHERE status = 'ACTIVE'`;
    const assignedParams = [];
    if (baseId) { assignedQuery += ` AND base_id = ?`; assignedParams.push(Number(baseId)); }
    if (equipmentTypeId) { assignedQuery += ` AND equipment_type_id = ?`; assignedParams.push(Number(equipmentTypeId)); }

    const assignedResult = db.prepare(assignedQuery).get(...assignedParams);
    const assigned = assignedResult ? assignedResult.total : 0;

    // 5. Expended Assets
    let expendedQuery = `SELECT COALESCE(SUM(quantity), 0) as total FROM expenditures WHERE 1=1`;
    const expendedParams = [];
    if (baseId) { expendedQuery += ` AND base_id = ?`; expendedParams.push(Number(baseId)); }
    if (equipmentTypeId) { expendedQuery += ` AND equipment_type_id = ?`; expendedParams.push(Number(equipmentTypeId)); }
    if (startDate) { expendedQuery += ` AND date >= ?`; expendedParams.push(startDate); }

    const expendedResult = db.prepare(expendedQuery).get(...expendedParams);
    const expended = expendedResult ? expendedResult.total : 0;

    // 6. Opening Balance (Baseline calculation before current window)
    const openingBalance = 0; // Baseline standard zero opening balance for initial period or historical window

    // 7. Closing Balance formula: Opening + Net Movement - Assigned - Expended
    const closingBalance = Math.max(0, openingBalance + netMovement - assigned - expended);

    // Category distribution breakdown for charts
    const categoryBreakdownQuery = `
      SELECT 
        e.category,
        COALESCE(SUM(p.quantity), 0) as purchased,
        COALESCE(SUM(a.quantity), 0) as assigned,
        COALESCE(SUM(ex.quantity), 0) as expended
      FROM equipment_types e
      LEFT JOIN purchases p ON e.id = p.equipment_type_id ${baseId ? 'AND p.base_id = ' + Number(baseId) : ''}
      LEFT JOIN assignments a ON e.id = a.equipment_type_id AND a.status = 'ACTIVE' ${baseId ? 'AND a.base_id = ' + Number(baseId) : ''}
      LEFT JOIN expenditures ex ON e.id = ex.equipment_type_id ${baseId ? 'AND ex.base_id = ' + Number(baseId) : ''}
      GROUP BY e.category
    `;
    const categoryBreakdown = db.prepare(categoryBreakdownQuery).all();

    // Equipment stock breakdown
    const equipmentStockQuery = `
      SELECT 
        e.id,
        e.name,
        e.category,
        e.unit_of_measure,
        (
          SELECT COALESCE(SUM(p.quantity), 0) FROM purchases p 
          WHERE p.equipment_type_id = e.id ${baseId ? 'AND p.base_id = ' + Number(baseId) : ''}
        ) +
        (
          SELECT COALESCE(SUM(t.quantity), 0) FROM transfers t 
          WHERE t.equipment_type_id = e.id AND t.status = 'COMPLETED' ${baseId ? 'AND t.destination_base_id = ' + Number(baseId) : ''}
        ) -
        (
          SELECT COALESCE(SUM(t.quantity), 0) FROM transfers t 
          WHERE t.equipment_type_id = e.id AND t.status = 'COMPLETED' ${baseId ? 'AND t.source_base_id = ' + Number(baseId) : ''}
        ) as net_stock,
        (
          SELECT COALESCE(SUM(a.quantity), 0) FROM assignments a 
          WHERE a.equipment_type_id = e.id AND a.status = 'ACTIVE' ${baseId ? 'AND a.base_id = ' + Number(baseId) : ''}
        ) as active_assigned,
        (
          SELECT COALESCE(SUM(ex.quantity), 0) FROM expenditures ex 
          WHERE ex.equipment_type_id = e.id ${baseId ? 'AND ex.base_id = ' + Number(baseId) : ''}
        ) as total_expended
      FROM equipment_types e
    `;
    const equipmentStock = db.prepare(equipmentStockQuery).all();

    return res.status(200).json({
      openingBalance,
      purchases,
      transfersIn,
      transfersOut,
      netMovement,
      assigned,
      expended,
      closingBalance,
      categoryBreakdown,
      equipmentStock
    });
  } catch (err) {
    console.error('Dashboard metrics error:', err);
    return res.status(500).json({ message: 'Error calculating dashboard metrics: ' + err.message });
  }
};

export const getBases = (req, res) => {
  try {
    const bases = db.prepare('SELECT * FROM bases ORDER BY name ASC').all();
    return res.status(200).json(bases);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const getEquipmentTypes = (req, res) => {
  try {
    const types = db.prepare('SELECT * FROM equipment_types ORDER BY category, name ASC').all();
    return res.status(200).json(types);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
