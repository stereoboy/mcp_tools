# MCP Protocol Examples

This repository contains various examples of implementing the MCP (Machine Conversation Protocol) across different platforms and technologies.

## Examples

### 1. LangChain Web Chat (JavaScript)
A web-based implementation using React, LangChain.js, and OpenAI's GPT-3.5 model. This example provides a simple chat interface for interacting with the AI model.

**Location:** `langchain-web/`

#### Features
- Real-time chat interface
- Integration with OpenAI's GPT-3.5 model via LangChain
- Responsive design
- Error handling and loading states

*See `langchain-web/README.md` for setup and usage instructions.*

---

### 2. OpenAI Web Chat with Tools (TypeScript)
A web-based implementation using React, TypeScript, and OpenAI's GPT API. This example demonstrates how to integrate OpenAI's function calling (tools) with a simulated manufacturing system.

**Location:** `openai-web-ts/`

#### Features
- Modern React + TypeScript + Vite setup
- OpenAI GPT-3.5/4 API integration
- OpenAI function calling (tools) support
- Three example tools: Rover, Picking Machine, Processing Machine
- Tools return static responses for demonstration
- Clean chat interface

#### Tools Overview
- **Rover**: Simulates a mobile robot in a manufacturing system
- **Picking Machine**: Simulates a machine that loads packages
- **Processing Machine**: Simulates a machine that processes packages

#### How Function Calling Works
- The chat UI sends user messages to OpenAI with the tool schemas
- If the AI decides to call a tool, the app invokes the corresponding function and displays the result in the chat
- Tools currently return static strings, but can be expanded to simulate real logic

*See `openai-web-ts/README.md` for setup and usage instructions.*

---

## Project Structure

Each example is contained in its own directory with the following structure:
- `src/` - Source code
- `public/` - Static assets (if needed)
- `package.json` - Dependencies and scripts
- `README.md` - Example-specific documentation

## Getting Started

Each example directory contains its own setup instructions. Please refer to the specific example's README.md for detailed setup and usage instructions.