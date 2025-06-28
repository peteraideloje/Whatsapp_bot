import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

class OpenAIService {
  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY;
    this.apiUrl = 'https://api.openai.com/v1/chat/completions';
  }

  async generateResponse(userMessage, context = '', faqs = []) {
    try {
      const systemPrompt = `You are a helpful business assistant bot. Your role is to:
1. Answer customer questions professionally and concisely
2. Use the provided FAQ database when relevant
3. If you can't answer something, politely suggest connecting with a human representative
4. Keep responses under 200 words
5. Be friendly and professional

Context: ${context}

Available FAQs:
${faqs.map(faq => `Q: ${faq.question}\nA: ${faq.answer}`).join('\n\n')}

If the user's question matches any FAQ, use that information. Otherwise, provide a helpful general response.`;

      const response = await axios.post(this.apiUrl, {
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ],
        max_tokens: 300,
        temperature: 0.7
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('Error generating AI response:', error.response?.data || error.message);
      return "I'm having trouble processing your request right now. Let me connect you with a human representative who can better assist you.";
    }
  }

  async analyzeIntent(message) {
    try {
      const response = await axios.post(this.apiUrl, {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `Analyze the user's message and classify the intent. Return only one of these categories:
- pricing: Questions about costs, plans, or pricing
- support: Technical issues, problems, or help requests
- products: Questions about features, services, or what you offer
- contact: Requests to speak with humans or get contact information
- greeting: Greetings, hello messages
- thanks: Thank you messages
- complaint: Complaints or negative feedback
- general: Everything else

Respond with only the category name.`
          },
          { role: 'user', content: message }
        ],
        max_tokens: 10,
        temperature: 0.1
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data.choices[0].message.content.trim().toLowerCase();
    } catch (error) {
      console.error('Error analyzing intent:', error);
      return 'general';
    }
  }
}

export default OpenAIService;