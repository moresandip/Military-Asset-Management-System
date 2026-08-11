export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access Denied: Role '${req.user?.role || 'UNKNOWN'}' lacks required permissions.`
      });
    }
    next();
  };
};

export const enforceBaseScope = (req, res, next) => {
  if (req.user && req.user.role === 'BASE_COMMANDER') {
    if (req.user.baseId) {
      // Force query base filter to commander's assigned base
      req.query.baseId = String(req.user.baseId);
      
      // If request body contains baseId, ensure it matches assigned base
      if (req.body && req.body.baseId && String(req.body.baseId) !== String(req.user.baseId)) {
        return res.status(403).json({
          message: `Forbidden: Base Commanders can only operate on their assigned base (Base #${req.user.baseId}).`
        });
      }
      
      // If source base in transfer doesn't match, block
      if (req.body && req.body.sourceBaseId && String(req.body.sourceBaseId) !== String(req.user.baseId)) {
        return res.status(403).json({
          message: `Forbidden: Transfers must originate from your assigned base (Base #${req.user.baseId}).`
        });
      }
    }
  }
  next();
};
