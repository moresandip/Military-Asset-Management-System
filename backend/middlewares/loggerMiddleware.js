import db from '../config/db.js';

export const logAuditEvent = (userId, action, details, ipAddress = '127.0.0.1') => {
  try {
    const stmt = db.prepare(`
      INSERT INTO audit_logs (user_id, action, details, ip_address, created_at)
      VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
    `);
    stmt.run(userId || null, action, details, ipAddress);
  } catch (err) {
    console.error('Failed to insert audit log:', err);
  }
};

export const apiAuditLogger = (req, res, next) => {
  const originalJson = res.json;
  res.json = function (data) {
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method) && req.user) {
      const action = `${req.method}_${req.baseUrl.replace('/api/', '').toUpperCase()}`;
      const details = `Endpoint ${req.originalUrl} invoked. Payload: ${JSON.stringify(req.body)}`;
      const ip = req.ip || req.connection.remoteAddress || '127.0.0.1';
      logAuditEvent(req.user.id, action, details, ip);
    }
    return originalJson.call(this, data);
  };
  next();
};
