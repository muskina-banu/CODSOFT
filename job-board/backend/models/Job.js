const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title:       { type: String, required: true, trim: true },
  company:     { type: String, required: true, trim: true },
  location:    { type: String, required: true, trim: true },
  type:        { type: String, enum: ['Full-Time','Part-Time','Remote','Contract','Internship'], required: true },
  category:    { type: String, required: true },
  salary:      { type: String, default: 'Not disclosed' },
  description: { type: String, required: true },
  requirements:{ type: String, default: '' },
  benefits:    { type: String, default: '' },
  skills:      [{ type: String }],
  employer:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status:      { type: String, enum: ['active','closed'], default: 'active' },
  deadline:    { type: Date, default: null },
  applicantCount: { type: Number, default: 0 },
  featured:    { type: Boolean, default: false }
}, { timestamps: true });

jobSchema.index({ title: 'text', company: 'text', description: 'text', location: 'text' });

module.exports = mongoose.model('Job', jobSchema);
