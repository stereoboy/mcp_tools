import React, { useState, useRef } from 'react';
import { GoogleGenAI } from '@google/genai';

interface Message {
  sender: 'user' | 'gemini';
  text: string;
}

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey: API_KEY });

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMessage: Message = { sender: 'user', text: input };
    // Add user's message to local state immediately
    setMessages((msgs) => [...msgs, userMessage]);
    const conversationSoFar = [...messages, userMessage];

    setInput('');
    setLoading(true);
    try {
      // Convert our internal message list to the SDK's "contents" format
      const contents = conversationSoFar.map((msg) => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }],
      }));

      console.log(contents);
      const result = await ai.models.generateContent({
        model: 'gemini-2.0-flash-001',
        contents,
      });

      const geminiText = result.text ?? 'No response.';
      setMessages((msgs) => [...msgs, { sender: 'gemini', text: geminiText }]);
    } catch (e) {
      setMessages((msgs) => [...msgs, { sender: 'gemini', text: 'Error contacting Gemini API.' }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !loading) sendMessage();
  };

  return (
    <div style={{ minHeight: '100vh', width: '100vw', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f6f8fa' }}>
      <div style={{ width: 600, fontFamily: 'sans-serif', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', borderRadius: 16, background: '#fff', padding: 32 }}>
        <h2 style={{ marginTop: 0 }}>Gemini Chat</h2>
        <div style={{ border: '1px solid #ccc', borderRadius: 8, padding: 16, minHeight: 450, background: '#fafbfc', marginBottom: 12 }}>
          {messages.length === 0 && <div style={{ color: '#888' }}>Say hello to Gemini!</div>}
          {messages.map((msg, i) => (
            <div key={i} style={{ textAlign: msg.sender === 'user' ? 'right' : 'left', margin: '8px 0' }}>
              <span style={{
                display: 'inline-block',
                background: msg.sender === 'user' ? '#d1e7fd' : '#e9ecef',
                color: '#222',
                borderRadius: 16,
                padding: '8px 14px',
                maxWidth: '80%',
                wordBreak: 'break-word',
              }}>
                {msg.text}
              </span>
            </div>
          ))}
          {loading && <div style={{ color: '#888' }}>Gemini is typing...</div>}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            placeholder="Type your message..."
            style={{ flex: 1, padding: 10, borderRadius: 8, border: '1px solid #ccc' }}
          />
          <button onClick={sendMessage} disabled={loading || !input.trim()} style={{ padding: '0 18px', borderRadius: 8, background: '#1976d2', color: '#fff', border: 'none' }}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
