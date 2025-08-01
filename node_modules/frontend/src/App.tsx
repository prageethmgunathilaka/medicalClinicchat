import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useTranslation } from 'react-i18next';
import './i18n';
import { marked } from 'marked';

interface Message {
  sender: 'user' | 'bot';
  text: string;
}

export default function App() {
  const { t, i18n } = useTranslation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);

  // Load saved language on component mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('clinicChatLanguage');
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'si')) {
      i18n.changeLanguage(savedLanguage);
    }
  }, [i18n]);

  useEffect(() => {
    // Initialize socket connection
    socketRef.current = io('http://localhost:4000');
    const socket = socketRef.current;

    socket.on('chat message', (msg: Message) => {
      setMessages((msgs) => [...msgs, msg]);
      // Only stop loading when bot responds
      if (msg.sender === 'bot') {
        setLoading(false);
      }
    });

    return () => {
      socket.off('chat message');
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;
    setLoading(true);
    socketRef.current?.emit('chat message', input, i18n.language);
    setInput('');
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLanguage = e.target.value;
    i18n.changeLanguage(newLanguage);
    localStorage.setItem('clinicChatLanguage', newLanguage);
  };

  return (
    <div className="chat-bg">
      <div className="chat-container">
        <header className="chat-header">
          <h2>{t('ClinicChat')}</h2>
          <select
            className="lang-switcher"
            value={i18n.language}
            onChange={handleLanguageChange}
            aria-label="Select language"
          >
            <option value="en">English</option>
            <option value="si">සිංහල</option>
          </select>
        </header>
        <main className="chat-main" ref={chatRef} tabIndex={0} aria-label="Chat messages">
          {messages.length === 0 && <p className="chat-placeholder">{t('[Chat messages will appear here]')}</p>}
          {messages.map((msg, i) => (
            <div key={i} className={`chat-bubble ${msg.sender}`}> 
              {msg.sender === 'bot' ? (
                <span dangerouslySetInnerHTML={{ __html: marked.parse(msg.text) }} />
              ) : (
                <span>{msg.text}</span>
              )}
            </div>
          ))}
          {loading && <p className="chat-loading">{t('...')}</p>}
        </main>
        <form className="chat-footer" onSubmit={sendMessage} autoComplete="off">
          <input
            className="chat-input"
            placeholder={t('Type your message...')}
            value={input}
            onChange={e => setInput(e.target.value)}
            disabled={loading}
            aria-label={t('Type your message...')}
          />
          <button
            className="chat-send"
            type="submit"
            disabled={loading || !input.trim()}
            aria-label={t('Send')}
          >
            {t('Send')}
          </button>
        </form>
      </div>
      <style>{`
        body, html { height: 100%; margin: 0; padding: 0; }
        .chat-bg {
          min-height: 100vh;
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
        }
        .chat-container {
          width: 100%;
          max-width: 1200px;
          background: #fff;
          border-radius: 18px;
          box-shadow: 0 4px 24px 0 rgba(60, 72, 88, 0.12);
          display: flex;
          flex-direction: column;
          height: 80vh;
          min-height: 400px;
          overflow: hidden;
        }
        .chat-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 20px 10px 20px;
          background: #f7fafc;
          border-bottom: 1px solid #e3e8ee;
        }
        .chat-header h2 {
          margin: 0;
          font-size: 1.5rem;
          font-weight: 700;
          color: #1976d2;
        }
        .lang-switcher {
          border: 1px solid #e3e8ee;
          border-radius: 6px;
          padding: 4px 10px;
          font-size: 1rem;
          background: #fff;
          color: #1976d2;
          outline: none;
        }
        .chat-main {
          flex: 1 1 0%;
          padding: 18px 14px 12px 14px;
          overflow-y: auto;
          background: #f9f9fb;
        }
        .chat-placeholder {
          color: #b0b8c1;
          text-align: center;
          margin-top: 40px;
        }
        .chat-bubble {
          margin: 8px 0;
          display: flex;
          max-width: 70%;
        }
        .chat-bubble.user {
          justify-content: flex-end;
        }
        .chat-bubble.bot {
          justify-content: flex-start;
        }
        .chat-bubble span {
          display: inline-block;
          padding: 10px 16px;
          border-radius: 16px;
          font-size: 1rem;
          line-height: 1.5;
          word-break: break-word;
          box-shadow: 0 1px 2px rgba(60,72,88,0.04);
        }
        .chat-bubble.user span {
          background: linear-gradient(135deg, #1976d2 0%, #42a5f5 100%);
          color: #fff;
          border-bottom-right-radius: 4px;
        }
        .chat-bubble.bot span {
          background: #e3e8ee;
          color: #222;
          border-bottom-left-radius: 4px;
        }
        .chat-loading {
          color: #b0b8c1;
          text-align: center;
        }
        .chat-footer {
          display: flex;
          align-items: center;
          padding: 14px 14px 18px 14px;
          background: #f7fafc;
          border-top: 1px solid #e3e8ee;
          gap: 10px;
          position: sticky;
          bottom: 0;
        }
        .chat-input {
          flex: 1;
          padding: 10px 14px;
          border-radius: 8px;
          border: 1px solid #c3cfe2;
          font-size: 1rem;
          outline: none;
          background: #fff;
        }
        .chat-send {
          padding: 10px 18px;
          border-radius: 8px;
          border: none;
          background: #1976d2;
          color: #fff;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }
        .chat-send:disabled {
          background: #b0b8c1;
          cursor: not-allowed;
        }
        @media (max-width: 600px) {
          .chat-container {
            max-width: 100vw;
            min-height: 100vh;
            border-radius: 0;
            box-shadow: none;
          }
          .chat-header, .chat-footer {
            padding-left: 8px;
            padding-right: 8px;
          }
          .chat-main {
            padding-left: 6px;
            padding-right: 6px;
          }
        }
      `}</style>
    </div>
  );
} 