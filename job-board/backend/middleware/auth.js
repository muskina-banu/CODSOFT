const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Not authorized' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) return res.status(401).json({ error: 'User not found' });
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
};

const employerOnly = (req, res, next) => {
  if (req.user?.role !== 'employer') return res.status(403).json({ error: 'Employers only' });
  next();
};

const candidateOnly = (req, res, next) => {
  if (req.user?.role !== 'candidate') return res.status(403).json({ error: 'Candidates only' });
  next();
};

module.exports = { protect, employerOnly, candidateOnly };
