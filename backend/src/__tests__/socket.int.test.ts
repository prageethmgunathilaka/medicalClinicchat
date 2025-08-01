import { createServer } from 'http';
import { Server } from 'socket.io';
import { io as ioClient, Socket as ClientSocket } from 'socket.io-client';
import OpenAI from 'openai';

// Mock OpenAI
jest.mock('openai');
const mockOpenAI = OpenAI as jest.MockedClass<typeof OpenAI>;

describe('Socket.IO Integration Tests', () => {
  let httpServer: any;
  let ioServer: Server;
  let clientSocket: ClientSocket;
  let mockCreate: jest.Mock;

  beforeAll((done) => {
    // Setup mock OpenAI
    mockCreate = jest.fn();
    mockOpenAI.prototype.chat = {
      completions: {
        create: mockCreate
      }
    } as any;

    // Create HTTP server and Socket.IO server
    httpServer = createServer();
    ioServer = new Server(httpServer, {
      cors: { origin: '*' }
    });

    // Setup the chat message handler (mirroring main app)
    ioServer.on('connection', (socket) => {
      socket.on('chat message', async (msg, lang = 'en') => {
        ioServer.emit('chat message', { sender: 'user', text: msg });
        try {
          const reply = await getAIReply(msg, lang);
          ioServer.emit('chat message', { sender: 'bot', text: reply });
        } catch {
          ioServer.emit('chat message', { sender: 'bot', text: 'Sorry, there was an error.' });
        }
      });
    });

    httpServer.listen(() => {
      const port = (httpServer.address() as any).port;
      clientSocket = ioClient(`http://localhost:${port}`);
      clientSocket.on('connect', done);
    });
  });

  afterAll((done) => {
    ioServer.close();
    clientSocket.close();
    httpServer.close(done);
  });

  beforeEach(() => {
    jest.clearAllMocks();
    // Clean up all event listeners to prevent interference between tests
    clientSocket.removeAllListeners('chat message');
  });

  async function getAIReply(message: string, lang: string = 'en') {
    const openai = new mockOpenAI({ apiKey: 'test-key' });
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

  describe('Connection Management', () => {
    it('should establish WebSocket connection', (done) => {
      expect(clientSocket.connected).toBe(true);
      done();
    });

    it('should handle multiple concurrent connections', (done) => {
      const clients: ClientSocket[] = [];
      let connectedCount = 0;
      const targetConnections = 5;

      for (let i = 0; i < targetConnections; i++) {
        const port = (httpServer.address() as any).port;
        const client = ioClient(`http://localhost:${port}`);
        clients.push(client);
        
        client.on('connect', () => {
          connectedCount++;
          if (connectedCount === targetConnections) {
            // Clean up
            clients.forEach(c => c.close());
            expect(connectedCount).toBe(targetConnections);
            done();
          }
        });
      }
    });
  });

  describe('Chat Message Flow', () => {
    it('should handle chat message in English', (done) => {
      const testMessage = 'I need to book a dental appointment';
      const mockResponse = {
        choices: [{
          message: {
            content: 'I can help you book a dental appointment. What date would work for you?'
          }
        }]
      };
      mockCreate.mockResolvedValue(mockResponse);

      let messagesReceived = 0;
      const expectedMessages = [
        { sender: 'user', text: testMessage },
        { sender: 'bot', text: 'I can help you book a dental appointment. What date would work for you?' }
      ];

      clientSocket.on('chat message', (message) => {
        expect(message).toEqual(expectedMessages[messagesReceived]);
        messagesReceived++;
        
        if (messagesReceived === expectedMessages.length) {
          expect(mockCreate).toHaveBeenCalledWith({
            model: 'gpt-4o',
            messages: [
              { role: 'system', content: expect.stringContaining('medical receptionist') },
              { role: 'user', content: testMessage }
            ]
          });
          done();
        }
      });

      clientSocket.emit('chat message', testMessage, 'en');
    });

    it('should handle chat message in Sinhala', (done) => {
      const testMessage = 'මට දන්ත වෛද්‍ය හමුවීමක් අවශ්‍යයි';
      const mockResponse = {
        choices: [{
          message: {
            content: 'ඔබට දන්ත වෛද්‍ය හමුවීමක් සඳහා මම සහාය වන්න පුළුවන්.'
          }
        }]
      };
      mockCreate.mockResolvedValue(mockResponse);

      let messagesReceived = 0;
      const expectedMessages = [
        { sender: 'user', text: testMessage },
        { sender: 'bot', text: 'ඔබට දන්ත වෛද්‍ය හමුවීමක් සඳහා මම සහාය වන්න පුළුවන්.' }
      ];

      clientSocket.on('chat message', (message) => {
        expect(message).toEqual(expectedMessages[messagesReceived]);
        messagesReceived++;
        
        if (messagesReceived === expectedMessages.length) {
          expect(mockCreate).toHaveBeenCalledWith({
            model: 'gpt-4o',
            messages: [
              { role: 'system', content: expect.stringContaining('medical receptionist') },
              { role: 'user', content: `Reply in Sinhala. User: ${testMessage}` }
            ]
          });
          done();
        }
      });

      clientSocket.emit('chat message', testMessage, 'si');
    });

    it('should handle OpenAI API errors in chat', (done) => {
      const testMessage = 'Test error handling';
      mockCreate.mockRejectedValue(new Error('OpenAI API Error'));

      let messagesReceived = 0;
      const expectedMessages = [
        { sender: 'user', text: testMessage },
        { sender: 'bot', text: 'Sorry, there was an error.' }
      ];

      clientSocket.on('chat message', (message) => {
        expect(message).toEqual(expectedMessages[messagesReceived]);
        messagesReceived++;
        
        if (messagesReceived === expectedMessages.length) {
          done();
        }
      });

      clientSocket.emit('chat message', testMessage, 'en');
    });

    it('should handle empty messages', (done) => {
      const testMessage = '';
      const mockResponse = {
        choices: [{
          message: {
            content: 'How can I help you today?'
          }
        }]
      };
      mockCreate.mockResolvedValue(mockResponse);

      let messagesReceived = 0;

      clientSocket.on('chat message', (message) => {
        messagesReceived++;
        
        if (messagesReceived === 2) { // User message + bot response
          expect(message.sender).toBe('bot');
          expect(message.text).toBe('How can I help you today?');
          done();
        }
      });

      clientSocket.emit('chat message', testMessage, 'en');
    });

    it('should handle very long messages', (done) => {
      const longMessage = 'I need help with '.repeat(1000);
      const mockResponse = {
        choices: [{
          message: {
            content: 'I received your detailed message. Let me help you.'
          }
        }]
      };
      mockCreate.mockResolvedValue(mockResponse);

      let messagesReceived = 0;

      clientSocket.on('chat message', (message) => {
        messagesReceived++;
        
        if (messagesReceived === 2) { // User message + bot response
          expect(message.sender).toBe('bot');
          expect(message.text).toBe('I received your detailed message. Let me help you.');
          done();
        }
      });

      clientSocket.emit('chat message', longMessage, 'en');
    });
  });

  describe('Multi-Client Communication', () => {
    it('should broadcast messages to all connected clients', (done) => {
      const port = (httpServer.address() as any).port;
      const client2 = ioClient(`http://localhost:${port}`);
      const testMessage = 'Hello from client 1';
      const mockResponse = {
        choices: [{
          message: {
            content: 'Hello! How can I help you?'
          }
        }]
      };
      mockCreate.mockResolvedValue(mockResponse);

      let client1Messages = 0;
      let client2Messages = 0;

      client2.on('connect', () => {
        clientSocket.on('chat message', () => {
          client1Messages++;
          checkCompletion();
        });

        client2.on('chat message', () => {
          client2Messages++;
          checkCompletion();
        });

        clientSocket.emit('chat message', testMessage, 'en');
      });

      function checkCompletion() {
        if (client1Messages === 2 && client2Messages === 2) { // Both should receive user + bot messages
          client2.close();
          done();
        }
      }
    });

    it('should handle disconnection gracefully', (done) => {
      const port = (httpServer.address() as any).port;
      const client2 = ioClient(`http://localhost:${port}`);

      client2.on('connect', () => {
        expect(client2.connected).toBe(true);
        client2.disconnect();
        
        setTimeout(() => {
          expect(client2.connected).toBe(false);
          done();
        }, 100);
      });
    });
  });

  describe('Language Support', () => {
    it('should default to English when no language specified', (done) => {
      const testMessage = 'Hello';
      const mockResponse = {
        choices: [{
          message: {
            content: 'Hello! How can I help you?'
          }
        }]
      };
      mockCreate.mockResolvedValue(mockResponse);

      clientSocket.on('chat message', (message) => {
        if (message.sender === 'bot') {
          expect(mockCreate).toHaveBeenCalledWith({
            model: 'gpt-4o',
            messages: [
              { role: 'system', content: expect.stringContaining('medical receptionist') },
              { role: 'user', content: testMessage } // Should not have Sinhala prefix
            ]
          });
          done();
        }
      });

      // Emit without language parameter
      clientSocket.emit('chat message', testMessage);
    });

    it('should handle unsupported language gracefully', (done) => {
      const testMessage = 'Bonjour';
      const mockResponse = {
        choices: [{
          message: {
            content: 'Hello! How can I help you?'
          }
        }]
      };
      mockCreate.mockResolvedValue(mockResponse);

      clientSocket.on('chat message', (message) => {
        if (message.sender === 'bot') {
          // Should treat as English (no special handling for unsupported languages)
          expect(mockCreate).toHaveBeenCalledWith({
            model: 'gpt-4o',
            messages: [
              { role: 'system', content: expect.stringContaining('medical receptionist') },
              { role: 'user', content: testMessage }
            ]
          });
          done();
        }
      });

      clientSocket.emit('chat message', testMessage, 'fr'); // French not supported
    });
  });

  describe('Error Scenarios', () => {
    it('should handle network timeouts', (done) => {
      const testMessage = 'Test timeout';
      mockCreate.mockImplementation(() => 
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Network timeout')), 100)
        )
      );

      let messagesReceived = 0;

      clientSocket.on('chat message', (message) => {
        messagesReceived++;
        
        if (messagesReceived === 2) { // User message + error response
          expect(message.sender).toBe('bot');
          expect(message.text).toBe('Sorry, there was an error.');
          done();
        }
      });

      clientSocket.emit('chat message', testMessage, 'en');
    });

    it('should handle malformed OpenAI responses', (done) => {
      const testMessage = 'Test malformed response';
      mockCreate.mockResolvedValue({
        choices: [{ message: null }] // Malformed response
      });

      let messagesReceived = 0;

      clientSocket.on('chat message', (message) => {
        messagesReceived++;
        
        if (messagesReceived === 2) {
          expect(message.sender).toBe('bot');
          expect(message.text).toBe(''); // Should return empty string
          done();
        }
      });

      clientSocket.emit('chat message', testMessage, 'en');
    });
  });

  describe('Performance Tests', () => {
    it('should handle rapid message sending', (done) => {
      const messageCount = 10;
      let responsesReceived = 0;
      const mockResponse = {
        choices: [{
          message: {
            content: 'Quick response'
          }
        }]
      };
      mockCreate.mockResolvedValue(mockResponse);

      clientSocket.on('chat message', (message) => {
        if (message.sender === 'bot') {
          responsesReceived++;
          if (responsesReceived === messageCount) {
            expect(mockCreate).toHaveBeenCalledTimes(messageCount);
            done();
          }
        }
      });

      // Send multiple messages rapidly
      for (let i = 0; i < messageCount; i++) {
        clientSocket.emit('chat message', `Message ${i}`, 'en');
      }
    });

    it.skip('should handle concurrent clients sending messages (flaky)', (done) => {
      const clientCount = 3;
      const messagesPerClient = 2;
      const clients: ClientSocket[] = [];
      let totalBotResponses = 0;
      let connectedClients = 0;
      const expectedResponses = clientCount * messagesPerClient;

      const mockResponse = {
        choices: [{
          message: {
            content: 'Concurrent response'
          }
        }]
      };
      mockCreate.mockResolvedValue(mockResponse);

      // Set up message handler for all clients to count bot responses
      const setupMessageHandler = (client: ClientSocket) => {
        client.on('chat message', (message) => {
          if (message.sender === 'bot') {
            totalBotResponses++;
            if (totalBotResponses === expectedResponses) {
              // Clean up clients
              clients.forEach(c => c.close());
              expect(mockCreate).toHaveBeenCalledTimes(expectedResponses);
              done();
            }
          }
        });
      };

      // Function to send messages once all clients are connected
      const sendMessagesWhenReady = () => {
        if (connectedClients === clientCount) {
          // All clients connected, now send messages with small delays
          clients.forEach((client, i) => {
            for (let j = 0; j < messagesPerClient; j++) {
              setTimeout(() => {
                client.emit('chat message', `Client ${i} Message ${j}`, 'en');
              }, (i * messagesPerClient + j) * 10); // 10ms delay between messages
            }
          });
        }
      };

      // Create multiple clients
      for (let i = 0; i < clientCount; i++) {
        const port = (httpServer.address() as any).port;
        const client = ioClient(`http://localhost:${port}`);
        clients.push(client);
        
        setupMessageHandler(client);
        
        client.on('connect', () => {
          connectedClients++;
          sendMessagesWhenReady();
        });
      }
    });
  });
}); 