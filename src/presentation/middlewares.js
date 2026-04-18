const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

const protect = (req, res, next) => {
  let token = req.headers.authorization;
  if (token && token.startsWith('Bearer')) {
    try {
      token = token.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      return next();
    } catch (e) {
      logger.warn(`Auth token failed - ${e.message}`);
    }
  }
  res.status(401).json({ error: 'Not authorized, token invalid or missing' });
};

const librarianOnly = (req, res, next) => {
  if (req.user && req.user.role === 'librarian') next();
  else res.status(403).json({ error: 'Librarian access required' });
};

const errorHandler = (err, req, res, next) => {
  logger.error(err.stack || err.message);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
};

module.exports = { protect, librarianOnly, errorHandler };
