# 🌱 Botanico - Scientific Plant Tracking System

A comprehensive web application for tracking plant growth with scientific precision. Built with React, Node.js, PostgreSQL, and modern web technologies.

## 📋 Features

### Core Features
- ✅ User authentication (register/login with JWT)
- ✅ Track multiple plants with detailed scientific information
- ✅ Daily growth updates with photos and observations
- ✅ Scientific botanical fields (genus, species, family)
- ✅ Detailed morphological measurements (height, width, leaf count)
- ✅ Environmental tracking (temperature, humidity, soil pH)
- ✅ Growth stage tracking (flowering, fruiting)
- ✅ Pest and disease observations
- ✅ Photo timeline with multiple images per update
- ✅ Automated day counting from planting date
- ✅ Beautiful, responsive UI with animations
- ✅ Image upload and storage via Cloudinary

### Scientific Fields Tracked

**Plant Information:**
- Common name
- Scientific name (binomial nomenclature)
- Family (e.g., Solanaceae, Rosaceae)
- Genus (e.g., Solanum, Rosa)
- Species (e.g., lycopersicum, damascena)
- Variety/Cultivar
- Plant type (herb, shrub, tree, vine)
- Growth habit (annual, perennial, biennial)
- Native region
- Expected harvest days

**Growth Observations:**
- Height (cm)
- Width (cm)
- Leaf count
- Stem diameter (mm)
- Flowering stage (vegetative, budding, blooming, senescent)
- Fruiting stage (fruit set, development, ripening, mature)
- Health status
- Root observations

**Environmental Data:**
- Temperature (°C)
- Humidity (%)
- Soil pH
- Soil moisture level
- Soil type
- Sunlight exposure
- Location

**Care & Issues:**
- Care actions (watered, fertilized, pruned, etc.)
- Pest issues
- Disease observations
- Environmental stress factors

## 🛠️ Tech Stack

### Backend
- Node.js + Express
- PostgreSQL database
- JWT authentication
- Bcrypt password hashing
- Cloudinary image storage
- Multer file upload
- Express Validator

### Frontend
- React 18
- Vite build tool
- React Router v6
- Tailwind CSS
- Framer Motion animations
- Lucide React icons
- Axios HTTP client

## 📦 Installation

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- Cloudinary account (free tier works)

### 1. Clone and Setup

```bash
# Extract the ZIP file
unzip botanico-app.zip
cd botanico-app
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env file with your credentials
nano .env  # or use any text editor
```

**Configure `.env` file:**
```env
PORT=5000
NODE_ENV=development

# PostgreSQL Database URL
DATABASE_URL=postgresql://username:password@localhost:5432/botanico

# JWT Secret (generate a random string)
JWT_SECRET=your-super-secret-jwt-key-change-this-to-something-random

# Cloudinary credentials (from https://cloudinary.com/console)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

FRONTEND_URL=http://localhost:5173
```

**Create PostgreSQL database:**
```bash
# Create database
createdb botanico

# Run schema migration
psql -d botanico -f schema.sql
```

### 3. Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env file
nano .env
```

**Configure frontend `.env` file:**
```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=Botanico
VITE_APP_TAGLINE=Track Your Plant's Journey
```

### 4. Get Cloudinary Credentials

1. Go to [https://cloudinary.com](https://cloudinary.com)
2. Sign up for a free account
3. Go to Dashboard
4. Copy:
   - Cloud Name
   - API Key
   - API Secret
5. Paste into backend `.env` file

## 🚀 Running the Application

### Development Mode

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
Backend will run on `http://localhost:5000`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
Frontend will run on `http://localhost:5173`

### Access the app
Open your browser and visit: `http://localhost:5173`

## 📱 Usage Guide

### 1. Register Account
- Click "Get Started" or "Register"
- Fill in your name, email, and password
- Optional: Add your location

### 2. Add Your First Plant
- Click "Add New Plant" button
- Fill in plant details:
  - **Basic**: Common name, scientific name
  - **Taxonomy**: Family, genus, species, variety
  - **Details**: Plant type, growth habit, native region
  - **Growing Info**: Planting date, location, soil type
  - **Photo**: Upload initial seed/seedling photo
- Click "Create Plant"

### 3. Add Daily Updates
- Select a plant from dashboard
- Click "Add Update"
- Record observations:
  - Upload photos
  - Measurements (height, width, leaf count, stem diameter)
  - Growth stages (flowering/fruiting status)
  - Health observations
  - Environmental data (temperature, humidity, soil pH)
  - Care actions taken
  - Any pest or disease issues
  - Personal notes
- Click "Save Update"

### 4. View Growth Timeline
- Click on any plant
- Scroll through timeline of all updates
- View photo gallery
- See growth charts
- Track measurements over time

## 🎨 Features Walkthrough

### Plant Card
Each plant shows:
- Current photo
- Plant name (common & scientific)
- Days since planting (auto-calculated)
- Health status indicator
- Quick actions (view, edit, delete)

### Update Entry
Record comprehensive scientific observations:
- Multiple photo uploads (up to 5 per update)
- Quantitative measurements
- Qualitative observations
- Environmental conditions
- Care log
- Problem tracking

### Timeline View
- Chronological display of all updates
- Photo comparisons
- Growth progression
- Day markers
- Searchable and filterable

