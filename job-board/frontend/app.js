/* ====================================================
   JobBoard — Vanilla JS SPA
   Change API_URL to your deployed backend
   ==================================================== */
const API_URL = 'http://localhost:5000/api';

const CATEGORIES = [
  { name: 'Technology',    icon: '💻' },
  { name: 'Marketing',     icon: '📣' },
  { name: 'Design',        icon: '🎨' },
  { name: 'Finance',       icon: '💰' },
  { name: 'Healthcare',    icon: '🏥' },
  { name: 'Education',     icon: '📚' },
  { name: 'Engineering',   icon: '⚙️' },
  { name: 'Sales',         icon: '🤝' },
  { name: 'HR',            icon: '👥' },
  { name: 'Legal',         icon: '⚖️' },
  { name: 'Customer Service', icon: '📞' },
  { name: 'Data Science',  icon: '📊' }
];

const JOB_TYPES = ['Full-Time','Part-Time','Remote','Contract','Internship'];

/* ─── AUTH ────────────────────────────────────────────── */
const Auth = {
  get token() { return localStorage.getItem('jb_token'); },
  set token(t) { t ? localStorage.setItem('jb_token', t) : localStorage.removeItem('jb_token'); },
  get user()  { try { return JSON.parse(localStorage.getItem('jb_user')); } catch { return null; } },
  set user(u) { u ? localStorage.setItem('jb_user', JSON.stringify(u)) : localStorage.removeItem('jb_user'); },
  get isLoggedIn() { return !!this.token; },
  get isEmployer()  { return this.user?.role === 'employer'; },
  get isCandidate() { return this.user?.role === 'candidate'; },
  logout() { this.token = null; this.user = null; }
};

/* ─── API ─────────────────────────────────────────────── */
async function api(method, path, body, isForm = false) {
  const headers = {};
  if (Auth.token) headers['Authorization'] = 'Bearer ' + Auth.token;
  if (!isForm) headers['Content-Type'] = 'application/json';
  const res = await fetch(API_URL + path, {
    method, headers,
    body: body ? (isForm ? body : JSON.stringify(body)) : undefined
  });
  const data = res.headers.get('content-type')?.includes('json') ? await res.json() : await res.text();
  if (!res.ok) throw { status: res.status, data };
  return data;
}
const GET    = p        => api('GET', p);
const POST   = (p, b)   => api('POST', p, b);
const PUT    = (p, b)   => api('PUT', p, b);
const PATCH  = (p, b)   => api('PATCH', p, b);
const DEL    = p        => api('DELETE', p);
const POSTF  = (p, b)   => api('POST', p, b, true);

/* ─── ROUTER ──────────────────────────────────────────── */
const routes = {};
let currentRoute = 'home', currentParams = {};

function route(name, fn) { routes[name] = fn; }

function navigate(name, params = {}) {
  currentRoute = name; currentParams = params;
  window.scrollTo(0, 0);
  renderRoute();
}

function renderRoute() {
  updateNavbar();
  const fn = routes[currentRoute] || routes['home'];
  fn(currentParams);
}

/* ─── NAVBAR ──────────────────────────────────────────── */
function updateNavbar() {
  const user = Auth.user;
  const authLinks = document.getElementById('nav-auth-links');
  const userEl    = document.getElementById('nav-user');
  const dashEl    = document.getElementById('nav-dashboard');
  const nameEl    = document.getElementById('nav-name');

  if (Auth.isLoggedIn && user) {
    authLinks.style.display = 'none';
    userEl.style.display = 'flex';
    dashEl.style.display = 'block';
    nameEl.textContent = `👋 ${user.name.split(' ')[0]}`;
  } else {
    authLinks.style.display = 'flex';
    userEl.style.display = 'none';
    dashEl.style.display = 'none';
  }
}

function toggleMenu() {
  document.getElementById('nav-links').classList.toggle('open');
}

function logout() {
  Auth.logout();
  navigate('home');
}

/* ─── UTILS ───────────────────────────────────────────── */
function setMain(html) {
  document.getElementById('app').innerHTML = `<div class="fade-in">${html}</div>`;
}
function spinner() { return `<div class="spinner"><div class="spin"></div></div>`; }
function errAlert(msg) { return `<div class="alert alert-danger">⚠️ ${msg}</div>`; }
function successAlert(msg) { return `<div class="alert alert-success">✅ ${msg}</div>`; }

function requireAuth(cb) { if (!Auth.isLoggedIn) { navigate('login'); return; } cb(); }
function requireEmployer(cb) { if (!Auth.isEmployer) { navigate('home'); return; } cb(); }
function requireCandidate(cb) { if (!Auth.isCandidate) { navigate('home'); return; } cb(); }

function timeAgo(iso) {
  const d = Math.floor((Date.now() - new Date(iso)) / 86400000);
  if (d === 0) return 'Today';
  if (d === 1) return 'Yesterday';
  if (d < 7)   return `${d} days ago`;
  if (d < 30)  return `${Math.floor(d/7)} weeks ago`;
  return `${Math.floor(d/30)} months ago`;
}

function statusBadge(s) {
  const map = {
    pending: '⏳ Pending', reviewed: '👁 Reviewed',
    shortlisted: '⭐ Shortlisted', rejected: '❌ Rejected', hired: '🎉 Hired'
  };
  return `<span class="status-badge status-${s}">${map[s] || s}</span>`;
}

function typeBadge(t) {
  const colors = { 'Full-Time':'badge-blue','Part-Time':'badge-orange','Remote':'badge-green','Contract':'badge-gray','Internship':'badge-purple' };
  return `<span class="badge ${colors[t] || 'badge-gray'}">${t}</span>`;
}

