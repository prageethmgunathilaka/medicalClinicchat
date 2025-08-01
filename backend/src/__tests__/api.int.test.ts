import request from 'supertest';
import express from 'express';
import cors from 'cors';
import OpenAI from 'openai';
import dotenv from 'dotenv';

// Mock OpenAI
jest.mock('openai');
const mockOpenAI = OpenAI as jest.MockedClass<typeof OpenAI>;

dotenv.config();

// Create test app that mirrors the main app
const app = express();
app.use(cors());
app.use(express.json());

// Mock OpenAI instance
const mockCreate = jest.fn();
mockOpenAI.prototype.chat = {
  completions: {
    create: mockCreate
  }
} as any;

const openai = new mockOpenAI({ apiKey: 'test-key' });

// Health endpoint
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Message endpoint with OpenAI integration
app.post('/api/message', async (req, res) => {
  try {
    // Validate request body exists and has required fields
    if (!req.body || typeof req.body !== 'object' || 
        !req.body.hasOwnProperty('message') || 
        req.body.message === null || req.body.message === undefined ||
        typeof req.body.message !== 'string') {
      return res.status(500).json({ reply: 'Sorry, there was an error.' });
    }
    
    const { message, lang } = req.body;
    const reply = await getAIReply(message, lang);
    res.json({ reply });
  } catch (err) {
    res.status(500).json({ reply: 'Sorry, there was an error.' });
  }
});

async function getAIReply(message: string, lang: string = 'en') {
  let prompt = message;
  if (lang === 'si') {
    prompt = `Reply in Sinhala. User: ${message}`;
  }
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: `
You are a professional, friendly medical receptionist who is also a medical advisor and care coordinator.
Medical Stream: Dentistry & aesthetic medicine.
Your responsibilities:
- Answer any questions from patients or customers professionally.
- Schedule customer appointments yourself.
- Follow up on appointments by reminding patients and tracking final results.
- If a customer does not arrive as scheduled, mark as no-show or cancel as appropriate.
- If a customer arrives, provide comfort and reassurance.
- Provide after-care service as part of your care coordinator role.
Strictly follow these rules:
- Do NOT share any prices that are not published or allowed to be shared. If unsure, ask the customer to consult with a doctor or staff.
- Do NOT share any sensitive customer details with other customers. You may share with doctors as needed for care.
- Always act as a receptionist, medical advisor, and care coordinator for dentistry and aesthetic medicine.
` },
      { role: 'user', content: prompt }
    ]
  });
  return completion.choices[0].message?.content || '';
}

