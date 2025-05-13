import { useState } from 'react'
import { ChatOpenAI } from '@langchain/openai'
import './App.css'

function App() {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!input.trim()) return

    setIsLoading(true)
    const userMessage = { role: 'user', content: input }
    setMessages(prev => [...prev, userMessage])
    setInput('')

    try {
      const model = new ChatOpenAI({
        modelName: 'gpt-3.5-turbo',
        temperature: 0.7,
        openAIApiKey: import.meta.env.VITE_OPENAI_API_KEY,
      })

      const response = await model.invoke(input)
      const assistantMessage = { role: 'assistant', content: response.content }
      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Error:', error)
      setMessages(prev => [...prev, { role: 'error', content: 'Sorry, there was an error processing your request.' }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="chat-container">
      <h1>MCP LangChain GPT-3.5 Demo</h1>
      <div className="messages">
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.role}`}>
            <strong>{message.role === 'user' ? 'You: ' : 'Assistant: '}</strong>
            {message.content}
          </div>
        ))}
        {isLoading && <div className="message loading">Assistant is typing...</div>}
      </div>
      <form onSubmit={handleSubmit} className="input-form">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading}>
          Send
        </button>
      </form>
    </div>
  )
}

export default App