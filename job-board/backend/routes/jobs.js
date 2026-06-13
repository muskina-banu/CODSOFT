const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Job = require('../models/Job');
const Application = require('../models/Application');
const { protect, employerOnly } = require('../middleware/auth');

// GET /api/jobs — browse jobs (public)
router.get('/', async (req, res) => {
  try {
    const { search, category, type, location, page = 1, limit = 10, featured } = req.query;
    const filter = { status: 'active' };

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    if (category) filter.category = category;
    if (type)     filter.type = type;
    if (location) filter.location = { $regex: location, $options: 'i' };
    if (featured) filter.featured = true;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [jobs, total] = await Promise.all([
      Job.find(filter).populate('employer', 'name company').sort({ featured: -1, createdAt: -1 }).skip(skip).limit(parseInt(limit)).lean(),
      Job.countDocuments(filter)
    ]);

    res.json({ jobs: jobs.map(fmt), total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
  } catch { res.status(500).json({ error: 'Server error' }); }
});

// GET /api/jobs/my — employer's own jobs
router.get('/my', protect, employerOnly, async (req, res) => {
  try {
    const jobs = await Job.find({ employer: req.user._id }).sort({ createdAt: -1 }).lean();
    res.json(jobs.map(fmt));
  } catch { res.status(500).json({ error: 'Server error' }); }
});

// GET /api/jobs/categories — all distinct categories
router.get('/categories', async (req, res) => {
  try {
    const cats = await Job.distinct('category', { status: 'active' });
    res.json(cats.sort());
  } catch { res.status(500).json({ error: 'Server error' }); }
});

// GET /api/jobs/:id — job detail
router.get('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(404).json({ error: 'Not found' });
    const job = await Job.findById(req.params.id).populate('employer', 'name company website companyDesc industry').lean();
    if (!job) return res.status(404).json({ error: 'Job not found' });
    res.json(fmt(job));
  } catch { res.status(500).json({ error: 'Server error' }); }
});

// POST /api/jobs — create job (employer)
router.post('/', protect, employerOnly, async (req, res) => {
  try {
    const { title, location, type, category, salary, description, requirements, benefits, skills, deadline } = req.body;
    if (!title || !location || !type || !category || !description) return res.status(400).json({ error: 'Required fields missing' });
    const job = await Job.create({
      title, location, type, category,
      company: req.user.company || req.user.name,
      salary: salary || 'Not disclosed',
      description, requirements: requirements || '', benefits: benefits || '',
      skills: Array.isArray(skills) ? skills : (skills ? skills.split(',').map(s => s.trim()) : []),
      deadline: deadline || null,
      employer: req.user._id
    });
    res.status(201).json(fmt(job.toObject()));
  } catch (err) {
    if (err.name === 'ValidationError') return res.status(400).json({ error: Object.values(err.errors).map(e => e.message).join(', ') });
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/jobs/:id — update job (employer owner)
router.put('/:id', protect, employerOnly, async (req, res) => {
  try {
    const job = await Job.findOne({ _id: req.params.id, employer: req.user._id });
    if (!job) return res.status(404).json({ error: 'Not found or not authorized' });
    const fields = ['title','location','type','category','salary','description','requirements','benefits','deadline','status'];
    fields.forEach(f => { if (req.body[f] !== undefined) job[f] = req.body[f]; });
    if (req.body.skills) job.skills = Array.isArray(req.body.skills) ? req.body.skills : req.body.skills.split(',').map(s => s.trim());
    await job.save();
    res.json(fmt(job.toObject()));
  } catch { res.status(500).json({ error: 'Server error' }); }
});

// DELETE /api/jobs/:id — delete job (employer owner)
router.delete('/:id', protect, employerOnly, async (req, res) => {
  try {
    const job = await Job.findOneAndDelete({ _id: req.params.id, employer: req.user._id });
    if (!job) return res.status(404).json({ error: 'Not found or not authorized' });
    await Application.deleteMany({ job: req.params.id });
    res.json({ message: 'Job deleted' });
  } catch { res.status(500).json({ error: 'Server error' }); }
});

// GET /api/jobs/:id/applications — get applicants for a job (employer)
router.get('/:id/applications', protect, employerOnly, async (req, res) => {
  try {
    const job = await Job.findOne({ _id: req.params.id, employer: req.user._id });
    if (!job) return res.status(404).json({ error: 'Not found or not authorized' });
    const apps = await Application.find({ job: req.params.id })
      .populate('candidate', 'name email headline skills location phone resumeUrl')
      .sort({ createdAt: -1 }).lean();
    res.json(apps);
  } catch { res.status(500).json({ error: 'Server error' }); }
});

function fmt(j) {
  return {
    id: j._id, title: j.title, company: j.company,
    location: j.location, type: j.type, category: j.category,
    salary: j.salary, description: j.description,
    requirements: j.requirements, benefits: j.benefits,
    skills: j.skills, status: j.status, featured: j.featured,
    deadline: j.deadline, applicantCount: j.applicantCount,
    employerId: j.employer?._id || j.employer,
    employerName: j.employer?.name,
    employerCompany: j.employer?.company,
    employerWebsite: j.employer?.website,
    employerDesc: j.employer?.companyDesc,
    createdAt: j.createdAt
  };
}

module.exports = router;
