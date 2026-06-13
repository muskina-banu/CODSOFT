# Flowboard - Project Management Tool

Full-stack project management app using **React + Node.js + MongoDB**.

## Tech Stack
| Layer | Tech |
|-------|------|
| Frontend | React 19, Vite, Tailwind CSS, React Query, Wouter |
| Backend | Node.js, Express 4, Mongoose |
| Database | MongoDB (Atlas free tier) |

---

## Prerequisites

1. **Node.js v18+** → https://nodejs.org (download LTS)
2. **pnpm** → open terminal and run: `npm install -g pnpm`
3. **MongoDB** → free cloud at https://www.mongodb.com/atlas

---

## Setup (step by step)

### 1. Get a free MongoDB URL
1. Go to https://www.mongodb.com/atlas → Sign up free
2. Create a free cluster (M0 Sandbox)
3. Click **Connect** → **Drivers** → copy the connection string
4. It looks like: `mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/flowboard`

### 2. Create backend/.env file
Create a file named `.env` inside the `backend/` folder:
```
MONGODB_URI=mongodb+srv://your-connection-string-here
PORT=5000
```

### 3. Install all dependencies
Open a terminal in the ROOT folder and run:
```bash
pnpm install
```

### 4. Start the app
```bash
pnpm dev
```
This starts both frontend and backend together.

Open **http://localhost:5173** in your browser.

---

## Run separately (two terminals)

Terminal 1 - Backend:
```bash
pnpm dev:backend
```

Terminal 2 - Frontend:
```bash
pnpm dev:frontend
```

---

## Folder Structure
```
flowboard/
├── backend/            Node.js + Express + MongoDB API
│   ├── src/
│   │   ├── index.js    Entry point
│   │   ├── models/     Mongoose models (Project, Task, Member)
│   │   └── routes/     API routes
│   └── .env.example
├── frontend/           React + Vite app
│   ├── src/
│   │   ├── pages/      Dashboard, Projects, Tasks, Members
│   │   ├── components/ UI components
│   │   └── lib/hooks.ts  API hooks
│   └── vite.config.ts
└── package.json        Root - runs both with pnpm dev
```

---

## Deploy for free
- **Frontend** → https://netlify.com (drag & drop the frontend/dist folder after `pnpm build`)
- **Backend** → https://render.com (free Node.js hosting, connect GitHub)
- **Database** → MongoDB Atlas (already free)
