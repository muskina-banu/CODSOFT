const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true },
  email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  role:     { type: String, enum: ['candidate', 'employer'], required: true },

  // Candidate fields
  headline:  { type: String, default: '' },
  skills:    [{ type: String }],
  experience:{ type: String, default: '' },
  education: { type: String, default: '' },
  resumeUrl: { type: String, default: '' },
  location:  { type: String, default: '' },
  phone:     { type: String, default: '' },

  // Employer fields
  company:     { type: String, default: '' },
  companyDesc: { type: String, default: '' },
  website:     { type: String, default: '' },
  industry:    { type: String, default: '' }
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.matchPassword = function(pass) {
  return bcrypt.compare(pass, this.password);
};

module.exports = mongoose.model('User', userSchema);