/* ─── HOME PAGE ───────────────────────────────────────── */
route('home', async () => {
  setMain(`
    <!-- HERO -->
    <section class="hero">
      <div class="container hero-inner">
        <div class="hero-chip">🌟 #1 Job Board Platform</div>
        <h1>Find Your <span>Dream Job</span><br/>Today</h1>
        <p>Thousands of opportunities from top companies. Your next career move starts here.</p>

        <div class="hero-search" id="hero-search-form">
          <span class="search-icon">🔍</span>
          <input type="text" placeholder="Job title, keyword, or company" id="hs-keyword" />
          <div class="hero-search-divider"></div>
          <input type="text" placeholder="📍 Location" id="hs-location" />
          <div class="hero-search-divider"></div>
          <select id="hs-type">
            <option value="">All Types</option>
            ${JOB_TYPES.map(t => `<option>${t}</option>`).join('')}
          </select>
          <button class="btn btn-primary" onclick="heroSearch()">Search Jobs</button>
        </div>

        <div class="hero-tags">
          ${['Remote','Full-Time','React Developer','UI Designer','Data Analyst','Project Manager'].map(t =>
            `<span class="hero-tag" onclick="navigate('jobs',{search:'${t}'})">${t}</span>`
          ).join('')}
        </div>

        <div class="hero-stats">
          <div class="hero-stat"><div class="hero-stat-num" id="hs-jobs">—</div><div class="hero-stat-label">Open Jobs</div></div>
          <div class="hero-stat"><div class="hero-stat-num">500+</div><div class="hero-stat-label">Companies</div></div>
          <div class="hero-stat"><div class="hero-stat-num">50K+</div><div class="hero-stat-label">Job Seekers</div></div>
          <div class="hero-stat"><div class="hero-stat-num">98%</div><div class="hero-stat-label">Satisfaction</div></div>
        </div>
      </div>
    </section>

    <!-- CATEGORIES -->
    <section class="section bg-white">
      <div class="container">
        <div class="section-label-tag">Browse by Category</div>
        <h2 class="section-title">Explore Job Categories</h2>
        <div class="category-grid" id="cat-grid">
          ${CATEGORIES.map(c => `
            <div class="category-card" onclick="navigate('jobs',{category:'${c.name}'})">
              <div class="cat-icon">${c.icon}</div>
              <div class="cat-name">${c.name}</div>
              <div class="cat-count" id="cat-count-${c.name.replace(/\s/g,'')}">—</div>
            </div>
          `).join('')}
        </div>
      </div>
    </section>

    <!-- FEATURED JOBS -->
    <section class="section bg-gray">
      <div class="container">
        <div style="display:flex;align-items:flex-end;justify-content:space-between;margin-bottom:28px">
          <div>
            <div class="section-label-tag">Featured</div>
            <h2 class="section-title" style="margin-bottom:0">Latest Job Openings</h2>
          </div>
          <button class="btn btn-outline" onclick="navigate('jobs')">View All Jobs →</button>
        </div>
        <div id="featured-jobs">${spinner()}</div>
      </div>
    </section>

    <!-- HOW IT WORKS -->
    <section class="section bg-white">
      <div class="container" style="text-align:center">
        <div class="section-label-tag">How It Works</div>
        <h2 class="section-title">Get hired in 3 simple steps</h2>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:24px;margin-top:40px">
          ${[
            { n:'01', icon:'👤', t:'Create Profile', d:'Sign up and build your professional profile with your skills and experience.' },
            { n:'02', icon:'🔍', t:'Find Jobs', d:'Search thousands of jobs by keyword, location, type or category.' },
            { n:'03', icon:'✅', t:'Apply Instantly', d:'Submit your application with a cover letter and resume in one click.' }
          ].map(s => `
            <div style="background:var(--white);border:1px solid var(--border);border-radius:14px;padding:32px 24px;box-shadow:var(--shadow)">
              <div style="font-size:2.5rem;font-weight:900;color:var(--primary);opacity:.2;line-height:1;margin-bottom:12px">${s.n}</div>
              <div style="font-size:2rem;margin-bottom:12px">${s.icon}</div>
              <h3 style="font-size:1rem;font-weight:700;margin-bottom:8px">${s.t}</h3>
              <p style="font-size:.875rem;color:var(--text-muted);line-height:1.6">${s.d}</p>
            </div>
          `).join('')}
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="cta-section">
      <div class="container">
        <h2>Are you an employer?</h2>
        <p>Post your job openings and reach thousands of qualified candidates.</p>
        <div class="cta-btns">
          <button class="btn btn-white btn-lg" onclick="navigate('register')">Post a Job Free</button>
          <button class="btn btn-outline-white btn-lg" style="border-color:rgba(255,255,255,.4);color:#fff" onclick="navigate('jobs')">Browse Talent</button>
        </div>
      </div>
    </section>
  `);

  // Load data
  try {
    const data = await GET('/jobs?limit=6');
    document.getElementById('hs-jobs').textContent = data.total + '+';
    document.getElementById('featured-jobs').innerHTML = data.jobs.length
      ? data.jobs.map(j => jobCard(j)).join('')
      : '<p class="text-muted" style="text-align:center;padding:40px">No jobs yet.</p>';
  } catch {
    document.getElementById('featured-jobs').innerHTML = '<p class="text-muted" style="padding:20px">Could not load jobs.</p>';
  }
});

window.heroSearch = () => {
  const search   = document.getElementById('hs-keyword')?.value;
  const location = document.getElementById('hs-location')?.value;
  const type     = document.getElementById('hs-type')?.value;
  navigate('jobs', { search, location, type });
};

function jobCard(j) {
  const initials = j.company ? j.company[0].toUpperCase() : '?';
  return `
    <div class="job-card${j.featured ? ' featured' : ''}" onclick="navigate('job-detail',{id:'${j.id}'})">
      <div class="job-card-top">
        <div class="job-card-logo">${initials}</div>
        <div class="job-card-info">
          <div class="job-card-title">${j.title}</div>
          <div class="job-card-company">${j.company}</div>
        </div>
        <div>${typeBadge(j.type)}</div>
      </div>
      <div class="job-card-meta">
        <span>📍 ${j.location}</span>
        <span>💰 ${j.salary}</span>
        <span>📁 ${j.category}</span>
        ${j.deadline ? `<span>⏰ Closes ${new Date(j.deadline).toLocaleDateString()}</span>` : ''}
      </div>
      <div class="job-card-tags">${(j.skills || []).slice(0,4).map(s => `<span class="skill-chip">${s}</span>`).join('')}</div>
      <div class="job-card-actions">
        <span class="job-card-date">${timeAgo(j.createdAt)}</span>
        <button class="btn btn-primary btn-sm" onclick="event.stopPropagation();navigate('job-detail',{id:'${j.id}'})">View Job</button>
      </div>
    </div>`;
}

