const express = require('express');
const axios = require('axios');
const authMiddleware = require('../middleware/auth');
const Plant = require('../models/Plant');
const Update = require('../models/Update');

const router = express.Router();

router.post('/consult', authMiddleware, async (req, res) => {
    const { plantId } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        return res.status(503).json({ error: 'AI Service currently unavailable (Key missing)' });
    }

    try {
        // 1. Gather Context
        const [plant, updates] = await Promise.all([
            Plant.findById(plantId),
            Update.find({ plantId }).sort({ entryDate: -1 }).limit(5)
        ]);

        if (!plant) return res.status(404).json({ error: 'Plant not found' });

        // 2. Format Context for Gemini
        const history = updates.map(u => 
            `- Date: ${u.entryDate.toDateString()}, Health: ${u.healthStatus}, Observations: ${u.observations || 'None'}, Temp: ${u.temperatureCelsius || 'N/A'}°C`
        ).join('\n');

        const prompt = `
            You are a professional Master Botanist and AI Plant Care Consultant for the "Botanico" Elite Biotech platform.
            Analyze the following plant data and provide expert, scientific advice.
            
            PLANT PROFILE:
            Common Name: ${plant.commonName}
            Scientific Name: ${plant.scientificName}
            Type: ${plant.plantType}
            Environment: ${plant.sunlightExposure}
            
            RECENT CARE LOGS:
            ${history || 'No logs yet.'}
            
            YOUR TASK:
            1. Provide a 2-3 sentence analysis of current vitality.
            2. Give 2 specific scientific recommendations for optimization.
            3. Use a professional, futuristic, and encouraging tone.
            4. Keep the total response under 100 words.
        `;

        // 3. Call Gemini API
        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
            {
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    maxOutputTokens: 200,
                    temperature: 0.7,
                }
            }
        );

        const aiAdvice = response.data.candidates[0].content.parts[0].text;
        res.json({ advice: aiAdvice });

    } catch (error) {
        console.error('Gemini AI Error:', error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to consult AI Botanist' });
    }
});

module.exports = router;
