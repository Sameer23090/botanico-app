const axios = require('axios');

/**
 * Botanical AI Assistant Service
 * Powered by Llama 3 via Groq (Free Tier)
 */
class BotanicalAssistant {
  constructor() {
    this.apiKey = process.env.GROQ_API_KEY;
    this.apiUrl = 'https://api.groq.com/openai/v1/chat/completions';
  }

  async getPersonalizedAdvice(plantData, userQuestion) {
    if (!this.apiKey || this.apiKey === 'your-groq-api-key') {
      return "AI Assistant is not configured. Please add your GROQ_API_KEY to the .env file.";
    }

    try {
      const systemPrompt = `
        You are "Botanico Assistant", an expert botanist and plant care specialist.
        You are helping a user with their specific plant. 
        Current Plant Context:
        ${JSON.stringify(plantData, null, 2)}
        
        Provide personalized, concise, and scientific advice based on the plant's history and the user's question.
        If the plant has logs/updates, use them to spot trends.
      `.trim();

      const response = await axios.post(
        this.apiUrl,
        {
          model: 'llama-3.1-8b-instant',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userQuestion }
          ],
          temperature: 0.7,
          max_tokens: 512
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('AI Assistant Error:', error.response?.data || error.message);
      throw new Error('Failed to get advice from Botanical Assistant.');
    }
  }
}

module.exports = new BotanicalAssistant();
