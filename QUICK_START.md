# 🚀 Quick Start Guide - Botanico

Get Botanico running in 10 minutes!

## ⚡ Fastest Setup (Using Antigravity IDE)

### 1. Extract Files
```bash
unzip botanico-app.zip
cd botanico-app
```

### 2. Backend Setup (3 minutes)
```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env` and add:
```
DATABASE_URL=postgresql://your_user:your_pass@localhost/botanico
JWT_SECRET=any-random-secret-string-here
CLOUDINARY_CLOUD_NAME=get-from-cloudinary.com
CLOUDINARY_API_KEY=get-from-cloudinary.com
CLOUDINARY_API_SECRET=get-from-cloudinary.com
```

Create database:
```bash
createdb botanico
psql -d botanico -f schema.sql
```

### 3. Frontend Setup (2 minutes)
```bash
cd ../frontend
npm install
cp .env.example .env
```

### 4. Run (1 minute)

Terminal 1:
```bash
cd backend
npm run dev
```

Terminal 2:
```bash
cd frontend
npm run dev
```

Visit: http://localhost:5173

## ☁️ Get Cloudinary (FREE - 2 minutes)

1. Go to https://cloudinary.com/users/register_free
2. Sign up with email
3. Go to Dashboard
4. Copy: Cloud Name, API Key, API Secret
5. Paste into `backend/.env`

That's it! You're ready to track plants! 🌱