/* ─── JOB LISTINGS ────────────────────────────────────── */
let jSearch = '', jCategory = '', jType = '', jLocation = '', jPage = 1;
let searchDebounce;

route('jobs', async (params) => {
  jSearch   = params.search   || '';
  jCategory = params.category || '';
  jType     = params.type     || '';
  jLocation = params.location || '';
  jPage     = 1;

  setMain(`
    <div class="container" style="padding-top:32px;padding-bottom:48px">
      <div class="page-header-row">
        <div><h1 class="page-title">Browse Jobs</h1><p class="page-sub" id="jobs-count">Loading...</p></div>
      </div>

      <!-- Search Bar -->
      <div class="search-bar mb-4">
        <span class="search-icon">🔍</span>
        <input type="search" placeholder="Search by title, company, or keyword..." id="jobs-search" value="${jSearch}" oninput="handleJobSearch(this.value)" style="border:none;outline:none;width:100%;font-size:.95rem;font-family:inherit" />
      </div>

      <div class="jobs-layout">
        <!-- Filters -->
        <aside>
          <div class="filter-card">
            <div class="filter-title">🔧 Filters</div>

            <div class="filter-section">
              <div class="filter-section-title">Location</div>
              <input class="form-control" type="text" placeholder="Any location" id="filter-loc" value="${jLocation}" oninput="handleLocSearch(this.value)" />
            </div>

            <div class="filter-section">
              <div class="filter-section-title">Job Type</div>
              ${JOB_TYPES.map(t => `
                <label class="filter-check">
                  <input type="radio" name="jtype" value="${t}" ${jType===t?'checked':''} onchange="jType=this.value;jPage=1;loadJobs()" />
                  <span>${t}</span>
                </label>
              `).join('')}
              <label class="filter-check">
                <input type="radio" name="jtype" value="" ${!jType?'checked':''} onchange="jType='';jPage=1;loadJobs()" />
                <span>All Types</span>
              </label>
            </div>

            <div class="filter-section">
              <div class="filter-section-title">Category</div>
              <select class="form-control" onchange="jCategory=this.value;jPage=1;loadJobs()">
                <option value="">All Categories</option>
                ${CATEGORIES.map(c => `<option value="${c.name}" ${jCategory===c.name?'selected':''}>${c.icon} ${c.name}</option>`).join('')}
              </select>
            </div>

            <button class="btn btn-ghost btn-block btn-sm" onclick="jSearch='';jCategory='';jType='';jLocation='';jPage=1;document.getElementById('jobs-search').value='';document.getElementById('filter-loc').value='';loadJobs()">Clear Filters</button>
          </div>
        </aside>

        <!-- Jobs -->
        <div>
          <div id="jobs-list">${spinner()}</div>
          <div id="jobs-pagination" class="pagination"></div>
        </div>
      </div>
    </div>
  `);

  loadJobs();
});

window.handleJobSearch = (v) => {
  jSearch = v; jPage = 1;
  clearTimeout(searchDebounce);
  searchDebounce = setTimeout(loadJobs, 380);
};

window.handleLocSearch = (v) => {
  jLocation = v; jPage = 1;
  clearTimeout(searchDebounce);
  searchDebounce = setTimeout(loadJobs, 380);
};

async function loadJobs() {
  const list = document.getElementById('jobs-list');
  if (!list) return;
  list.innerHTML = spinner();

  try {
    const p = new URLSearchParams({ page: jPage, limit: 10 });
    if (jSearch)   p.set('search', jSearch);
    if (jCategory) p.set('category', jCategory);
    if (jType)     p.set('type', jType);
    if (jLocation) p.set('location', jLocation);

    const data = await GET('/jobs?' + p);
    const count = document.getElementById('jobs-count');
    if (count) count.textContent = `${data.total} job${data.total !== 1 ? 's' : ''} found`;

    list.innerHTML = data.jobs.length
      ? data.jobs.map(j => jobCard(j)).join('')
      : `<div class="empty-state"><div class="empty-icon">🔍</div><h3>No jobs found</h3><p class="text-muted">Try different search terms or filters</p></div>`;

    const pag = document.getElementById('jobs-pagination');
    if (pag && data.totalPages > 1) {
      pag.innerHTML = `
        <button class="btn btn-outline btn-sm" ${jPage===1?'disabled':''} onclick="jPage--;loadJobs()">← Prev</button>
        <span class="text-muted text-sm">Page ${jPage} of ${data.totalPages}</span>
        <button class="btn btn-outline btn-sm" ${jPage===data.totalPages?'disabled':''} onclick="jPage++;loadJobs()">Next →</button>`;
    } else if (pag) pag.innerHTML = '';
  } catch {
    if (list) list.innerHTML = errAlert('Failed to load jobs');
  }
}