## 🔧 Configuration

### Customizing Plant Types
Edit `frontend/src/components/AddPlant.jsx`:
```javascript
const plantTypes = [
  'Herb', 'Shrub', 'Tree', 'Vine', 'Succulent',
  'Vegetable', 'Flower', 'Grass', 'Fern', 'Other'
];
```

### Adding More Taxonomic Families
Common families are pre-populated in the app:
- Solanaceae (nightshades)
- Rosaceae (roses)
- Fabaceae (legumes)
- Asteraceae (daisies)
- Lamiaceae (mints)
- etc.

### Customizing Care Actions
Edit `frontend/src/components/AddUpdate.jsx`:
```javascript
const careOptions = [
  { id: 'watered', label: 'Watered' },
  { id: 'fertilized', label: 'Fertilized' },
  { id: 'pruned', label: 'Pruned' },
  { id: 'transplanted', label: 'Transplanted' },
  { id: 'pestControl', label: 'Pest Control' },
  // Add your own...
];
```

## 🚢 Deployment

### Backend (Railway/Render)

**Railway:**
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Add PostgreSQL
railway add postgresql

# Deploy
railway up

# Set environment variables in Railway dashboard
```

**Render:**
1. Go to [render.com](https://render.com)
2. Create New Web Service
3. Connect your GitHub repo
4. Set build command: `npm install`
5. Set start command: `npm start`
6. Add environment variables
7. Create PostgreSQL database
8. Deploy

### Frontend (Vercel/Netlify)

**Vercel:**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd frontend
vercel --prod
```

**Netlify:**
```bash
# Install Netlify CLI
npm i -g netlify-cli

# Build
npm run build

# Deploy
netlify deploy --prod --dir=dist
```

### Environment Variables for Production

**Backend:**
- Set `NODE_ENV=production`
- Update `DATABASE_URL` with production database
- Use strong `JWT_SECRET`
- Add production `FRONTEND_URL`

**Frontend:**
- Update `VITE_API_URL` to production backend URL

## 📊 Database Schema

The database includes three main tables:

1. **users** - User accounts and profiles
2. **plants** - Plant information and taxonomy
3. **updates** - Daily observations and measurements

See `backend/schema.sql` for complete schema with all fields, indexes, and constraints.

## 🔒 Security Features

- Password hashing with bcrypt (salt rounds: 10)
- JWT tokens (7-day expiration)
- Protected API routes with auth middleware
- SQL injection prevention (parameterized queries)
- XSS protection
- CORS configuration
- Rate limiting
- Input validation
- File upload restrictions

## 🐛 Troubleshooting

### Database Connection Issues
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Test connection
psql -d botanico -U your_username

# Check DATABASE_URL format
postgresql://username:password@host:port/database
```

### Cloudinary Upload Errors
- Verify credentials in `.env`
- Check file size (max 5MB)
- Ensure file is image format (JPEG, PNG)

### Port Already in Use
```bash
# Find process using port 5000
lsof -i :5000

# Kill process
kill -9 <PID>

# Or change port in backend/.env
PORT=5001
```

### CORS Errors
- Ensure `FRONTEND_URL` in backend `.env` matches frontend URL
- Check CORS configuration in `backend/server.js`

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile

### Plants Endpoints
- `GET /api/plants` - Get all user's plants
- `GET /api/plants/:id` - Get single plant
- `POST /api/plants` - Create new plant
- `PUT /api/plants/:id` - Update plant
- `DELETE /api/plants/:id` - Delete plant
- `GET /api/plants/:id/stats` - Get plant statistics

### Updates Endpoints
- `GET /api/updates/plant/:plantId` - Get all updates for plant
- `GET /api/updates/:id` - Get single update
- `POST /api/updates` - Create new update
- `PUT /api/updates/:id` - Update entry
- `DELETE /api/updates/:id` - Delete update
- `GET /api/updates/plant/:plantId/timeline` - Get growth timeline

## 🎯 Future Enhancements

Planned features for future versions:
- [ ] AI plant identification
- [ ] Disease diagnosis with ML
- [ ] Weather API integration
- [ ] Growth prediction models
- [ ] Harvest time estimation
- [ ] Community features
- [ ] Plant care reminders
- [ ] Mobile app (React Native)
- [ ] Offline mode with sync
- [ ] Export reports (PDF)
- [ ] Data visualization charts
- [ ] Plant comparison tools
- [ ] Sharing plants publicly
- [ ] QR code generation
- [ ] Time-lapse video generation

## 🤝 Contributing

This is an open-source project. Contributions are welcome!

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👤 Author

Your Name - [your.email@example.com](mailto:your.email@example.com)

## 🙏 Acknowledgments

- Plant icons from Lucide React
- Botanical data structures from USDA Plants Database
- Scientific nomenclature from The Plant List
- UI inspiration from modern gardening apps

## 📞 Support

For questions or issues:
- Open an issue on GitHub
- Email: support@botanico.app
- Documentation: [docs.botanico.app](https://docs.botanico.app)

## 🌟 Show Your Support

If you find this project helpful, please give it a ⭐️ on GitHub!

---

**Happy Plant Tracking! 🌱**

Made with ❤️ for plant lovers and botanical science
#   b o t a n i c o - a p p  
 