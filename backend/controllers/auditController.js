import db from '../config/db.js';

export const getAuditLogs = (req, res) => {
  try {
    const { action, userId } = req.query;

    let query = `
      SELECT 
        a.id,
        a.action,
        a.details,
        a.ip_address,
        a.created_at,
        u.username,
        u.full_name,
        u.role,
        b.name as base_name
      FROM audit_logs a
      LEFT JOIN users u ON a.user_id = u.id
      LEFT JOIN bases b ON u.base_id = b.id
      WHERE 1=1
    `;

    const params = [];
    if (action) {
      query += ` AND a.action = ? `;
      params.push(action);
    }
    if (userId) {
      query += ` AND a.user_id = ? `;
      params.push(Number(userId));
    }

    query += ` ORDER BY a.created_at DESC LIMIT 200 `;

    const logs = db.prepare(query).all(...params);
    return res.status(200).json(logs);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