/* ─── JOB DETAIL ──────────────────────────────────────── */
route('job-detail', async ({ id }) => {
  setMain(`<div class="container-md" style="padding-top:32px">${spinner()}</div>`);
  try {
    const j = await GET('/jobs/' + id);
    let applied = false;
    if (Auth.isCandidate) {
      const check = await GET('/applications/check/' + id).catch(() => ({ applied: false }));
      applied = check.applied;
    }

    setMain(`
      <div class="container-md" style="padding:32px 24px 48px">
        <button class="back-link" onclick="navigate('jobs')">← Back to Jobs</button>

        <div class="job-detail-header">
          <div class="job-detail-top">
            <div class="job-detail-logo">${j.company?.[0]?.toUpperCase()}</div>
            <div style="flex:1">
              <h1 class="job-detail-title">${j.title}</h1>
              <div class="job-detail-company">${j.company}</div>
              <div class="job-detail-meta">
                <span>📍 ${j.location}</span>
                <span>💰 ${j.salary}</span>
                <span>📁 ${j.category}</span>
                ${j.deadline ? `<span>⏰ Deadline: ${new Date(j.deadline).toLocaleDateString()}</span>` : ''}
                <span>👥 ${j.applicantCount} applicant${j.applicantCount !== 1 ? 's' : ''}</span>
                <span>📅 Posted ${timeAgo(j.createdAt)}</span>
              </div>
              <div style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap">
                ${typeBadge(j.type)}
                <span class="badge ${j.status==='active'?'badge-green':'badge-red'}">${j.status==='active'?'Active':'Closed'}</span>
              </div>
            </div>
          </div>

          <div class="job-detail-actions">
            ${j.status === 'active' ? (
              Auth.isCandidate
                ? applied
                  ? `<span class="applied-badge" style="font-size:.9rem;padding:8px 16px">✅ Applied</span>`
                  : `<button class="btn btn-primary btn-lg" onclick="navigate('apply',{jobId:'${id}',jobTitle:'${j.title}',company:'${j.company}'})">Apply Now →</button>`
                : !Auth.isLoggedIn
                  ? `<button class="btn btn-primary btn-lg" onclick="navigate('login')">Sign In to Apply</button>`
                  : ''
            ) : '<span class="badge badge-red" style="padding:8px 16px;font-size:.85rem">This job is closed</span>'}
            ${j.employerWebsite ? `<a href="${j.employerWebsite}" target="_blank" class="btn btn-outline">🌐 Company Website</a>` : ''}
          </div>
        </div>

        <div class="two-col">
          <div>
            ${j.description ? `<h3 class="section-heading">📋 Job Description</h3><div class="prose">${j.description}</div>` : ''}
            ${j.requirements ? `<h3 class="section-heading">✅ Requirements</h3><div class="prose">${j.requirements}</div>` : ''}
            ${j.benefits ? `<h3 class="section-heading">🎁 Benefits</h3><div class="prose">${j.benefits}</div>` : ''}
            ${j.skills?.length ? `<h3 class="section-heading">🛠 Required Skills</h3><div class="skills-list">${j.skills.map(s => `<span class="skill-chip">${s}</span>`).join('')}</div>` : ''}
          </div>

          <div>
            ${j.employerDesc ? `
              <div class="card" style="margin-bottom:16px">
                <div class="card-body">
                  <h4 style="font-weight:700;margin-bottom:10px">About ${j.company}</h4>
                  <p class="text-sm text-muted" style="line-height:1.65">${j.employerDesc}</p>
                  ${j.employerWebsite ? `<a href="${j.employerWebsite}" target="_blank" class="btn btn-ghost btn-sm" style="margin-top:12px">🌐 Visit Website</a>` : ''}
                </div>
              </div>` : ''}
            <div class="card">
              <div class="card-body">
                <h4 style="font-weight:700;margin-bottom:12px">Job Summary</h4>
                <div style="display:flex;flex-direction:column;gap:10px">
                  ${[['📁','Category',j.category],['🏢','Type',j.type],['📍','Location',j.location],['💰','Salary',j.salary],['👥','Applicants',j.applicantCount]].map(([ic,lb,vl]) =>
                    `<div style="display:flex;justify-content:space-between;font-size:.875rem"><span class="text-muted">${ic} ${lb}</span><strong>${vl}</strong></div>`
                  ).join('')}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `);
  } catch {
    setMain(`<div class="container-md" style="padding-top:32px">${errAlert('Job not found')}<button class="btn btn-outline mt-3" onclick="navigate('jobs')">← Browse Jobs</button></div>`);
  }
});

/* ─── APPLY ───────────────────────────────────────────── */
route('apply', ({ jobId, jobTitle, company }) => {
  requireCandidate(() => {
    setMain(`
      <div class="container-sm" style="padding:40px 24px">
        <button class="back-link" onclick="navigate('job-detail',{id:'${jobId}'})">← Back to Job</button>
        <h1 class="page-title">Apply for Position</h1>
        <p class="page-sub mb-4">📋 ${jobTitle} at <strong>${company}</strong></p>

        <div id="apply-alert"></div>

        <div class="card">
          <div class="card-body">
            <form id="apply-form" enctype="multipart/form-data">
              <div class="form-group">
                <label class="form-label">Cover Letter *</label>
                <textarea class="form-control" name="coverLetter" rows="7" placeholder="Tell the employer why you're a great fit for this role..."></textarea>
                <div class="form-hint">Explain your relevant experience and why you're interested in this position.</div>
              </div>

              <div class="form-group">
                <label class="form-label">Resume / CV</label>
                <input class="form-control" type="file" name="resume" accept=".pdf,.doc,.docx" />
                <div class="form-hint">Upload PDF, DOC, or DOCX (max 5MB). Leave empty to use your profile resume.</div>
              </div>

              <div class="alert alert-info">📧 You'll receive an email confirmation once your application is submitted.</div>

              <button class="btn btn-primary btn-lg" type="submit" id="apply-btn">Submit Application →</button>
            </form>
          </div>
        </div>
      </div>
    `);

    document.getElementById('apply-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = document.getElementById('apply-btn');
      btn.disabled = true; btn.textContent = 'Submitting...';
      document.getElementById('apply-alert').innerHTML = '';
      try {
        const fd = new FormData(e.target);
        fd.append('jobId', jobId);
        await POSTF('/applications', fd);
        document.getElementById('apply-alert').innerHTML = successAlert('Application submitted! Check your email for confirmation.');
        btn.textContent = '✅ Applied';
      } catch (err) {
        document.getElementById('apply-alert').innerHTML = errAlert(err?.data?.error || 'Failed to submit');
        btn.disabled = false; btn.textContent = 'Submit Application →';
      }
    });
  });
});

/* ─── LOGIN ───────────────────────────────────────────── */
route('login', () => {
  setMain(`
    <div class="auth-wrap">
      <div class="auth-box">
        <div class="auth-logo">💼 JobBoard</div>
        <h1 class="auth-title">Welcome back</h1>
        <p class="auth-sub">Sign in to your account</p>
        <div id="login-alert"></div>
        <form id="login-form">
          <div class="form-group"><label class="form-label">Email</label><input class="form-control" type="email" name="email" placeholder="you@example.com" required /></div>
          <div class="form-group"><label class="form-label">Password</label><input class="form-control" type="password" name="password" placeholder="••••••••" required /></div>
          <button class="btn btn-primary btn-block" id="login-btn">Sign In</button>
        </form>
        <p class="auth-footer">Don't have an account? <a href="#" onclick="navigate('register')">Sign up</a></p>
      </div>
    </div>
  `);

  document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target), btn = document.getElementById('login-btn');
    btn.disabled = true; btn.textContent = 'Signing in...';
    try {
      const data = await POST('/auth/login', { email: fd.get('email'), password: fd.get('password') });
      Auth.token = data.token; Auth.user = data.user;
      navigate(data.user.role === 'employer' ? 'employer-dashboard' : 'candidate-dashboard');
    } catch (err) {
      document.getElementById('login-alert').innerHTML = errAlert(err?.data?.error || 'Invalid credentials');
      btn.disabled = false; btn.textContent = 'Sign In';
    }
  });
});

