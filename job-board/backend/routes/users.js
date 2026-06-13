const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

// PUT /api/users/profile — update profile
router.put('/profile', protect, upload.single('resume'), async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const fields = ['name','headline','location','phone','experience','education','company','companyDesc','website','industry'];
    fields.forEach(f => { if (req.body[f] !== undefined) user[f] = req.body[f]; });
    if (req.body.skills) user.skills = req.body.skills.split(',').map(s => s.trim()).filter(Boolean);
    if (req.file) user.resumeUrl = `/uploads/${req.file.filename}`;
    if (req.body.password && req.body.password.length >= 6) user.password = req.body.password;
    await user.save();
    res.json({ message: 'Profile updated', user: safeUser(user) });
  } catch { res.status(500).json({ error: 'Server error' }); }
});

// GET /api/users/stats — dashboard stats
router.get('/stats', protect, async (req, res) => {
  try {
    const Job = require('../models/Job');
    const Application = require('../models/Application');

    if (req.user.role === 'employer') {
      const [jobs, totalApps] = await Promise.all([
        Job.find({ employer: req.user._id }).lean(),
        Application.countDocuments({ job: { $in: (await Job.find({ employer: req.user._id }).select('_id')).map(j => j._id) } })
      ]);
      const activeJobs = jobs.filter(j => j.status === 'active').length;
      res.json({ totalJobs: jobs.length, activeJobs, closedJobs: jobs.length - activeJobs, totalApplicants: totalApps });
    } else {
      const apps = await Application.find({ candidate: req.user._id }).lean();
      res.json({
        totalApplications: apps.length,
        pending: apps.filter(a => a.status === 'pending').length,
        shortlisted: apps.filter(a => a.status === 'shortlisted').length,
        rejected: apps.filter(a => a.status === 'rejected').length,
        hired: apps.filter(a => a.status === 'hired').length
      });
    }
  } catch { res.status(500).json({ error: 'Server error' }); }
});

function safeUser(u) {
  return { id: u._id, name: u.name, email: u.email, role: u.role, company: u.company, headline: u.headline, skills: u.skills, location: u.location, phone: u.phone, experience: u.experience, education: u.education, resumeUrl: u.resumeUrl, companyDesc: u.companyDesc, website: u.website, industry: u.industry };
}

module.exports = router;
