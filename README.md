# 🌱 Botanico — Cloud-Native Botanical Intelligence

![Botanico Banner](https://img.icons8.com/clouds/100/000000/sprout.png)

**Botanico** is a high-end, scientific plant tracking platform designed for researchers, botanists, and plant enthusiasts. It combines rigorous data collection with a premium, glassmorphism-inspired UI to monitor growth cycles, environmental conditions, and morphological changes with precision.

---

## 🚀 Cloud-First Architecture

We have recently migrated to a fully serverless, cloud-native stack to ensure high availability and cost-efficiency:

- **Deployment**: [Vercel](https://vercel.com) (Serverless Functions)
- **Database**: [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (M0 Tier)
- **Storage**: [Google Drive API](https://developers.google.com/drive) (Optimized with **Sharp** for high-quality WebP compression)
- **Auth**: [Passport.js](https://www.passportjs.org/) (Google & Microsoft OAuth 2.0 integration)

---

## 🛡️ Security Hardened

This repository is **Snyk-Verified**. We have implemented industry-standard security measures:

- ✅ **ReDoS Protection**: Sanitized regular expressions for query parameters.
- ✅ **DOM-based XSS Prevention**: Strict type-casting and sanitization for dynamic GPS rendering.
- ✅ **Brute-Force Shield**: Rate-limiting on all authentication and sensitive API endpoints.
- ✅ **Secure Secrets**: Decoupled all sensitive credentials into environment variables.
- ✅ **Optimized Payloads**: Image processing on the edge ensures minimal bandwidth and storage usage.

---

## ✨ Features

### 🔬 Scientific Precision
- **Taxonomic Tracking**: Binomial nomenclature tracking (Genus, Species, Family).
- **Growth Metrics**: Longitudinal tracking of height, width, leaf count, and stem diameter.
- **Phenology**: Automated day-counting and phenological stage logging (Vegetative, Budding, Blooming, etc.).

### 📱 Premium UX
- **Glassmorphism UI**: A dark-mode first design with blurred overlays and smooth Framer Motion transitions.
- **Auto-Labeling Storage**: Uploaded images are automatically categorized in Google Drive by User and Plant ID.
- **Universal Login**: Seamlessly sign in with your Google or Microsoft educational/work accounts.

---

## 📦 Quick Start

### Prerequisites
- Node.js v20+
- A MongoDB Atlas Cluster
- A Google Cloud Service Account (for Drive access)

### Setup

1. **Clone the repo**
   ```bash
   git clone https://github.com/Sameer23090/botanico-app.git
   cd botanico-app
   ```

2. **Backend Configuration**
   Follow the [backend/.env.example](backend/.env.example) to set your Vercel environment variables.
   ```bash
   cd backend
   npm install
   ```

3. **Frontend Configuration**
   ```bash
   cd frontend
   npm install
   npm run build
   ```

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 18, Vite, Tailwind CSS, Framer Motion |
| **Backend** | Node.js, Express, Vercel Serverless |
| **Persistence** | Mongoose, MongoDB Atlas |
| **Image Processing** | Sharp (WebP @ 92% Quality) |
| **Identity** | JWT, Passport.js (OAuth 2.0) |

---

## 🗺️ Roadmap
- [ ] AI-Powered Disease Diagnosis (TensorFlow.js)
- [ ] Multi-user Collaborative Gardens
- [ ] PDF Scientific Report Generation
- [ ] IoT Sensor Integration (ESP32 / Arduino)

---

## 🤝 Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

**Made with ❤️ for the Botanical Community**