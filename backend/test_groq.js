const axios = require('axios');
require('dotenv').config();

const testGroq = async () => {
    const apiKey = process.env.GROQ_API_KEY;
    console.log('Testing with key:', apiKey ? apiKey.substring(0, 10) + '...' : 'MISSING');
    
    try {
        const response = await axios.post(
            'https://api.groq.com/openai/v1/chat/completions',
            {
                model: 'llama-3.1-8b-instant',
                messages: [{ role: 'user', content: 'Hello, are you online?' }],
                max_tokens: 50
            },
            {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                },
                timeout: 10000
            }
        );
        console.log('Success!', response.data.choices[0].message.content);
    } catch (error) {
        console.error('Groq Test Failed:');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error('Message:', error.message);
        }
    }
};

testGroq();
