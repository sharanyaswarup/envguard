# 🚀 EnvGuard — Secure Environment Variable Management

EnvGuard is a full-stack SaaS platform for securely managing environment variables across projects, with team collaboration, audit logs, and CLI integration.

---

## ✨ Features

* 🔐 AES-256-CBC encryption for all secrets
* 👥 Role-based access: Owner / Admin / Editor / Viewer
* 📋 Detailed audit logs for every action
* ⚡ Real-time updates via Socket.io
* 📦 Import / Export `.env` files
* 🔄 JWT authentication with auto-refresh (HttpOnly cookies)
* 💻 CLI tool for pulling secrets directly into local projects

---

## 🛠 Tech Stack

**Frontend**
React 19 • Vite • React Router • Axios • Socket.io-client • Lucide Icons

**Backend**
Node.js • Express • MongoDB • Mongoose • Socket.io • JWT • bcryptjs

---

## 📂 Project Structure

```
envguard/
├── client/          React frontend
│   └── src/
│       ├── api/
│       ├── context/
│       ├── components/
│       └── pages/
│
└── server/          Express backend
    ├── controllers/
    ├── middleware/
    ├── models/
    ├── routes/
    └── services/
```

---

## ⚙️ Local Setup

### 1. MongoDB Atlas

* Create account → https://mongodb.com/atlas
* Create free cluster (M0)
* Add DB user (username + password)
* Allow IP: `0.0.0.0/0`
* Copy connection string

---

### 2. Backend Setup

```bash
cd server
npm install
cp .env.example .env
```

Fill `.env`:

```
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_secret
JWT_REFRESH_SECRET=your_refresh_secret
ENCRYPTION_KEY=32_character_key_here
```

Run backend:

```bash
npm run dev
```

Server → http://localhost:5000

---

### 3. Frontend Setup

```bash
cd client
npm install
npm run dev
```

App → http://localhost:5173

---

## 💻 CLI Usage

Install globally:

```bash
npm install -g envguard-tool
```

Login:

```bash
envguard login
```

Fetch secrets:

```bash
envguard pull
```

Other commands:

```bash
envguard projects
envguard list
```

---

## 🌐 Deployment (Render)

### Backend (Web Service)

* Root directory: `server`
* Build: `npm install`
* Start: `node index.js`

Environment variables:

```
MONGODB_URI=
JWT_SECRET=
JWT_REFRESH_SECRET=
ENCRYPTION_KEY=
```

---

### Frontend (Static Site)

* Root directory: `client`
* Build: `npm install && npm run build`
* Publish directory: `dist`

Environment:

```
VITE_API_URL=https://your-backend-url.onrender.com
```

---

### CLI Production Setup

Update CLI default API:

```js
const DEFAULT_API = 'https://your-backend-url.onrender.com';
```

Re-publish CLI:

```bash
npm version patch
npm publish
```

---

## 🔐 Security

* AES-256-CBC encryption with unique IV per secret
* Secrets never stored or logged in plaintext
* JWT access tokens (short-lived) + refresh tokens
* HttpOnly cookies for secure session handling
* Strict role-based access control on all endpoints

---

## 🚀 Future Improvements

* GitHub Actions integration
* Secret rotation automation
* Kubernetes / Docker secrets support
* CLI login via browser OAuth

---

## 📌 Author

Built by **Sharanya**
