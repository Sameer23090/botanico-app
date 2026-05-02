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

/**
 * POST /api/ai/diagnose
 * Analyze an image for plant diseases and health issues
 */
router.post('/diagnose', authMiddleware, async (req, res) => {
    const { imageUrl, plantId } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        return res.status(503).json({ error: 'AI Service currently unavailable' });
    }

    if (!imageUrl || typeof imageUrl !== 'string') {
        return res.status(400).json({ error: 'Valid Image data (string) is required' });
    }

    try {
        const plant = plantId ? await Plant.findById(plantId) : null;

        const prompt = `
            Analyze this plant image for the "Botanico" Elite Biotech platform.
            ${plant ? `Context: This is a ${plant.commonName} (${plant.scientificName}).` : ''}
            
            TASK:
            1. Identify the plant if not provided.
            2. Detect any signs of diseases, pests, or nutrient deficiencies.
            3. Provide a "Health Index" (0-100).
            4. Suggest 3 immediate scientific remediation steps.
            5. Use a professional, technical, and futuristic tone.
            
            Format the response as JSON with these fields:
            {
                "identification": "Name of plant",
                "diagnosis": "Detailed health analysis",
                "healthIndex": number,
                "remediations": ["step 1", "step 2", "step 3"],
                "severity": "Low/Medium/High"
            }
        `;

        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
            {
                contents: [{
                    parts: [
                        { text: prompt },
                        {
                            inlineData: {
                                mimeType: "image/jpeg",
                                data: imageUrl.split(',')[1] || imageUrl // Handle base64 or direct URL (if supported by Gemini)
                            }
                        }
                    ]
                }],
                generationConfig: {
                    responseMimeType: "application/json",
                }
            }
        );

        const diagnosis = JSON.parse(response.data.candidates[0].content.parts[0].text);
        res.json(diagnosis);

    } catch (error) {
        console.error('Gemini Diagnosis Error:', error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to diagnose plant health' });
    }
});

module.exports = router;
