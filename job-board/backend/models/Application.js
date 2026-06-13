const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  job:         { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  candidate:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  coverLetter: { type: String, default: '' },
  resumeUrl:   { type: String, default: '' },
  resumeName:  { type: String, default: '' },
  status:      { type: String, enum: ['pending','reviewed','shortlisted','rejected','hired'], default: 'pending' },
  employerNote:{ type: String, default: '' }
}, { timestamps: true });

// One application per job per candidate
applicationSchema.index({ job: 1, candidate: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);
