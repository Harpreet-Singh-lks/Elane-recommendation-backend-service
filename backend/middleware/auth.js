const { verify } = require('../utils/jwt');

module.exports = function (req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const payload = verify(token);
    req.user = payload; // contains userId, email etc
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};
