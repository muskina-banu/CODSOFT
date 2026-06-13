const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Quiz = require('../models/Quiz');
const { protect } = require('../middleware/auth');

// GET /api/quizzes — list published quizzes (public)
router.get('/', async (req, res) => {
  try {
    const { search, category, page = 1, limit = 12 } = req.query;
    const filter = { published: true };
    if (search) filter.title = { $regex: search, $options: 'i' };
    if (category) filter.category = category;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [quizzes, total] = await Promise.all([
      Quiz.find(filter)
        .populate('author', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Quiz.countDocuments(filter)
    ]);

    res.json({
      quizzes: quizzes.map(formatQuiz),
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit))
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/quizzes/my — current user's quizzes (protected)
router.get('/my', protect, async (req, res) => {
  try {
    const quizzes = await Quiz.find({ author: req.user._id })
      .sort({ createdAt: -1 })
      .lean();
    res.json(quizzes.map(formatQuiz));
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/quizzes/:id — get single quiz (public)
router.get('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ error: 'Quiz not found' });
    }
    const quiz = await Quiz.findById(req.params.id).populate('author', 'name').lean();
    if (!quiz) return res.status(404).json({ error: 'Quiz not found' });
    res.json(formatQuiz(quiz));
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/quizzes/:id/questions — get questions (protected)
router.get('/:id/questions', protect, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id).lean();
    if (!quiz) return res.status(404).json({ error: 'Quiz not found' });
    res.json(quiz.questions.sort((a, b) => a.order - b.order).map(q => ({
      id: q._id,
      text: q.text,
      points: q.points,
      order: q.order,
      choices: q.choices.map(c => ({ id: c._id, text: c.text }))
    })));
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/quizzes — create quiz (protected)
router.post('/', protect, async (req, res) => {
  try {
    const { title, description, category, timeLimit } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required' });

    const quiz = await Quiz.create({
      title, description, category, timeLimit: timeLimit || null,
      author: req.user._id, questions: []
    });
    res.status(201).json(formatQuiz(quiz.toObject()));
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: Object.values(err.errors).map(e => e.message).join(', ') });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/quizzes/:id — update quiz (protected, owner only)
router.put('/:id', protect, async (req, res) => {
  try {
    const quiz = await Quiz.findOne({ _id: req.params.id, author: req.user._id });
    if (!quiz) return res.status(404).json({ error: 'Quiz not found or not authorized' });

    const { title, description, category, timeLimit } = req.body;
    if (title) quiz.title = title;
    if (description !== undefined) quiz.description = description;
    if (category) quiz.category = category;
    quiz.timeLimit = timeLimit || null;

    await quiz.save();
    res.json(formatQuiz(quiz.toObject()));
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PATCH /api/quizzes/:id/publish — toggle publish (protected, owner only)
router.patch('/:id/publish', protect, async (req, res) => {
  try {
    const quiz = await Quiz.findOne({ _id: req.params.id, author: req.user._id });
    if (!quiz) return res.status(404).json({ error: 'Not found or not authorized' });
    quiz.published = req.body.published !== undefined ? req.body.published : !quiz.published;
    await quiz.save();
    res.json(formatQuiz(quiz.toObject()));
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/quizzes/:id/questions — add question (protected, owner only)
router.post('/:id/questions', protect, async (req, res) => {
  try {
    const quiz = await Quiz.findOne({ _id: req.params.id, author: req.user._id });
    if (!quiz) return res.status(404).json({ error: 'Not found or not authorized' });

    const { text, choices, points, order } = req.body;
    if (!text || !choices || choices.length < 2) {
      return res.status(400).json({ error: 'Question text and at least 2 choices required' });
    }
    const hasCorrect = choices.some(c => c.isCorrect);
    if (!hasCorrect) return res.status(400).json({ error: 'At least one correct answer required' });

    quiz.questions.push({ text, choices, points: points || 1, order: order ?? quiz.questions.length });
    await quiz.save();
    res.status(201).json(formatQuiz(quiz.toObject()));
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/quizzes/:id/questions/:qid — delete question (protected, owner only)
router.delete('/:id/questions/:qid', protect, async (req, res) => {
  try {
    const quiz = await Quiz.findOne({ _id: req.params.id, author: req.user._id });
    if (!quiz) return res.status(404).json({ error: 'Not found or not authorized' });
    quiz.questions = quiz.questions.filter(q => q._id.toString() !== req.params.qid);
    await quiz.save();
    res.json({ message: 'Question deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/quizzes/:id/attempt — submit attempt (protected)
router.post('/:id/attempt', protect, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz || !quiz.published) return res.status(404).json({ error: 'Quiz not found' });

    const { answers } = req.body;
    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ error: 'Answers array required' });
    }

    const Attempt = require('../models/Attempt');
    let score = 0;
    let totalPoints = 0;
    const processedAnswers = [];

    for (const q of quiz.questions) {
      const correctChoice = q.choices.find(c => c.isCorrect);
      const userAnswer = answers.find(a => a.questionId === q._id.toString());
      const selectedChoice = userAnswer?.selectedChoiceId
        ? q.choices.find(c => c._id.toString() === userAnswer.selectedChoiceId)
        : null;
      const isCorrect = selectedChoice?._id.toString() === correctChoice?._id.toString();
      const pts = isCorrect ? q.points : 0;
      score += pts;
      totalPoints += q.points;
      processedAnswers.push({
        questionId: q._id,
        questionText: q.text,
        selectedChoiceId: selectedChoice?._id || null,
        selectedChoiceText: selectedChoice?.text || null,
        correctChoiceText: correctChoice?.text || '',
        isCorrect,
        pointsEarned: pts,
        pointsPossible: q.points
      });
    }

    const percentage = totalPoints > 0 ? Math.round((score / totalPoints) * 100) : 0;

    const attempt = await Attempt.create({
      user: req.user._id,
      quiz: quiz._id,
      quizTitle: quiz.title,
      answers: processedAnswers,
      score,
      totalPoints,
      percentage,
      passed: percentage >= 60
    });

    quiz.attemptCount += 1;
    await quiz.save();

    res.status(201).json({ id: attempt._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

function formatQuiz(q) {
  const totalPoints = (q.questions || []).reduce((s, x) => s + x.points, 0);
  return {
    id: q._id,
    title: q.title,
    description: q.description,
    category: q.category,
    timeLimit: q.timeLimit,
    published: q.published,
    questionCount: (q.questions || []).length,
    totalPoints,
    attemptCount: q.attemptCount || 0,
    authorName: q.author?.name || 'Unknown',
    authorId: q.author?._id || q.author,
    createdAt: q.createdAt,
    questions: q.questions || []
  };
}

module.exports = router;
