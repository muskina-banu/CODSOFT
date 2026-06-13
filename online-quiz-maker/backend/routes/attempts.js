const express = require('express');
const router = express.Router();
const Attempt = require('../models/Attempt');
const { protect } = require('../middleware/auth');

// GET /api/attempts/:id — get single attempt result (protected)
router.get('/:id', protect, async (req, res) => {
  try {
    const attempt = await Attempt.findById(req.params.id).lean();
    if (!attempt) return res.status(404).json({ error: 'Attempt not found' });
    if (attempt.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    res.json({
      id: attempt._id,
      quizId: attempt.quiz,
      quizTitle: attempt.quizTitle,
      score: attempt.score,
      totalPoints: attempt.totalPoints,
      percentage: attempt.percentage,
      passed: attempt.passed,
      answers: attempt.answers,
      createdAt: attempt.createdAt
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/attempts/my/all — current user's attempts (protected)
router.get('/my/all', protect, async (req, res) => {
  try {
    const attempts = await Attempt.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();
    res.json(attempts.map(a => ({
      id: a._id,
      quizId: a.quiz,
      quizTitle: a.quizTitle,
      score: a.score,
      totalPoints: a.totalPoints,
      percentage: a.percentage,
      passed: a.passed,
      createdAt: a.createdAt
    })));
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
