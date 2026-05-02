# 🚀 Production Deployment Guide: Botanico

Follow these steps to deploy the Botanico platform to Vercel with MongoDB Atlas and Groq AI.

## 1. Database Setup (MongoDB Atlas)
1. Log in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a new Cluster (Shared Tier is sufficient).
3. Under **Network Access**, add `0.0.0.0/0` (required for Vercel Serverless Functions).
4. Under **Database Access**, create a user with `Read and Write to any database` permissions.
5. Copy your **SRV Connection String**.

## 2. AI Infrastructure (Groq)
1. Log in to [Groq Console](https://console.groq.com).
2. Generate an **API Key** (`gsk_...`).
3. Ensure you have access to `llama-3.1-70b-versatile` and `llama-3.2-11b-vision-preview`.

## 3. Storage Infrastructure (Google Drive)
1. Create a project in [Google Cloud Console](https://console.cloud.google.com).
2. Enable the **Google Drive API**.
3. Create a **Service Account** and download the **JSON Key file**.
4. Create a folder in your Google Drive and copy its **Folder ID** from the URL.
5. **Share** that folder with the Service Account email (give "Editor" access).

## 4. Vercel Deployment

### Step 1: Connect GitHub
1. Push your latest code to your GitHub repository.
2. Log in to [Vercel](https://vercel.com) and click **"New Project"**.
3. Import the `botanico-app` repository.

### Step 2: Configure Build Settings
- **Framework Preset**: Vite
- **Root Directory**: `frontend` (Note: We usually deploy as a monorepo or separate projects, but for this specific structure, ensure the root is configured correctly).
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

### Step 3: Environment Variables
Add these variables in the Vercel Dashboard under **Project Settings > Environment Variables**:

| Variable | Value |
| :--- | :--- |
| `MONGODB_URI` | Your MongoDB SRV String |
| `JWT_SECRET` | A strong random string |
| `GROQ_API_KEY` | Your Groq API Key |
| `GOOGLE_SERVICE_ACCOUNT_KEY_JSON` | The entire content of your Service Account JSON file |
| `DRIVE_ROOT_FOLDER_ID` | Your Google Drive Folder ID |
| `ADMIN_PASSWORD` | Set a secure password for the Admin Dashboard |
| `NODE_ENV` | `production` |

## 5. Post-Deployment Verification
1. Navigate to your Vercel URL.
2. Verify **Register** works (check MongoDB for new user).
3. Verify **AI Chat** (click the BotaniBot widget).
4. Verify **Image Upload** (upload a plant photo, it should appear in Google Drive).
5. Verify **AI Diagnosis** (click the brain icon on an uploaded photo).

## ⚠️ Common Production Issues
- **CORS Error**: Ensure your Vercel URL is added to the backend allowed origins if you are deploying them as separate entities.
- **Drive 403**: Ensure the Service Account email has been shared into the target Drive folder.
- **AI Timeout**: Groq is very fast, but Vercel Hobby tier has a 10s timeout. If using heavy vision models, ensure they complete within this window or upgrade to Pro.

---
**Botanico Deployment Suite v2.0**
