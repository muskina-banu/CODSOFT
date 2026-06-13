# JobBoard — Full Stack Job Portal

A complete MERN-style Job Board with all Level 2 features.

## Features

| Feature | Status |
|---|---|
| Home Page with featured jobs | ✅ |
| Job Listings with search & filters | ✅ |
| Job Detail Page | ✅ |
| Employer Dashboard | ✅ |
| Candidate Dashboard | ✅ |
| Job Application with Resume Upload | ✅ |
| Search (keyword, location, type, category) | ✅ |
| Email Notifications (Nodemailer + Gmail) | ✅ |
| JWT Authentication (Candidate + Employer) | ✅ |
| Mobile Responsive Design | ✅ |

## Project Structure

```
job-board/
├── backend/
│   ├── config/
│   │   ├── db.js          MongoDB connection
│   │   └── mailer.js      Nodemailer email service
│   ├── middleware/
│   │   ├── auth.js        JWT middleware
│   │   └── upload.js      Multer file uploads
│   ├── models/
│   │   ├── User.js        Candidate & Employer model
│   │   ├── Job.js         Job listing model
│   │   └── Application.js Application model
│   ├── routes/
│   │   ├── auth.js        Register, Login, Me
│   │   ├── jobs.js        CRUD + search + apply
│   │   ├── applications.js Submit, my apps, status
│   │   └── users.js       Profile, stats
│   ├── uploads/           Resume storage
│   ├── server.js
│   └── package.json
└── frontend/
    ├── index.html         Single page app shell
    ├── style.css          All styles
    └── app.js             SPA router + all pages
```

## Setup

### 1. MongoDB Atlas
1. Go to https://cloud.mongodb.com → Create free cluster
2. Database Access → Add user
3. Network Access → Add `0.0.0.0/0`
4. Connect → Drivers → Copy URI

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env`:
```
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/jobboard
JWT_SECRET=some_very_long_random_secret
EMAIL_USER=yourgmail@gmail.com
EMAIL_PASS=your_gmail_app_password
NODE_ENV=development
```

**Gmail App Password:**
1. Google Account → Security → 2-Step Verification → App Passwords
2. Create a password for "Mail" → copy it to EMAIL_PASS

Start backend:
```bash
npm run dev
# Server running on http://localhost:5000
```

### 3. Frontend

Open `frontend/index.html` directly in a browser, **OR** use Live Server in VS Code:
1. Install "Live Server" extension in VS Code
2. Right-click `index.html` → "Open with Live Server"
3. App opens at `http://127.0.0.1:5500`

> The frontend's `API_URL` in `app.js` is set to `http://localhost:5000/api` by default.

## API Reference

### Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | No | Register (candidate or employer) |
| POST | `/api/auth/login` | No | Login |
| GET | `/api/auth/me` | Yes | Get current user |

### Jobs
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/jobs` | No | Browse jobs (search, filter, paginate) |
| GET | `/api/jobs/my` | Employer | My job listings |
| GET | `/api/jobs/:id` | No | Job detail |
| POST | `/api/jobs` | Employer | Post new job |
| PUT | `/api/jobs/:id` | Employer | Edit job |
| DELETE | `/api/jobs/:id` | Employer | Delete job |
| GET | `/api/jobs/:id/applications` | Employer | View applicants |

### Applications
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/applications` | Candidate | Submit application (+ resume upload) |
| GET | `/api/applications/my` | Candidate | My applications |
| GET | `/api/applications/check/:jobId` | Candidate | Check if applied |
| PATCH | `/api/applications/:id/status` | Employer | Update status |

### Users
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| PUT | `/api/users/profile` | Yes | Update profile + resume |
| GET | `/api/users/stats` | Yes | Dashboard stats |

## Deployment

### Frontend → Netlify
1. Drag & drop the `frontend/` folder at https://netlify.com/drop
2. Update `API_URL` in `app.js` to your deployed backend URL

### Backend → Render (free)
1. Push to GitHub
2. Create Web Service at https://render.com
3. Build: `npm install`, Start: `npm start`
4. Add all env vars in Settings → Environment

### Or deploy to Railway
1. `npm install -g railway`
2. `railway login && railway init && railway up`
