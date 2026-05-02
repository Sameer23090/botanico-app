const express = require('express');
const axios = require('axios');
const authMiddleware = require('../middleware/auth');
const Plant = require('../models/Plant');
const Update = require('../models/Update');

const router = express.Router();

// ─── Groq API helper ─────────────────────────────────────────────────────────
const groqChat = async (messages, model = 'llama-3.1-70b-versatile') => {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) throw new Error('GROQ_API_KEY not configured');

    const response = await axios.post(
        'https://api.groq.com/openai/v1/chat/completions',
        {
            model,
            messages,
            max_tokens: 300,
            temperature: 0.7,
        },
        {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
        }
    );
    return response.data.choices[0].message.content;
};

// ─── POST /api/ai/consult ────────────────────────────────────────────────────
// AI Botanist consultation based on plant history using Groq LLaMA 3.1 70B
router.post('/consult', authMiddleware, async (req, res) => {
    const { plantId } = req.body;

    if (!process.env.GROQ_API_KEY) {
        return res.status(503).json({ error: 'AI Service currently unavailable. Configure GROQ_API_KEY in environment.' });
    }

    try {
        const [plant, updates] = await Promise.all([
            Plant.findById(plantId),
            Update.find({ plantId }).sort({ entryDate: -1 }).limit(5)
        ]);

        if (!plant) return res.status(404).json({ error: 'Plant not found' });

        const history = updates.length > 0
            ? updates.map(u =>
                `• ${u.entryDate.toDateString()} — Health: ${u.healthStatus || 'N/A'}, Observations: ${u.observations || 'None'}, Temp: ${u.temperatureCelsius ? u.temperatureCelsius + '°C' : 'N/A'}, Moisture: ${u.soilMoisture || 'N/A'}`
            ).join('\n')
            : 'No care logs recorded yet.';

        const messages = [
            {
                role: 'system',
                content: `You are a professional Master Botanist and AI Plant Care Consultant for "Botanico" — an elite biotech plant tracking platform. 
Provide expert, data-driven, scientific advice in a professional yet encouraging tone. 
Be concise (under 130 words). Use specific botanical terminology when relevant.`
            },
            {
                role: 'user',
                content: `Analyze this plant and provide care recommendations:

PLANT PROFILE:
• Name: ${plant.commonName}${plant.scientificName ? ` (${plant.scientificName})` : ''}
• Type: ${plant.plantType || 'Unknown'}
• Environment: ${plant.sunlightExposure || 'Unknown'}
• Location: ${plant.locationDetails || plant.location || 'Not specified'}
• Status: ${plant.status || 'Active'}

RECENT CARE LOGS (last ${updates.length} entries):
${history}

Provide: 1) A 2-sentence vitality assessment, 2) Two specific optimization recommendations.`
            }
        ];

        const advice = await groqChat(messages, 'llama-3.1-70b-versatile');
        res.json({ advice, model: 'LLaMA 3.1 70B (via Groq)' });

    } catch (error) {
        console.error('Groq AI consult error:', error.response?.data || error.message);
        const msg = error.response?.data?.error?.message || 'Failed to consult AI Botanist. Please try again.';
        res.status(500).json({ error: msg });
    }
});

// ─── POST /api/ai/diagnose ───────────────────────────────────────────────────
// Plant disease/health diagnosis from image URL using Groq LLaMA 3.2 Vision
router.post('/diagnose', authMiddleware, async (req, res) => {
    const { imageUrl, plantId } = req.body;

    if (!process.env.GROQ_API_KEY) {
        return res.status(503).json({ error: 'AI Service currently unavailable. Configure GROQ_API_KEY in environment.' });
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
    const isAllowed = ALLOWED_HOSTS.some(
        host => parsedUrl.hostname === host || parsedUrl.hostname.endsWith('.' + host)
    );
    if (!isAllowed) {
        return res.status(400).json({ error: 'Image host not allowed. Please use a supported storage provider.' });
    }

    try {
        let plantContext = '';
        if (plantId) {
            const plant = await Plant.findById(plantId);
            if (plant) {
                plantContext = `Plant species: ${plant.commonName}${plant.scientificName ? ` (${plant.scientificName})` : ''}`;
            }
        }

        // Use Groq vision model (llama-3.2-11b-vision-preview supports image URLs directly)
        const apiKey = process.env.GROQ_API_KEY;
        const response = await axios.post(
            'https://api.groq.com/openai/v1/chat/completions',
            {
                model: 'llama-3.2-11b-vision-preview',
                messages: [
                    {
                        role: 'user',
                        content: [
                            {
                                type: 'text',
                                text: `You are a plant pathologist AI for the Botanico Elite Biotech platform.
${plantContext}

Analyze this plant image and provide:
1. Health Status rating: Excellent / Good / Moderate / Poor (start your response with "Health Status: [rating]")
2. Key observations (1-2 sentences: visible symptoms, leaf color, structure)
3. Diagnosis (if any disease, pest, or deficiency is visible)
4. Two specific treatment recommendations

Keep total response under 130 words. Be precise and scientific.`
                            },
                            {
                                type: 'image_url',
                                image_url: { url: imageUrl }
                            }
                        ]
                    }
                ],
                max_tokens: 300,
                temperature: 0.3,
            },
            {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        const diagnosis = response.data.choices[0].message.content;
        res.json({ diagnosis, model: 'LLaMA 3.2 Vision 11B (via Groq)' });

    } catch (error) {
        console.error('Groq Vision diagnose error:', error.response?.data || error.message);
        const msg = error.response?.data?.error?.message || 'Failed to diagnose plant. Please try again.';
        res.status(500).json({ error: msg });
    }
});

// ─── POST /api/ai/chat ────────────────────────────────────────────────────────
// General botanical Q&A chatbot
router.post('/chat', authMiddleware, async (req, res) => {
    const { message, history = [] } = req.body;

    if (!process.env.GROQ_API_KEY) {
        return res.status(503).json({ error: 'AI Service currently unavailable.' });
    }
    if (!message || message.trim().length === 0) {
        return res.status(400).json({ error: 'Message is required' });
    }

    try {
        const messages = [
            {
                role: 'system',
                content: `You are BotaniBot, an expert AI botanist for the Botanico platform. 
You specialize in plant care, disease identification, growing conditions, soil science, and horticulture.
Answer questions concisely (under 100 words). Be scientific yet approachable.
If the question is completely unrelated to plants or nature, politely redirect.`
            },
            // Include last 6 messages for context
            ...history.slice(-6).map(h => ({ role: h.role, content: h.content })),
            { role: 'user', content: message }
        ];

        const reply = await groqChat(messages, 'llama-3.1-8b-instant');
        res.json({ reply, model: 'LLaMA 3.1 8B Instant (via Groq)' });

    } catch (error) {
        console.error('Groq chat error:', error.response?.data || error.message);
        res.status(500).json({ error: 'Chat service failed. Please try again.' });
    }
});

module.exports = router;
