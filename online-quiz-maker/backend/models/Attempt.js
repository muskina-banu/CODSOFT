const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  questionId: { type: mongoose.Schema.Types.ObjectId, required: true },
  questionText: { type: String, required: true },
  selectedChoiceId: { type: mongoose.Schema.Types.ObjectId, default: null },
  selectedChoiceText: { type: String, default: null },
  correctChoiceText: { type: String, required: true },
  isCorrect: { type: Boolean, required: true },
  pointsEarned: { type: Number, default: 0 },
  pointsPossible: { type: Number, required: true }
});

const attemptSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
    quizTitle: { type: String, required: true },
    answers: [answerSchema],
    score: { type: Number, required: true },
    totalPoints: { type: Number, required: true },
    percentage: { type: Number, required: true },
    passed: { type: Boolean, default: false },
    timeTaken: { type: Number, default: null }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Attempt', attemptSchema);
