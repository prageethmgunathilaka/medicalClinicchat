import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import OpenAI from 'openai';

dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: '*' }
});

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.post('/api/message', async (req, res) => {
  const { message, lang } = req.body;
  try {
    const reply = await getAIReply(message, lang);
    res.json({ reply });
  } catch (err) {
    res.json({ reply: 'Sorry, there was an error.' });
  }
});

io.on('connection', (socket) => {
  socket.on('chat message', async (msg, lang = 'en') => {
    io.emit('chat message', { sender: 'user', text: msg });
    try {
      const reply = await getAIReply(msg, lang);
      io.emit('chat message', { sender: 'bot', text: reply });
    } catch {
      io.emit('chat message', { sender: 'bot', text: 'Sorry, there was an error.' });
    }
  });
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

const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => {
  console.log(`Backend listening on port ${PORT}`);
}); 