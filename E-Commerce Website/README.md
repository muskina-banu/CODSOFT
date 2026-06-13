# ShopEase - E-Commerce Website

Full-stack e-commerce app built with **React + Node.js + MongoDB**.

## Features
- Browse & search products
- Filter by category, price, rating
- Shopping cart (persists in browser)
- User authentication (register/login with JWT)
- Checkout with shipping address & payment form
- Order history

## Tech Stack
| Layer | Tech |
|-------|------|
| Frontend | React 19, Vite, Tailwind CSS |
| Backend | Node.js, Express, Mongoose |
| Database | MongoDB Atlas (free) |
| Auth | JWT tokens |

---

## Setup (Step by Step)

### 1. Get free MongoDB URL
- Go to https://www.mongodb.com/atlas → Sign up free
- Create a free M0 cluster
- Click Connect → Drivers → copy your connection string

### 2. Create `backend/.env` file
Create a file named `.env` inside the `backend/` folder:
```
MONGODB_URI=mongodb+srv://your-connection-string/shopease
JWT_SECRET=any_random_secret_string_here_like_abc123xyz
PORT=5000
```

### 3. Install dependencies
Open terminal in the root folder:
```bash
npm install -g pnpm
pnpm install
```

### 4. Start the app
```bash
pnpm dev
```

Open **http://localhost:5173**

Products are seeded automatically on first run!

---

## Free Hosting
- **Frontend** → Netlify (drag frontend/dist after `pnpm --filter frontend build`)
- **Backend** → Render.com (free Node.js hosting)
- **Database** → MongoDB Atlas (already free)