/* ─── REGISTER ────────────────────────────────────────── */
route('register', () => {
  let selectedRole = 'candidate';

  setMain(`
    <div class="auth-wrap">
      <div class="auth-box" style="max-width:520px">
        <div class="auth-logo">💼 JobBoard</div>
        <h1 class="auth-title">Create Account</h1>
        <p class="auth-sub">Join thousands of job seekers and employers</p>

        <div class="role-selector">
          <div class="role-option active" id="role-candidate" onclick="selectRole('candidate')">
            <div class="role-icon">👤</div><div class="role-label">Job Seeker</div><div style="font-size:.75rem;color:var(--text-muted);margin-top:2px">I want to find a job</div>
          </div>
          <div class="role-option" id="role-employer" onclick="selectRole('employer')">
            <div class="role-icon">🏢</div><div class="role-label">Employer</div><div style="font-size:.75rem;color:var(--text-muted);margin-top:2px">I want to hire</div>
          </div>
        </div>

        <div id="reg-alert"></div>
        <form id="reg-form">
          <div class="input-row">
            <div class="form-group"><label class="form-label">Full Name</label><input class="form-control" name="name" placeholder="Jane Smith" required /></div>
            <div class="form-group" id="company-field" style="display:none"><label class="form-label">Company Name</label><input class="form-control" name="company" placeholder="Acme Corp" /></div>
          </div>
          <div class="form-group"><label class="form-label">Email</label><input class="form-control" type="email" name="email" placeholder="you@example.com" required /></div>
          <div class="form-group"><label class="form-label">Password</label><input class="form-control" type="password" name="password" placeholder="At least 6 characters" required minlength="6" /></div>
          <button class="btn btn-primary btn-block" id="reg-btn">Create Account</button>
        </form>
        <p class="auth-footer">Already have an account? <a href="#" onclick="navigate('login')">Sign in</a></p>
      </div>
    </div>
  `);

  window.selectRole = (role) => {
    selectedRole = role;
    document.getElementById('role-candidate').classList.toggle('active', role === 'candidate');
    document.getElementById('role-employer').classList.toggle('active', role === 'employer');
    document.getElementById('company-field').style.display = role === 'employer' ? 'block' : 'none';
  };

  document.getElementById('reg-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target), btn = document.getElementById('reg-btn');
    btn.disabled = true; btn.textContent = 'Creating account...';
    try {
      const data = await POST('/auth/register', {
        name: fd.get('name'), email: fd.get('email'),
        password: fd.get('password'), role: selectedRole,
        company: fd.get('company') || ''
      });
      Auth.token = data.token; Auth.user = data.user;
      navigate(data.user.role === 'employer' ? 'employer-dashboard' : 'candidate-dashboard');
    } catch (err) {
      document.getElementById('reg-alert').innerHTML = errAlert(err?.data?.error || 'Registration failed');
      btn.disabled = false; btn.textContent = 'Create Account';
    }
  });
});

/* ─── DASHBOARD ROUTER ────────────────────────────────── */
route('dashboard', () => {
  if (!Auth.isLoggedIn) return navigate('login');
  navigate(Auth.isEmployer ? 'employer-dashboard' : 'candidate-dashboard');
});

/* ─── EMPLOYER DASHBOARD ──────────────────────────────── */
route('employer-dashboard', async () => {
  requireEmployer(async () => {
    const user = Auth.user;
    setMain(`
      <div class="container" style="padding-top:32px;padding-bottom:48px">
        <div class="page-header-row">
          <div><h1 class="page-title">Employer Dashboard</h1><p class="page-sub">Welcome back, ${user.company || user.name} 🏢</p></div>
          <button class="btn btn-primary" onclick="navigate('post-job')">➕ Post New Job</button>
        </div>
        <div class="stats-row" id="emp-stats">${spinner()}</div>
        <div class="two-col">
          <div class="card">
            <div class="card-header"><h3>My Job Listings</h3><button class="btn btn-ghost btn-sm" onclick="navigate('post-job')">+ New</button></div>
            <div id="emp-jobs">${spinner()}</div>
          </div>
          <div class="card">
            <div class="card-header"><h3>Account Info</h3><button class="btn btn-ghost btn-sm" onclick="navigate('profile')">Edit</button></div>
            <div class="card-body">
              <p class="text-sm"><strong>Name:</strong> ${user.name}</p>
              <p class="text-sm mt-3"><strong>Email:</strong> ${user.email}</p>
              <p class="text-sm mt-3"><strong>Company:</strong> ${user.company || '—'}</p>
              <p class="text-sm mt-3"><strong>Industry:</strong> ${user.industry || '—'}</p>
              <p class="text-sm mt-3"><strong>Website:</strong> ${user.website ? `<a href="${user.website}" target="_blank">${user.website}</a>` : '—'}</p>
            </div>
          </div>
        </div>
      </div>
    `);

    try {
      const [stats, jobs] = await Promise.all([GET('/users/stats'), GET('/jobs/my')]);

      document.getElementById('emp-stats').innerHTML = `
        <div class="stat-card"><div class="stat-value text-primary">${stats.totalJobs}</div><div class="stat-label">📋 Total Jobs</div></div>
        <div class="stat-card"><div class="stat-value text-success">${stats.activeJobs}</div><div class="stat-label">✅ Active Jobs</div></div>
        <div class="stat-card"><div class="stat-value text-warning">${stats.closedJobs}</div><div class="stat-label">🔒 Closed Jobs</div></div>
        <div class="stat-card"><div class="stat-value text-purple">${stats.totalApplicants}</div><div class="stat-label">👥 Total Applicants</div></div>`;

      const ejEl = document.getElementById('emp-jobs');
      if (!jobs.length) {
        ejEl.innerHTML = `<div class="empty-state"><div class="empty-icon">📋</div><p>No jobs posted yet.</p><button class="btn btn-primary btn-sm mt-3" onclick="navigate('post-job')">Post First Job</button></div>`;
      } else {
        ejEl.innerHTML = `<div class="table-wrap"><table><thead><tr><th>Title</th><th>Location</th><th>Applicants</th><th>Status</th><th>Actions</th></tr></thead><tbody>
          ${jobs.map(j => `<tr>
            <td><div class="font-semibold" style="font-size:.875rem">${j.title}</div><div class="text-xs text-muted">${j.type}</div></td>
            <td class="text-sm text-muted">📍 ${j.location}</td>
            <td class="text-sm"><strong>${j.applicantCount}</strong></td>
            <td><span class="badge ${j.status==='active'?'badge-green':'badge-gray'}">${j.status}</span></td>
            <td><div style="display:flex;gap:6px">
              <button class="btn btn-ghost btn-sm" onclick="navigate('view-applicants',{id:'${j.id}',title:'${j.title}'})">👥 View</button>
              <button class="btn btn-ghost btn-sm" onclick="navigate('edit-job',{id:'${j.id}'})">✏️</button>
              <button class="btn btn-danger btn-sm" onclick="deleteJob('${j.id}')">🗑</button>
            </div></td>
          </tr>`).join('')}
        </tbody></table></div>`;
      }
    } catch { document.getElementById('emp-stats').innerHTML = errAlert('Failed to load data'); }
  });
});

