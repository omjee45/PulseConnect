<div align="center">

# 🩸 PulseConnect

**Every Drop Counts. Every Organ Matters.**

A real-time platform connecting blood and organ donors with recipients — built for emergencies, designed for speed.

[![Node.js](https://img.shields.io/badge/Node.js-20%20LTS-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/atlas)
[![Socket.io](https://img.shields.io/badge/Socket.io-Realtime-010101?logo=socket.io&logoColor=white)](https://socket.io/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](#license)

[Features](#-features) • [Tech Stack](#-tech-stack) • [Getting Started](#-getting-started) • [Deployment](#-deployment) • [Architecture](#-architecture)

</div>

---

## 📖 About

PulseConnect bridges the gap between blood/organ donors and the people who need them — fast, verified, and private. Built with an **emergency-first philosophy**: searching for a donor requires **zero login**, because in a crisis, nobody has time to fill out a form.

> 💡 **Design principle:** Searching is public. Contacting is instant. Only *becoming a donor* requires admin verification — and even that never blocks a recipient from finding help.

## ✨ Features

| | |
|---|---|
| 🔍 **No-login emergency search** | Find nearby donors by blood group instantly — no account required |
| 📍 **Geolocation-based matching** | MongoDB `2dsphere` geospatial queries find real nearby donors |
| ✅ **Admin verification flow** | One-click email approval — no dashboard login needed to verify new donors |
| 💬 **Real-time chat** | Socket.io powered messaging once a connection request is accepted |
| 🔄 **One account, two roles** | Any user can toggle between recipient and verified donor over time |
| 📱 **Mobile-first & installable** | PWA-ready, `tel:` links for one-tap calling in an emergency |
| 🔐 **Secure by default** | JWT in HTTP-only cookies, bcrypt hashing, env-based secrets |

## 🛠 Tech Stack

**Backend**
- Node.js 20 + Express 5 — single unified server (REST + Socket.io on one port)
- MongoDB + Mongoose 8 — with `2dsphere` geospatial indexing
- JWT (HTTP-only cookies) + bcrypt — authentication
- [Resend](https://resend.com) — transactional email for admin verification links
- Zod — request validation

**Frontend**
- React 19 + Vite — fast dev/build tooling
- React Router v7 — routing
- Zustand — global auth state
- Tailwind CSS v4 + shadcn/ui — design system
- React Hook Form + Zod — forms
- Socket.io-client — real-time chat

**Infrastructure**
- Frontend → [Vercel](https://vercel.com)
- Backend → [Render](https://render.com)
- Database → [MongoDB Atlas](https://www.mongodb.com/atlas)

## 🏗 Architecture

```
┌─────────────────┐         HTTPS/WSS         ┌──────────────────────┐
│   React (Vite)   │ ────────────────────────▶ │  Express + Socket.io  │
│   Vercel          │ ◀──────────────────────── │  (single server)      │
└─────────────────┘                            │  Render               │
                                                └──────────┬───────────┘
                                                            │
                                                            ▼
                                                ┌──────────────────────┐
                                                │   MongoDB Atlas       │
                                                │   (2dsphere geo index)│
                                                └──────────────────────┘
```

**Key architectural decisions:**
- **One server, not two.** REST APIs and Socket.io share a single HTTP server instance — no cross-port CORS/cookie headaches.
- **Atomic connection flow.** Accepting a connection request and creating the resulting conversation happens in a single transaction — no race conditions.
- **Verification gates visibility, never search.** `isVerified` only controls whether a donor *appears* in results — it never blocks anyone from *searching or contacting*.

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- A MongoDB Atlas cluster (free tier is sufficient)
- A [Resend](https://resend.com) account (free tier: 3,000 emails/month)

### 1. Clone the repo
```bash
git clone https://github.com/your-username/pulseConnect.git
cd pulseConnect
```

### 2. Backend setup
```bash
cd backend
npm install
cp .env.example .env   # fill in your own values — see below
npm run dev
```

**Required environment variables** (`backend/.env`):
```dotenv
NODE_ENV=development
PORT=8800
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=generate_a_long_random_string
ADMIN_ACTION_SECRET=generate_a_different_long_random_string
ADMIN_NOTIFICATION_EMAIL=your_email@example.com
RESEND_API_KEY=your_resend_api_key
EMAIL_FROM=onboarding@resend.dev
BACKEND_URL=http://localhost:8800
FRONTEND_URL=http://localhost:5173
```

> ⚠️ **Never commit your real `.env` file.** Only `.env.example` (with placeholder values) belongs in version control.

### 3. Frontend setup
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

```dotenv
VITE_API_URL=http://localhost:8800
VITE_SOCKET_URL=http://localhost:8800
```

### 4. Open the app
```
http://localhost:5173
```

## 🌐 Deployment

| Layer | Platform | Notes |
|---|---|---|
| Frontend | **Vercel** | Deploy `frontend/` directly, set `VITE_API_URL`/`VITE_SOCKET_URL` to your Render backend URL |
| Backend | **Render** | Free tier — sleeps after 15 min idle, ~30–60s cold start on wake |
| Database | **MongoDB Atlas** | Allow `0.0.0.0/0` in Network Access (Render has no static IP on free tier) |

Set all secrets directly in each platform's dashboard — never in a committed file.

## 🔒 Security Notes

- All secrets loaded from environment variables — the server refuses to start if required vars are missing.
- Admin approval links are signed JWTs, scoped to one action, expiring in 48 hours.
- Passwords hashed with bcrypt; JWTs stored in HTTP-only cookies (`sameSite: none`, `secure: true` in production).

## 🗺 Roadmap

- [ ] Google OAuth login (deferred for prototype)
- [ ] SMS/OTP contact verification (deferred — cost consideration)
- [ ] Full PWA offline support
- [ ] Admin dashboard analytics

## 📄 License

MIT — feel free to fork and adapt for your own community donor network.

---

<div align="center">

Made with ❤️ to help save lives, one connection at a time.

</div>