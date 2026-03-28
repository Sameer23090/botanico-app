# Components You Need to Create in Antigravity

After uploading this project to Antigravity, you'll need to create these React component files in `frontend/src/components/`:

## 1. LandingPage.jsx
Beautiful hero section with:
- Botanico branding
- "Track Your Plant's Journey" tagline
- Get Started button → /register
- Login button → /login
- Feature highlights with icons
- Animated leaf decorations

## 2. Login.jsx
Login form with:
- Email field
- Password field
- Remember me checkbox
- Login button
- Link to Register page
- Error handling

## 3. Register.jsx
Registration form with:
- Name field
- Email field  
- Password field
- Confirm password field
- Location field (optional)
- Register button
- Link to Login page
- Validation

## 4. Dashboard.jsx
Main user dashboard showing:
- Welcome message with user name
- Grid of plant cards
- Each card shows:
  - Plant photo
  - Common name
  - Scientific name (italic)
  - Days since planting
  - Health status badge
- "Add New Plant" card
- Logout button in header
- Search/filter plants

## 5. AddPlant.jsx
Comprehensive plant creation form with SCIENTIFIC FIELDS:

**Basic Information:**
- Common Name (required)
- Scientific Name (Genus species)
- Description

**Taxonomy:**
- Family (dropdown: Solanaceae, Rosaceae, Fabaceae, etc.)
- Genus
- Species  
- Variety/Cultivar

**Plant Details:**
- Plant Type (dropdown: Herb, Shrub, Tree, Vine, etc.)
- Growth Habit (dropdown: Annual, Perennial, Biennial)
- Native Region

**Growing Information:**
- Planting Date (date picker) (required)
- Location
- Soil Type (dropdown: Loamy, Clay, Sandy, etc.)
- Sunlight Exposure (Full Sun, Partial Shade, Full Shade)
- Planting Method (Direct sow, Transplant, Cutting, etc.)
- Expected Harvest Days (number)

**Photo:**
- Drag & drop or click to upload
- Preview before submit

**Actions:**
- Cancel button
- Create Plant button

## 6. PlantDetail.jsx
Detailed plant view showing:
- Large hero image
- Plant name (common + scientific)
- Days since planting (animated counter)
- All taxonomy info
- Growing conditions
- Statistics:
  - Total updates
  - Last update date
  - Total photos
- Timeline of all updates (chronological)
- Each timeline entry shows:
  - Day number
  - Date
  - Photos (gallery)
  - All observations
  - Measurements
  - Care actions
- "Add Update" button
- "Edit Plant" button
- Back to Dashboard button

## 7. AddUpdate.jsx  
Daily update form with COMPREHENSIVE SCIENTIFIC OBSERVATIONS:

**Basic Info:**
- Entry Date (auto-filled to today)
- Day Number (auto-calculated)
- Title/Summary

**Photos:**
- Upload multiple photos (up to 5)
- Drag & drop interface
- Preview thumbnails

**Morphological Measurements:**
- Height (cm)
- Width (cm)
- Leaf Count
- Stem Diameter (mm)

**Growth Stages:**
- Flowering Stage (dropdown: Vegetative, Budding, Blooming, Senescent)
- Fruiting Stage (dropdown: Fruit Set, Development, Ripening, Mature)
- Health Status (dropdown: Excellent, Good, Fair, Poor, Critical)

**Observations:**
- General Observations (textarea)
- Root Observations (textarea)
- Pest Issues (textarea)
- Disease Observations (textarea)
- Environmental Stress (textarea)

**Environmental Data:**
- Temperature (°C)
- Humidity (%)
- Soil pH (0-14)
- Soil Moisture (dropdown: Dry, Moist, Wet, Saturated)

**Care Actions:**
Checkboxes for:
- ☐ Watered
- ☐ Fertilized
- ☐ Pruned
- ☐ Transplanted
- ☐ Pest Control
- ☐ Staked/Supported
- ☐ Mulched

**Notes:**
- Personal notes/observations (textarea)

**Actions:**
- Cancel button
- Save Update button

---

## Component Structure Example

Each component should:
1. Import necessary hooks (useState, useEffect, useNavigate)
2. Import API functions
3. Import icons from lucide-react
4. Use Tailwind CSS classes
5. Include Framer Motion animations
6. Handle loading states
7. Handle error states
8. Show success messages

## Styling Guidelines

Use these Tailwind classes:
- Containers: `container-page`
- Buttons: `btn-primary`, `btn-secondary`, `btn-ghost`
- Inputs: `input-field`, `textarea-field`, `select-field`
- Cards: `card-botanical`
- Badges: `badge-botanical`, `badge-success`
- Labels: `label-text`, `label-scientific` (for taxonomy)

## Scientific Name Formatting
Always display scientific names in italic:
```jsx
<span className="italic text-primary-700">Solanum lycopersicum</span>
```

## Icons to Use (from lucide-react)

- Leaf, Sprout, Trees - plant icons
- Camera, Image - photo related
- Calendar, Clock - date/time
- Droplet - watering
- Sun, Cloud - weather
- Activity, TrendingUp - growth
- AlertTriangle - warnings
- Check, X - status
- Plus, Minus - actions
- Search, Filter - utilities
- User, LogOut - user actions

---

Once you create these 7 components, the app will be fully functional!

The backend is already complete with all scientific field support.
