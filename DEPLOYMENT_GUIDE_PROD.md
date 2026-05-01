# 🚀 Botanico Production Deployment Guide

This guide describes how to deploy the **Botanico** stack (Frontend: React/Vite/Vercel, Backend: Node/Express/Render).

---

## 🏗️ 1. Backend: Hosting on Render.com

[Render](https://render.com) is recommended for its simplicity and built-in Node.js support.

### Setup Step:
1.  Push your code to **GitHub**.
2.  Log in to [Render.com](https://render.com) and create **New +** → **Web Service**.
3.  Connect your GitHub repository.
4.  Configure:
    - **Build Command**: `npm install` (Root directory: `backend`)
    - **Start Command**: `npm start`
    - **Environment Type**: `Node`

### 🔑 Set Backend Variables:
In your Render **Environment Variables** dashboard, add:
- `MONGODB_URI`: *[Your Atlas connection string]*
- `JWT_SECRET`: *[A long random string]*
- `FRONTEND_URL`: `https://your-app.vercel.app`
- `GOOGLE_CALLBACK_URL`: `https://your-render-name.onrender.com/api/auth/google/callback`
- `MICROSOFT_CALLBACK_URL`: `https://your-render-name.onrender.com/api/auth/microsoft/callback`
- `DRIVE_ROOT_FOLDER_ID`: *[The ID from your Drive folder URL]*
- `GOOGLE_SERVICE_ACCOUNT_KEY_JSON`: *[The full JSON string from your Service Account key]*
- `GOOGLE_TRANSLATE_API_KEY`: *[From Google Console]*

---

## 🎨 2. Frontend: Hosting on Vercel

[Vercel](https://vercel.com) provides seamless hosting for Vite/React apps.

### Setup Step:
1.  New Project on Vercel → **Import** your GitHub repo.
2.  Set **Framework Preset** to `Vite`.
3.  Set **Root Directory** to `frontend`.

### 🔑 Set Frontend Variables:
Add this in the Vercel **Environment Variables** settings:
- `VITE_API_URL`: `https://your-backend-render-url.com/api`

---

## 🛠️ 3. Google Console Configuration (CRITICAL)

Go to [Google Cloud Console](https://console.cloud.google.com/):

1.  **Authorized Redirect URIs**: 
    - `https://your-backend-render-url.com/api/auth/google/callback`
    - `http://localhost:5000/api/auth/google/callback` (for local tests)
2.  **API Keys**: 
    - Enable **Cloud Translation API**.
    - Enable **Google Drive API**.
3.  **Drive Folder**: 
    - Create a folder `Botanico_Uploads`.
    - **Share** it with the service account email as **Editor**.

---

## 🔍 4. Verification Check
- Visit `https://your-app.vercel.app/login`. 
- Try "Continue with Google".
- Upload a plant photo and check your Google Drive folder.