window.deleteJob = async (id) => {
  if (!confirm('Delete this job? All applications will also be deleted.')) return;
  try { await DEL('/jobs/' + id); navigate('employer-dashboard'); }
  catch { alert('Failed to delete'); }
};

/* ─── POST JOB ────────────────────────────────────────── */
route('post-job', () => {
  requireEmployer(() => {
    setMain(`
      <div class="container-md" style="padding:32px 24px 48px">
        <button class="back-link" onclick="navigate('employer-dashboard')">← Dashboard</button>
        <h1 class="page-title">Post a New Job</h1>
        <p class="page-sub mb-4">Fill in the details to attract the right candidates</p>
        <div id="pj-alert"></div>
        <div class="card"><div class="card-body">
          <form id="post-job-form">
            <div class="input-row">
              <div class="form-group"><label class="form-label">Job Title *</label><input class="form-control" name="title" placeholder="e.g. Senior React Developer" required /></div>
              <div class="form-group"><label class="form-label">Location *</label><input class="form-control" name="location" placeholder="e.g. New York, NY or Remote" required /></div>
            </div>
            <div class="input-row-3">
              <div class="form-group"><label class="form-label">Job Type *</label>
                <select class="form-control" name="type" required>
                  <option value="">Select type</option>
                  ${JOB_TYPES.map(t => `<option>${t}</option>`).join('')}
                </select>
              </div>
              <div class="form-group"><label class="form-label">Category *</label>
                <select class="form-control" name="category" required>
                  <option value="">Select category</option>
                  ${CATEGORIES.map(c => `<option>${c.name}</option>`).join('')}
                </select>
              </div>
              <div class="form-group"><label class="form-label">Salary / Range</label><input class="form-control" name="salary" placeholder="e.g. $80K–$100K/yr" /></div>
            </div>
            <div class="form-group"><label class="form-label">Job Description *</label><textarea class="form-control" name="description" rows="6" placeholder="Describe the role, responsibilities, and what a typical day looks like..." required></textarea></div>
            <div class="form-group"><label class="form-label">Requirements</label><textarea class="form-control" name="requirements" rows="4" placeholder="List educational background, years of experience, certifications needed..."></textarea></div>
            <div class="form-group"><label class="form-label">Benefits</label><textarea class="form-control" name="benefits" rows="3" placeholder="Health insurance, 401k, remote work, flexible hours..."></textarea></div>
            <div class="input-row">
              <div class="form-group"><label class="form-label">Required Skills (comma separated)</label><input class="form-control" name="skills" placeholder="e.g. React, Node.js, MongoDB" /></div>
              <div class="form-group"><label class="form-label">Application Deadline</label><input class="form-control" type="date" name="deadline" /></div>
            </div>
            <button class="btn btn-primary btn-lg" type="submit" id="pj-btn">Post Job →</button>
          </form>
        </div></div>
      </div>
    `);

    document.getElementById('post-job-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = new FormData(e.target), btn = document.getElementById('pj-btn');
      btn.disabled = true; btn.textContent = 'Posting...';
      try {
        await POST('/jobs', Object.fromEntries(fd));
        document.getElementById('pj-alert').innerHTML = successAlert('Job posted successfully!');
        setTimeout(() => navigate('employer-dashboard'), 1500);
      } catch (err) {
        document.getElementById('pj-alert').innerHTML = errAlert(err?.data?.error || 'Failed to post job');
        btn.disabled = false; btn.textContent = 'Post Job →';
      }
    });
  });
});

