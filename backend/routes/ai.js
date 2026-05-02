const express = require('express');
const axios = require('axios');
const authMiddleware = require('../middleware/auth');
const Plant = require('../models/Plant');
const Update = require('../models/Update');

const router = express.Router();

// ─── POST /api/ai/consult ───────────────────────────────────────────────────
// AI Botanist consultation based on plant history
router.post('/consult', authMiddleware, async (req, res) => {
    const { plantId } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
        return res.status(503).json({ error: 'AI Service currently unavailable. Please configure GEMINI_API_KEY.' });
    }

    try {
        const [plant, updates] = await Promise.all([
            Plant.findById(plantId),
            Update.find({ plantId }).sort({ entryDate: -1 }).limit(5)
        ]);

        if (!plant) return res.status(404).json({ error: 'Plant not found' });

        const history = updates.map(u =>
            `- Date: ${u.entryDate.toDateString()}, Health: ${u.healthStatus}, Observations: ${u.observations || 'None'}, Temp: ${u.temperatureCelsius || 'N/A'}°C`
        ).join('\n');

        const prompt = `
            You are a professional Master Botanist and AI Plant Care Consultant for the "Botanico" Elite Biotech platform.
            Analyze the following plant data and provide expert, scientific advice.
            
            PLANT PROFILE:
            Common Name: ${plant.commonName}
            Scientific Name: ${plant.scientificName || 'Unknown'}
            Type: ${plant.plantType || 'Unknown'}
            Environment: ${plant.sunlightExposure || 'Unknown'}
            Location: ${plant.locationDetails || 'Not specified'}
            
            RECENT CARE LOGS:
            ${history || 'No logs yet.'}
            
            YOUR TASK:
            1. Provide a 2-3 sentence analysis of current vitality.
            2. Give 2 specific scientific recommendations for optimization.
            3. Use a professional, futuristic, and encouraging tone.
            4. Keep the total response under 120 words.
        `;

        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
            {
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { maxOutputTokens: 250, temperature: 0.7 }
            }
        );

        const aiAdvice = response.data.candidates[0].content.parts[0].text;
        res.json({ advice: aiAdvice });

    } catch (error) {
        console.error('Gemini AI Error:', error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to consult AI Botanist. Please try again.' });
    }
});

// ─── POST /api/ai/diagnose ──────────────────────────────────────────────────
// AI diagnosis from an uploaded image URL
router.post('/diagnose', authMiddleware, async (req, res) => {
    const { imageUrl, plantId } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
        return res.status(503).json({ error: 'AI Service currently unavailable. Please configure GEMINI_API_KEY.' });
    }

    if (!imageUrl) {
        return res.status(400).json({ error: 'imageUrl is required for diagnosis' });
    }

    // SSRF prevention: only allow trusted image hosts
    const ALLOWED_HOSTS = [
        'drive.google.com', 'lh3.googleusercontent.com',
        'res.cloudinary.com', 'storage.googleapis.com',
        'botanico-492015.appspot.com'
    ];
    let parsedUrl;
    try {
        parsedUrl = new URL(imageUrl);
    } catch {
        return res.status(400).json({ error: 'Invalid imageUrl format' });
    }
    const isAllowed = ALLOWED_HOSTS.some(host => parsedUrl.hostname === host || parsedUrl.hostname.endsWith('.' + host));
    if (!isAllowed) {
        return res.status(400).json({ error: 'Image host not allowed. Please use a supported storage provider.' });
    }

    try {
        let plantContext = '';
        if (plantId) {
            const plant = await Plant.findById(plantId);
            if (plant) {
                plantContext = `Plant: ${plant.commonName} (${plant.scientificName || 'Unknown species'})`;
            }
        }

        const prompt = `
            You are a plant pathologist AI for the Botanico Elite Biotech platform.
            Analyze the plant image and provide a diagnosis.
            ${plantContext}
            
            TASKS:
            1. Identify any visible diseases, pests, or deficiencies (1-2 sentences).
            2. Rate the health: Excellent / Good / Moderate / Poor.
            3. Give 2 specific treatment recommendations.
            4. Keep the total response under 120 words.
            Format: Start with "Health Status: [rating]" then your analysis.
        `;

        // Use Gemini vision model with the image
        const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        const base64Image = Buffer.from(imageResponse.data).toString('base64');
        const mimeType = imageResponse.headers['content-type'] || 'image/jpeg';

        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
            {
                contents: [{
                    parts: [
                        { text: prompt },
                        { inline_data: { mime_type: mimeType, data: base64Image } }
                    ]
                }],
                generationConfig: { maxOutputTokens: 250, temperature: 0.4 }
            }
        );

        const diagnosis = response.data.candidates[0].content.parts[0].text;
        res.json({ diagnosis });

    } catch (error) {
        console.error('Gemini Diagnose Error:', error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to diagnose plant. Please try again.' });
    }
});

module.exports = router;
