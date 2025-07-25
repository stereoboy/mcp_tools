import React, { useState, useRef } from 'react';
import { GoogleGenAI, Type } from '@google/genai';

interface Message {
  sender: 'user' | 'gemini';
  text: string;
}

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey: API_KEY });

// Tool declarations for Gemini function calling
const getCurrentTimeFunctionDeclaration = {
  name: 'get_current_time',
  description: 'Returns the current local date and time as a string',
  parameters: {
    type: Type.OBJECT,
    properties: {
      location: {
        type: Type.STRING,
        description: 'The location to get the current time for',
      },
    },
  },
};

const getCurrentWeatherFunctionDeclaration = {
  name: 'get_current_weather',
  description: 'Returns the current weather as a string',
  parameters: {
    type: Type.OBJECT,
    properties: {
      location: {
        type: Type.STRING,
        description: 'The location to get the current weather for',
      },
    },
  },
};

// Map of tool name to local handler
const toolHandlers: Record<string, (args: any) => string> = {
  get_current_time: () => new Date().toLocaleString(),
  get_current_weather: () => 'The current weather is sunny and 70 degrees.',
};

const config = {
  tools: [
    {
      functionDeclarations: [getCurrentTimeFunctionDeclaration, getCurrentWeatherFunctionDeclaration],
    },
  ],
};

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const contentsRef = useRef<any[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const contents = contentsRef.current;

    const userMessage: Message = { sender: 'user', text: input };
    // Add user's message to local state immediately
    setMessages((msgs) => [...msgs, userMessage]);
    contents.push({ role: 'user', parts: [{ text: input }] });

    setInput('');
    setLoading(true);
    try {
      console.log(contents);
      let response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents,
        config: config
      });

      while (true) {
        // Check if the model wanted to call a function
        console.log('response', response);
        if (response.functionCalls && response.functionCalls.length > 0) {
          console.log('response.functionCalls', response.functionCalls);
          for (const fn of response.functionCalls) {
            console.log('fn', fn);
            const { name, args } = fn;
            if (name && args) {
              const handler = toolHandlers[name];
              const toolResult = handler ? handler(args) : `No handler for ${name}`;
              setMessages((msgs) => [...msgs, { sender: 'tools', text: `${name}(${JSON.stringify(args, null, 2)}) returns: ${toolResult}` }]);
              contents.push(response.candidates[0]?.content);
              contents.push({
                role: 'user', parts: [
                  {
                    functionResponse:
                    {
                      name: name,
                      response: { toolResult }
                    }
                  }
                ]
              });
              console.log('contents', contents);
            }
          }

          response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: contents,
            config: config
          });
        } else {
          const geminiText = response.text ?? 'No response.';
          setMessages((msgs) => [...msgs, { sender: 'gemini', text: geminiText }]);
          contents.push(response.candidates[0]?.content);
          break;
        }
      }

    } catch (e) {
      console.error(e);
      setMessages((msgs) => [...msgs, { sender: 'gemini', text: 'Error contacting Gemini API.' }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
    contentsRef.current = contents;
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