/* ─── EDIT JOB ────────────────────────────────────────── */
route('edit-job', async ({ id }) => {
  requireEmployer(async () => {
    setMain(`<div class="container-md" style="padding-top:32px">${spinner()}</div>`);
    try {
      const j = await GET('/jobs/' + id);
      setMain(`
        <div class="container-md" style="padding:32px 24px 48px">
          <button class="back-link" onclick="navigate('employer-dashboard')">← Dashboard</button>
          <h1 class="page-title">Edit Job</h1>
          <div id="ej-alert"></div>
          <div class="card"><div class="card-body">
            <form id="edit-job-form">
              <div class="input-row">
                <div class="form-group"><label class="form-label">Job Title</label><input class="form-control" name="title" value="${j.title}" required /></div>
                <div class="form-group"><label class="form-label">Location</label><input class="form-control" name="location" value="${j.location}" required /></div>
              </div>
              <div class="input-row-3">
                <div class="form-group"><label class="form-label">Job Type</label>
                  <select class="form-control" name="type">${JOB_TYPES.map(t => `<option ${j.type===t?'selected':''}>${t}</option>`).join('')}</select></div>
                <div class="form-group"><label class="form-label">Category</label>
                  <select class="form-control" name="category">${CATEGORIES.map(c => `<option ${j.category===c.name?'selected':''}>${c.name}</option>`).join('')}</select></div>
                <div class="form-group"><label class="form-label">Status</label>
                  <select class="form-control" name="status">
                    <option value="active" ${j.status==='active'?'selected':''}>Active</option>
                    <option value="closed" ${j.status==='closed'?'selected':''}>Closed</option>
                  </select></div>
              </div>
              <div class="form-group"><label class="form-label">Salary</label><input class="form-control" name="salary" value="${j.salary}" /></div>
              <div class="form-group"><label class="form-label">Description</label><textarea class="form-control" name="description" rows="6">${j.description}</textarea></div>
              <div class="form-group"><label class="form-label">Requirements</label><textarea class="form-control" name="requirements" rows="4">${j.requirements||''}</textarea></div>
              <div class="form-group"><label class="form-label">Benefits</label><textarea class="form-control" name="benefits" rows="3">${j.benefits||''}</textarea></div>
              <div class="form-group"><label class="form-label">Skills (comma separated)</label><input class="form-control" name="skills" value="${(j.skills||[]).join(', ')}" /></div>
              <button class="btn btn-primary btn-lg" type="submit" id="ej-btn">Save Changes</button>
            </form>
          </div></div>
        </div>
      `);

      document.getElementById('edit-job-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const fd = new FormData(e.target), btn = document.getElementById('ej-btn');
        btn.disabled = true; btn.textContent = 'Saving...';
        try {
          await PUT('/jobs/' + id, Object.fromEntries(fd));
          document.getElementById('ej-alert').innerHTML = successAlert('Job updated!');
          btn.disabled = false; btn.textContent = 'Save Changes';
        } catch (err) {
          document.getElementById('ej-alert').innerHTML = errAlert(err?.data?.error || 'Failed to update');
          btn.disabled = false; btn.textContent = 'Save Changes';
        }
      });
    } catch { setMain(errAlert('Job not found')); }
  });
});

/* ─── VIEW APPLICANTS ─────────────────────────────────── */
route('view-applicants', async ({ id, title }) => {
  requireEmployer(async () => {
    setMain(`<div class="container-md" style="padding-top:32px">${spinner()}</div>`);
    try {
      const apps = await GET(`/jobs/${id}/applications`);
      setMain(`
        <div class="container" style="padding:32px 24px 48px">
          <button class="back-link" onclick="navigate('employer-dashboard')">← Dashboard</button>
          <div class="page-header-row">
            <div><h1 class="page-title">Applicants</h1><p class="page-sub">${title} · ${apps.length} application${apps.length!==1?'s':''}</p></div>
          </div>
          ${!apps.length
            ? `<div class="empty-state"><div class="empty-icon">👥</div><h3>No applications yet</h3></div>`
            : `<div class="card"><div class="table-wrap"><table>
                <thead><tr><th>Candidate</th><th>Contact</th><th>Skills</th><th>Status</th><th>Applied</th><th>Actions</th></tr></thead>
                <tbody>
                  ${apps.map(a => `<tr>
                    <td>
                      <div class="font-semibold text-sm">${a.candidate?.name}</div>
                      <div class="text-xs text-muted">${a.candidate?.headline||'—'}</div>
                    </td>
                    <td class="text-sm text-muted">${a.candidate?.email}<br/>${a.candidate?.location||''}</td>
                    <td><div style="display:flex;flex-wrap:wrap;gap:4px">${(a.candidate?.skills||[]).slice(0,3).map(s=>`<span class="badge badge-blue" style="font-size:.7rem">${s}</span>`).join('')}</div></td>
                    <td>${statusBadge(a.status)}</td>
                    <td class="text-xs text-muted">${timeAgo(a.createdAt)}</td>
                    <td><div style="display:flex;gap:6px;flex-wrap:wrap">
                      ${a.resumeUrl ? `<a href="http://localhost:5000${a.resumeUrl}" target="_blank" class="btn btn-outline btn-sm">📄 Resume</a>` : ''}
                      <select class="form-control" style="padding:5px 8px;font-size:.78rem;width:auto" onchange="updateStatus('${a._id}',this.value)">
                        ${['pending','reviewed','shortlisted','rejected','hired'].map(s=>`<option value="${s}" ${a.status===s?'selected':''}>${s.charAt(0).toUpperCase()+s.slice(1)}</option>`).join('')}
                      </select>
                    </div></td>
                  </tr>`).join('')}
                </tbody>
              </table></div></div>`}
        </div>
      `);
    } catch { setMain(errAlert('Failed to load applicants')); }
  });
});

window.updateStatus = async (appId, status) => {
  try { await PATCH(`/applications/${appId}/status`, { status }); }
  catch { alert('Failed to update status'); }
};

