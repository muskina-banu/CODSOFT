const mongoose = require('mongoose');

const choiceSchema = new mongoose.Schema({
  text: { type: String, required: true, trim: true },
  isCorrect: { type: Boolean, default: false }
});

const questionSchema = new mongoose.Schema({
  text: { type: String, required: true, trim: true },
  choices: { type: [choiceSchema], validate: [arr => arr.length >= 2, 'At least 2 choices required'] },
  points: { type: Number, default: 1, min: 1 },
  order: { type: Number, default: 0 }
});

const quizSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [120, 'Title too long']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description too long'],
      default: ''
    },
    category: {
      type: String,
      default: 'General Knowledge',
      enum: ['General Knowledge','Science','History','Geography','Technology','Sports','Entertainment','Literature']
    },
    timeLimit: { type: Number, default: null, min: 1 },
    questions: [questionSchema],
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    published: { type: Boolean, default: false },
    attemptCount: { type: Number, default: 0 }
  },
  { timestamps: true }
);

quizSchema.virtual('questionCount').get(function () {
  return this.questions.length;
});

quizSchema.virtual('totalPoints').get(function () {
  return this.questions.reduce((sum, q) => sum + q.points, 0);
});

module.exports = mongoose.model('Quiz', quizSchema);
