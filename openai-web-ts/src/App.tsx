import { useState } from 'react'
import OpenAI from 'openai'
import { Message, ChatState } from './types'
import './App.css'
import { roverTool } from './tools/Rover'
import { pickingMachineTool } from './tools/PickingMachine'
import { processingMachineTool } from './tools/ProcessingMachine'

const toolSchemas = [
  {
    type: 'function',
    function: {
      name: 'roverTool',
      description: 'Returns the status of the Rover tool.',
      parameters: { type: 'object', properties: {}, required: [] },
    },
  },
  {
    type: 'function',
    function: {
      name: 'pickingMachineTool',
      description: 'Returns the status of the Picking Machine tool.',
      parameters: { type: 'object', properties: {}, required: [] },
    },
  },
  {
    type: 'function',
    function: {
      name: 'processingMachineTool',
      description: 'Returns the status of the Processing Machine tool.',
      parameters: { type: 'object', properties: {}, required: [] },
    },
  },
]

const toolFunctions: Record<string, () => string> = {
  roverTool,
  pickingMachineTool,
  processingMachineTool,
}

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
        apiKey: (import.meta as any).env.VITE_OPENAI_API_KEY,
        dangerouslyAllowBrowser: true // Note: In production, you should use a backend
      })

      // Prepare chat history for OpenAI
      const chatMessages = state.messages.map((msg) => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content,
      }))
      chatMessages.push({ role: 'user', content: state.input })

      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: chatMessages as any,
        tools: toolSchemas as any,
      })

      const choice = response.choices[0]
      const finishReason = choice.finish_reason
      const aiMessage = choice.message

      if (finishReason === 'tool_calls' && aiMessage.tool_calls) {
        // Only handle the first tool call for simplicity
        const toolCall = aiMessage.tool_calls[0]
        const toolName = toolCall.function.name
        const toolResult = toolFunctions[toolName]()
        setState(prev => ({
          ...prev,
          messages: [
            ...prev.messages,
            { role: 'assistant', content: `Function ${toolName} called. Result: ${toolResult}` },
          ],
        }))
      } else {
        setState(prev => ({
          ...prev,
          messages: [
            ...prev.messages,
            { role: 'assistant', content: aiMessage.content || '' },
          ],
        }))
      }
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
      <h1>OpenAI Chat Demo (with Tools)</h1>
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