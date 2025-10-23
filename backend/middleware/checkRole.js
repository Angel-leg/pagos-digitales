// middleware/checkRole.js
module.exports = (requiredRole) => {
  return (req, res, next) => {
    const userGroups = req.user['cognito:groups'] || [];
    if (userGroups.includes(requiredRole)) {
      return next();
    }
    return res.status(403).json({ error: 'Acceso denegado: rol insuficiente' });
  };
};
