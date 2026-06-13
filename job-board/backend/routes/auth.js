const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { sendWelcomeEmail } = require('../config/mailer');

const genToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, company } = req.body;
    if (!name || !email || !password || !role) return res.status(400).json({ error: 'All fields required' });
    if (await User.findOne({ email: email.toLowerCase() })) return res.status(400).json({ error: 'Email already registered' });

    const user = await User.create({ name, email, password, role, company: company || '' });
    sendWelcomeEmail(user.email, user.name, user.role).catch(() => {});

    res.status(201).json({ token: genToken(user._id), user: safeUser(user) });
  } catch (err) {
    if (err.name === 'ValidationError') return res.status(400).json({ error: Object.values(err.errors).map(e => e.message).join(', ') });
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !(await user.matchPassword(password))) return res.status(401).json({ error: 'Invalid email or password' });
    res.json({ token: genToken(user._id), user: safeUser(user) });
  } catch { res.status(500).json({ error: 'Server error' }); }
});

// GET /api/auth/me
router.get('/me', protect, (req, res) => res.json(safeUser(req.user)));

function safeUser(u) {
  return {
    id: u._id, name: u.name, email: u.email, role: u.role,
    company: u.company, headline: u.headline, skills: u.skills,
    location: u.location, phone: u.phone, experience: u.experience,
    education: u.education, resumeUrl: u.resumeUrl,
    companyDesc: u.companyDesc, website: u.website, industry: u.industry
  };
}

module.exports = router;
