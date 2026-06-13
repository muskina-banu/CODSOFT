# QuizMaker — MERN Stack

A full-stack online quiz maker built with MongoDB, Express, React, and Node.js.

## Features

- User registration & login with JWT authentication
- Create, edit, publish, and delete quizzes
- Multiple choice questions with custom point values
- Timed quizzes with countdown timer
- Automatic score calculation and detailed results
- Quiz browsing with search and category filters
- User dashboard with activity history
- Professional blue & white responsive UI

## Project Structure

```
quiz-maker-mern/
├── backend/          Node.js + Express API
│   ├── config/       Database connection
│   ├── middleware/   JWT auth middleware
│   ├── models/       Mongoose schemas
│   ├── routes/       API route handlers
│   ├── server.js
│   └── package.json
└── frontend/         React + Vite app
    ├── src/
    │   ├── components/   Navbar, ProtectedRoute
    │   ├── context/      AuthContext (JWT state)
    │   ├── pages/        All page components
    │   ├── api.js        Fetch wrapper
    │   ├── App.jsx       Router setup
    │   └── index.css     All styles
    ├── index.html
    └── package.json
```

## Setup & Running

### 1. MongoDB Atlas

1. Create a free cluster at https://cloud.mongodb.com
2. Create a database user
3. Get your connection string
4. Whitelist `0.0.0.0/0` under Network Access

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env — fill in MONGODB_URI and JWT_SECRET
npm run dev
```

The API server runs on **http://localhost:5000**

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

The app runs on **http://localhost:5173**

> The Vite dev server proxies `/api` requests to `localhost:5000` automatically — no CORS issues in development.

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/register` | No | Register new user |
| POST | `/api/auth/login` | No | Login |
| GET | `/api/auth/me` | Yes | Get current user |
| GET | `/api/quizzes` | No | List published quizzes |
| GET | `/api/quizzes/my` | Yes | My quizzes |
| GET | `/api/quizzes/:id` | No | Get quiz |
| POST | `/api/quizzes` | Yes | Create quiz |
| PUT | `/api/quizzes/:id` | Yes | Update quiz |
| PATCH | `/api/quizzes/:id/publish` | Yes | Toggle publish |
| POST | `/api/quizzes/:id/questions` | Yes | Add question |
| DELETE | `/api/quizzes/:id/questions/:qid` | Yes | Delete question |
| POST | `/api/quizzes/:id/attempt` | Yes | Submit attempt |
| GET | `/api/attempts/:id` | Yes | Get result |
| GET | `/api/attempts/my/all` | Yes | My attempt history |

## Environment Variables

**backend/.env**
```
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/quizmaker
JWT_SECRET=change_this_to_something_long_and_random
NODE_ENV=development
```

## Production Build

```bash
# Build frontend
cd frontend && npm run build

# Serve the dist/ folder with your web server (nginx, Vercel, Netlify, etc.)
# OR serve it from Express by adding:
# app.use(express.static(path.join(__dirname, '../frontend/dist')))

# Run backend in production
cd backend && NODE_ENV=production npm start
```
