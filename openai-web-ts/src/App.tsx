import { useState } from 'react'
import OpenAI from 'openai'
import { Message, ChatState } from './types'
import './App.css'

function App() {
  const [state, setState] = useState<ChatState>({
    messages: [],
    isLoading: false,
    input: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!state.input.trim()) return

    setState(prev => ({
      ...prev,
      isLoading: true,
      messages: [...prev.messages, { role: 'user', content: prev.input }],
      input: ''
    }))

    try {
      const openai = new OpenAI({
        apiKey: import.meta.env.VITE_OPENAI_API_KEY,
        dangerouslyAllowBrowser: true // Note: In production, you should use a backend
      })

      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          ...state.messages.map(msg => ({
            role: msg.role === 'user' ? 'user' : 'assistant',
            content: msg.content
          })),
          { role: 'user', content: state.input }
        ],
        temperature: 0.7,
      })

      const assistantMessage: Message = {
        role: 'assistant',
        content: response.choices[0]?.message?.content || 'No response from AI'
      }

      setState(prev => ({
        ...prev,
        messages: [...prev.messages, assistantMessage]
      }))
    } catch (error) {
      console.error('Error:', error)
      const errorMessage: Message = {
        role: 'error',
        content: 'Sorry, there was an error processing your request.'
      }
      setState(prev => ({
        ...prev,
        messages: [...prev.messages, errorMessage]
      }))
    } finally {
      setState(prev => ({
        ...prev,
        isLoading: false
      }))
    }
  }

  return (
    <div className="chat-container">
      <h1>OpenAI Chat Demo</h1>
      <div className="messages">
        {state.messages.map((message, index) => (
          <div key={index} className={`message ${message.role}`}>
            <strong>{message.role === 'user' ? 'You: ' : 'Assistant: '}</strong>
            {message.content}
          </div>
        ))}
        {state.isLoading && <div className="message loading">Assistant is typing...</div>}
      </div>
      <form onSubmit={handleSubmit} className="input-form">
        <input
          type="text"
          value={state.input}
          onChange={(e) => setState(prev => ({ ...prev, input: e.target.value }))}
          placeholder="Type your message..."
          disabled={state.isLoading}
        />
        <button type="submit" disabled={state.isLoading}>
          Send
        </button>
      </form>
    </div>
  )
}

export default App