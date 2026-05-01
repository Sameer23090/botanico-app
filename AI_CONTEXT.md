# Botanico Project Context & Analysis

## 🌿 Project Overview
Botanico is a comprehensive, scientific application designed to track plant growth with a premium, engaging user experience. Initially conceived as a robust Progressive Web App (PWA) with features like rubric-based faculty grading, QR codes for public access, and gamification, the platform has evolved significantly. 

## 🚀 What We've Built (Project Timeline)

Over the course of multiple iterations, the project went through several architectural choices and aesthetic upgrades:
1. **Initial Foundation & Complex Features**: The initial scope focused heavily on advanced workflows—such as student/faculty interactions, gamified achievements/badges, and public profiles accessible via QR codes.
2. **Backend Migrations**: Initially prototyped with Python/FastAPI and SQLite in February, we transitioned to a rock-solid **Node.js + Express** stack, and more recently, migrated the database from PostgreSQL to **MongoDB Atlas** (Mongoose v8) for a more flexible, document-driven approach in production.
3. **"Elite Biotech" Aesthetic Overhaul**: A major focus went into UI/UX. We stripped away standard layouts and implemented an ultra-premium, dark-mode, neon-accented cyber-tech theme (dubbed the "Elite Biotech" aesthetic). We achieved this with Tailwind CSS, Framer Motion, and bespoke React components like `LiquidCursor` and `AmbientAnimations`.
4. **Admin Panel Implementation**: Built out a detailed Admin portal featuring dynamic statistics, user data exports, a "fraud review queue", and seamless mobile-responsive routing.
5. **Production Deployment**: Successfully launched live versions utilizing **Render** for the backend (Node/Express API connected to MongoDB Atlas) and **Vercel** for the React frontend, handling intricate environment variable wiring and route protections.

---

## 🏗️ Technical Stack (Current)

### Frontend (Client-side)
- **Framework**: React 18, Vite
- **Styling**: Tailwind CSS, PostCSS (for the *Elite Biotech* theme)
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **Routing**: React Router v6

### Backend (Server-side)
- **Server Environment**: Node.js, Express
- **Database**: MongoDB (via Mongoose ODM v8.2)
- **Authentication**: JWT (JSON Web Tokens), Bcrypt for hashing
- **File Storage**: Cloudinary (integrated via Multer)
- **Security**: Helmet, Express Rate Limit, Express Validator, CORS

---

## 📂 Project Structure

```text
botanico-app/
├── AI_CONTEXT.md                      # This file (Project Analysis & Context)
├── README.md                          # General overview & local setup guide
├── PROJECT_STRUCTURE.md               # Historical component checklist
├── backend/                           # Node.js API Service
│   ├── config/                        # DB (MongoDB) and Cloudinary configs
│   ├── middleware/                    # Auth restrictions, input validation
│   ├── models/                        # Mongoose Models (Users, Plants, Updates, etc.)
│   ├── routes/                        # Express API Endpoints
│   ├── schema.sql                     # Legacy Postgres schema reference
│   ├── server.js                      # Main Express entry point
│   ├── seedAdmin.js                   # Script for bootstrapping admin account
│   └── package.json                   # Backend node dependencies
│
└── frontend/                          # Vite React Client
    ├── index.html                     # HTML Template
    ├── public/                        # Static assets (Favicon, etc.)
    ├── vite.config.js                 # Vite bundler config
    ├── tailwind.config.js             # Styling configuration
    └── src/
        ├── main.jsx                   # React App entry
        ├── App.jsx                    # Core Router / Context Provider
        ├── api.js                     # Global Axios setup
        ├── index.css                  # Global Tailwind & Custom UI styles
        └── components/
            ├── AdminDashboard.jsx     # Elite Biotech admin features (Exports, Review Queue)
            ├── AdminLogin.jsx         # Dedicated admin gateway
            ├── AmbientAnimations.jsx  # Complex background visual effects
            ├── LiquidCursor.jsx       # Custom animated cursor
            ├── AddPlant.jsx           # Scientific plant entry form
            ├── AddUpdate.jsx          # Daily growth logs (images/measurements)
            ├── Dashboard.jsx          # User's primary plant management dashboard
            ├── PlantDetail.jsx        # Detailed chronological history per plant
            ├── LandingPage.jsx        # Premium hero/marketing page
            ├── Login.jsx              # User Auth gateway
            └── Register.jsx           # User Registration gateway
```

---

## 🎯 What We Want to Achieve Next (Roadmap)

Now that the core MERN tracking layer, high-end "Elite Biotech" UI, and Administrative dashboards are deployed, our primary forward-looking goals are:

1. **Integration Deep Dives**: 
    - **AI/ML Vision**: Implement AI plant identification or disease diagnosis through user-uploaded images.
    - **External APIs**: Connect Weather APIs and GPS tracking based on the user's location to correlate ambient conditions automatically.
2. **Extended Gamification & Educational Tools**:
    - Flesh out the backend achievements logic.
    - Build out the *Faculty Grading Rubrics* for universities/schools utilizing the platform for botany tracing. 
3. **Public Sharing**:
    - Finalize the public-view mode where users can generate a QR code linking to a non-authenticated "showcase" view of a plant's timeline.
4. **Offline Functionality & Hardened PWA Mode**: Ensure students and researchers out in the field without cell-service can take photos and log measurements, syncing seamlessly to the backend when back online.

### 🤖 Notes for Future AI Assistants
When modifying this specific codebase:
- Respect the **"Elite Biotech" aesthetic**: Do not introduce generic styling. All new UI MUST utilize glassmorphism, deep dark/neon palettes, and subtle Framer Motion transitions. Wait/check the existing CSS for tokens.
- **Backend Constraints**: Ensure any schema changes update Mongoose models appropriately (ignore legacy `.sql` files unless porting data).
- Always verify mobile responsiveness after building front-end components, especially when dealing with floating layouts or `AmbientAnimations.jsx`.
