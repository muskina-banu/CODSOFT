const express = require('express');
const router = express.Router();
const Application = require('../models/Application');
const Job = require('../models/Job');
const User = require('../models/User');
const upload = require('../middleware/upload');
const { protect, candidateOnly, employerOnly } = require('../middleware/auth');
const { sendApplicationEmail, sendStatusUpdateEmail } = require('../config/mailer');

// POST /api/applications — submit application (candidate)
router.post('/', protect, candidateOnly, upload.single('resume'), async (req, res) => {
  try {
    const { jobId, coverLetter } = req.body;
    if (!jobId) return res.status(400).json({ error: 'jobId required' });

    const job = await Job.findOne({ _id: jobId, status: 'active' });
    if (!job) return res.status(404).json({ error: 'Job not found or closed' });

    const exists = await Application.findOne({ job: jobId, candidate: req.user._id });
    if (exists) return res.status(400).json({ error: 'You already applied to this job' });

    const resumeUrl = req.file ? `/uploads/${req.file.filename}` : (req.user.resumeUrl || '');
    const resumeName = req.file ? req.file.originalname : '';

    const app = await Application.create({
      job: jobId, candidate: req.user._id,
      coverLetter: coverLetter || '',
      resumeUrl, resumeName
    });

    job.applicantCount += 1;
    await job.save();

    sendApplicationEmail(req.user.email, req.user.name, job.title, job.company).catch(() => {});

    res.status(201).json({ id: app._id, message: 'Application submitted successfully' });
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ error: 'You already applied to this job' });
    res.status(500).json({ error: err.message || 'Server error' });
  }
});

// GET /api/applications/my — candidate's applications
router.get('/my', protect, candidateOnly, async (req, res) => {
  try {
    const apps = await Application.find({ candidate: req.user._id })
      .populate('job', 'title company location type status')
      .sort({ createdAt: -1 }).lean();
    res.json(apps.map(a => ({
      id: a._id, coverLetter: a.coverLetter, resumeUrl: a.resumeUrl, resumeName: a.resumeName,
      status: a.status, employerNote: a.employerNote, createdAt: a.createdAt,
      job: a.job ? { id: a.job._id, title: a.job.title, company: a.job.company, location: a.job.location, type: a.job.type, status: a.job.status } : null
    })));
  } catch { res.status(500).json({ error: 'Server error' }); }
});

// PATCH /api/applications/:id/status — employer updates application status
router.patch('/:id/status', protect, employerOnly, async (req, res) => {
  try {
    const { status, note } = req.body;
    const valid = ['pending','reviewed','shortlisted','rejected','hired'];
    if (!valid.includes(status)) return res.status(400).json({ error: 'Invalid status' });

    const app = await Application.findById(req.params.id).populate('job').populate('candidate', 'name email');
    if (!app) return res.status(404).json({ error: 'Application not found' });

    const job = await Job.findOne({ _id: app.job._id, employer: req.user._id });
    if (!job) return res.status(403).json({ error: 'Not authorized' });

    app.status = status;
    if (note) app.employerNote = note;
    await app.save();

    sendStatusUpdateEmail(app.candidate.email, app.candidate.name, app.job.title, status).catch(() => {});

    res.json({ message: 'Status updated' });
  } catch { res.status(500).json({ error: 'Server error' }); }
});

// GET /api/applications/check/:jobId — check if candidate already applied
router.get('/check/:jobId', protect, candidateOnly, async (req, res) => {
  try {
    const app = await Application.findOne({ job: req.params.jobId, candidate: req.user._id });
    res.json({ applied: !!app, applicationId: app?._id });
  } catch { res.status(500).json({ error: 'Server error' }); }
});

module.exports = router;