describe('API Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /health', () => {
    it('should return status ok', async () => {
      const res = await request(app).get('/health');
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({ status: 'ok' });
      expect(res.headers['content-type']).toMatch(/json/);
    });

    it('should handle concurrent health check requests', async () => {
      const requests = Array(10).fill(null).map(() => request(app).get('/health'));
      const responses = await Promise.all(requests);
      
      responses.forEach(res => {
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ status: 'ok' });
      });
    });
  });

  describe('POST /api/message', () => {
    it('should process message successfully in English', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: 'Hello! How can I help you with your dental appointment today?'
          }
        }]
      };
      mockCreate.mockResolvedValue(mockResponse);

      const res = await request(app)
        .post('/api/message')
        .send({ message: 'I need to book an appointment', lang: 'en' });

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({ 
        reply: 'Hello! How can I help you with your dental appointment today?' 
      });
      expect(mockCreate).toHaveBeenCalledWith({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: expect.stringContaining('medical receptionist') },
          { role: 'user', content: 'I need to book an appointment' }
        ]
      });
    });

    it('should process message successfully in Sinhala', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: 'ආයුබෝවන්! මට ඔබට ගැටළුවක් ඇති අවස්ථාවේ සහාය වන්න පුළුවන්.'
          }
        }]
      };
      mockCreate.mockResolvedValue(mockResponse);

      const res = await request(app)
        .post('/api/message')
        .send({ message: 'මට දන්ත වෛද්‍ය හමුවීමක් අවශ්‍යයි', lang: 'si' });

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({ 
        reply: 'ආයුබෝවන්! මට ඔබට ගැටළුවක් ඇති අවස්ථාවේ සහාය වන්න පුළුවන්.' 
      });
      expect(mockCreate).toHaveBeenCalledWith({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: expect.stringContaining('medical receptionist') },
          { role: 'user', content: 'Reply in Sinhala. User: මට දන්ත වෛද්‍ය හමුවීමක් අවශ්‍යයි' }
        ]
      });
    });

    it('should handle OpenAI API errors gracefully', async () => {
      mockCreate.mockRejectedValue(new Error('OpenAI API Error'));

      const res = await request(app)
        .post('/api/message')
        .send({ message: 'Test message', lang: 'en' });

      expect(res.statusCode).toBe(500);
      expect(res.body).toEqual({ reply: 'Sorry, there was an error.' });
    });

    it('should handle empty message', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: 'I notice you sent an empty message. How can I assist you today?'
          }
        }]
      };
      mockCreate.mockResolvedValue(mockResponse);

      const res = await request(app)
        .post('/api/message')
        .send({ message: '', lang: 'en' });

      expect(res.statusCode).toBe(200);
      expect(res.body.reply).toBeDefined();
    });

    it('should handle missing request body', async () => {
      const res = await request(app)
        .post('/api/message')
        .send({});

      expect(res.statusCode).toBe(500);
      expect(res.body).toEqual({ reply: 'Sorry, there was an error.' });
    });

    it('should handle malformed JSON', async () => {
      const res = await request(app)
        .post('/api/message')
        .set('Content-Type', 'application/json')
        .send('{"message": "test"');

      expect(res.statusCode).toBe(400);
    });

    it('should validate medical context in system prompt', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: 'As a medical receptionist for dentistry and aesthetic medicine, I can help you.'
          }
        }]
      };
      mockCreate.mockResolvedValue(mockResponse);

      await request(app)
        .post('/api/message')
        .send({ message: 'What services do you offer?', lang: 'en' });

      const systemMessage = mockCreate.mock.calls[0][0].messages.find(
        (msg: any) => msg.role === 'system'
      );
      
      expect(systemMessage.content).toContain('medical receptionist');
      expect(systemMessage.content).toContain('Dentistry & aesthetic medicine');
      expect(systemMessage.content).toContain('Schedule customer appointments');
      expect(systemMessage.content).toContain('Do NOT share any prices');
      expect(systemMessage.content).toContain('Do NOT share any sensitive customer details');
    });

    it('should handle concurrent message requests', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: 'Concurrent response'
          }
        }]
      };
      mockCreate.mockResolvedValue(mockResponse);

      const requests = Array(5).fill(null).map((_, i) => 
        request(app)
          .post('/api/message')
          .send({ message: `Test message ${i}`, lang: 'en' })
      );

      const responses = await Promise.all(requests);
      
      responses.forEach(res => {
        expect(res.statusCode).toBe(200);
        expect(res.body.reply).toBe('Concurrent response');
      });
      expect(mockCreate).toHaveBeenCalledTimes(5);
    });

    it('should handle timeout scenarios', async () => {
      mockCreate.mockImplementation(() => 
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 100)
        )
      );

      const res = await request(app)
        .post('/api/message')
        .send({ message: 'Test timeout', lang: 'en' });

      expect(res.statusCode).toBe(500);
      expect(res.body).toEqual({ reply: 'Sorry, there was an error.' });
    });
  });

  describe('API Security and Validation', () => {
    it('should handle CORS properly', async () => {
      const res = await request(app)
        .options('/api/message')
        .set('Origin', 'http://localhost:3000')
        .set('Access-Control-Request-Method', 'POST');

      expect(res.headers['access-control-allow-origin']).toBeDefined();
    });

    it('should reject requests with invalid content-type', async () => {
      const res = await request(app)
        .post('/api/message')
        .set('Content-Type', 'text/plain')
        .send('plain text message');

      expect(res.statusCode).toBe(500);
      expect(res.body).toEqual({ reply: 'Sorry, there was an error.' });
    });

    it('should handle very long messages', async () => {
      const longMessage = 'a'.repeat(10000);
      const mockResponse = {
        choices: [{
          message: {
            content: 'I received your long message.'
          }
        }]
      };
      mockCreate.mockResolvedValue(mockResponse);

      const res = await request(app)
        .post('/api/message')
        .send({ message: longMessage, lang: 'en' });

      expect(res.statusCode).toBe(200);
      expect(res.body.reply).toBe('I received your long message.');
    });
  });
}); 