/* ─── CANDIDATE DASHBOARD ─────────────────────────────── */
route('candidate-dashboard', async () => {
  requireCandidate(async () => {
    const user = Auth.user;
    setMain(`
      <div class="container" style="padding-top:32px;padding-bottom:48px">
        <div class="page-header-row">
          <div><h1 class="page-title">My Dashboard</h1><p class="page-sub">Welcome back, ${user.name.split(' ')[0]} 👋</p></div>
          <button class="btn btn-primary" onclick="navigate('jobs')">🔍 Browse Jobs</button>
        </div>
        <div class="stats-row" id="cand-stats">${spinner()}</div>
        <div class="two-col">
          <div class="card">
            <div class="card-header"><h3>My Applications</h3></div>
            <div id="cand-apps">${spinner()}</div>
          </div>
          <div class="card">
            <div class="card-header"><h3>My Profile</h3><button class="btn btn-ghost btn-sm" onclick="navigate('profile')">Edit</button></div>
            <div class="card-body">
              <div style="text-align:center;margin-bottom:16px">
                <div style="width:64px;height:64px;border-radius:50%;background:var(--primary);color:#fff;font-size:1.5rem;font-weight:800;display:flex;align-items:center;justify-content:center;margin:0 auto 10px">${user.name[0].toUpperCase()}</div>
                <div class="font-bold">${user.name}</div>
                <div class="text-sm text-muted">${user.headline || 'Add your headline'}</div>
              </div>
              <div style="display:flex;flex-direction:column;gap:8px;font-size:.875rem">
                <div>📧 ${user.email}</div>
                <div>📍 ${user.location || '—'}</div>
                <div>📞 ${user.phone || '—'}</div>
              </div>
              ${user.skills?.length ? `<div style="margin-top:14px"><div class="text-xs text-muted font-bold mb-2">SKILLS</div><div class="skills-list">${user.skills.map(s=>`<span class="skill-chip">${s}</span>`).join('')}</div></div>` : ''}
              ${user.resumeUrl ? `<a href="http://localhost:5000${user.resumeUrl}" target="_blank" class="btn btn-outline btn-sm mt-3">📄 View Resume</a>` : `<button class="btn btn-ghost btn-sm mt-3" onclick="navigate('profile')">📤 Upload Resume</button>`}
            </div>
          </div>
        </div>
      </div>
    `);

    try {
      const [stats, apps] = await Promise.all([GET('/users/stats'), GET('/applications/my')]);
      document.getElementById('cand-stats').innerHTML = `
        <div class="stat-card"><div class="stat-value text-primary">${stats.totalApplications}</div><div class="stat-label">📝 Applied</div></div>
        <div class="stat-card"><div class="stat-value text-warning">${stats.pending}</div><div class="stat-label">⏳ Pending</div></div>
        <div class="stat-card"><div class="stat-value text-purple">${stats.shortlisted}</div><div class="stat-label">⭐ Shortlisted</div></div>
        <div class="stat-card"><div class="stat-value text-success">${stats.hired}</div><div class="stat-label">🎉 Hired</div></div>`;

      const appsEl = document.getElementById('cand-apps');
      if (!apps.length) {
        appsEl.innerHTML = `<div class="empty-state"><div class="empty-icon">📝</div><p>No applications yet.</p><button class="btn btn-primary btn-sm mt-3" onclick="navigate('jobs')">Browse Jobs</button></div>`;
      } else {
        appsEl.innerHTML = `<div class="table-wrap"><table><thead><tr><th>Job</th><th>Company</th><th>Type</th><th>Status</th><th>Applied</th></tr></thead><tbody>
          ${apps.map(a => `<tr style="cursor:pointer" onclick="navigate('job-detail',{id:'${a.job?.id}'})">
            <td><div class="font-semibold text-sm">${a.job?.title || 'Job removed'}</div></td>
            <td class="text-sm text-muted">${a.job?.company || '—'}</td>
            <td>${a.job ? typeBadge(a.job.type) : ''}</td>
            <td>${statusBadge(a.status)}</td>
            <td class="text-xs text-muted">${timeAgo(a.createdAt)}</td>
          </tr>`).join('')}
        </tbody></table></div>`;
      }
    } catch { document.getElementById('cand-stats').innerHTML = errAlert('Failed to load data'); }
  });
});

/* ─── PROFILE EDIT ────────────────────────────────────── */
route('profile', () => {
  requireAuth(() => {
    const user = Auth.user;
    const isEmp = Auth.isEmployer;
    setMain(`
      <div class="container-sm" style="padding:32px 24px 48px">
        <button class="back-link" onclick="navigate('dashboard')">← Dashboard</button>
        <h1 class="page-title">Edit Profile</h1>
        <div id="profile-alert"></div>
        <div class="card"><div class="card-body">
          <form id="profile-form" enctype="multipart/form-data">
            <div class="form-group"><label class="form-label">Full Name</label><input class="form-control" name="name" value="${user.name}" required /></div>
            <div class="form-group"><label class="form-label">Location</label><input class="form-control" name="location" value="${user.location||''}" placeholder="City, Country" /></div>
            <div class="form-group"><label class="form-label">Phone</label><input class="form-control" name="phone" value="${user.phone||''}" placeholder="+1 234 567 8900" /></div>
            ${isEmp ? `
              <div class="form-group"><label class="form-label">Company Name</label><input class="form-control" name="company" value="${user.company||''}" /></div>
              <div class="form-group"><label class="form-label">Industry</label><input class="form-control" name="industry" value="${user.industry||''}" /></div>
              <div class="form-group"><label class="form-label">Website</label><input class="form-control" name="website" value="${user.website||''}" placeholder="https://yourcompany.com" /></div>
              <div class="form-group"><label class="form-label">Company Description</label><textarea class="form-control" name="companyDesc" rows="4">${user.companyDesc||''}</textarea></div>
            ` : `
              <div class="form-group"><label class="form-label">Professional Headline</label><input class="form-control" name="headline" value="${user.headline||''}" placeholder="e.g. Full Stack Developer with 5 years experience" /></div>
              <div class="form-group"><label class="form-label">Skills (comma separated)</label><input class="form-control" name="skills" value="${(user.skills||[]).join(', ')}" placeholder="React, Node.js, Python" /></div>
              <div class="form-group"><label class="form-label">Experience</label><textarea class="form-control" name="experience" rows="3" placeholder="Describe your work experience...">${user.experience||''}</textarea></div>
              <div class="form-group"><label class="form-label">Education</label><textarea class="form-control" name="education" rows="2" placeholder="Your educational background...">${user.education||''}</textarea></div>
              <div class="form-group"><label class="form-label">Upload Resume (PDF/DOC/DOCX, max 5MB)</label><input class="form-control" type="file" name="resume" accept=".pdf,.doc,.docx" />${user.resumeUrl ? `<div class="form-hint">Current: <a href="http://localhost:5000${user.resumeUrl}" target="_blank">View Resume</a></div>` : ''}</div>
            `}
            <hr class="divider" />
            <div class="form-group"><label class="form-label">New Password (leave blank to keep current)</label><input class="form-control" type="password" name="password" placeholder="Min 6 characters" minlength="6" /></div>
            <button class="btn btn-primary btn-block" type="submit" id="profile-btn">Save Profile</button>
          </form>
        </div></div>
      </div>
    `);

    document.getElementById('profile-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = new FormData(e.target), btn = document.getElementById('profile-btn');
      btn.disabled = true; btn.textContent = 'Saving...';
      try {
        const data = await POSTF('/users/profile', fd).catch(() => null) || await fetch(API_URL + '/users/profile', { method: 'PUT', headers: { Authorization: 'Bearer ' + Auth.token }, body: fd }).then(r => r.json());
        if (data.user) Auth.user = data.user;
        document.getElementById('profile-alert').innerHTML = successAlert('Profile saved successfully!');
        updateNavbar();
      } catch (err) {
        document.getElementById('profile-alert').innerHTML = errAlert(err?.data?.error || 'Failed to save');
      } finally { btn.disabled = false; btn.textContent = 'Save Profile'; }
    });
  });
});

/* ─── BOOT ────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => navigate('home'));
