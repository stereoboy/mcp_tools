# Slack App

A Node.js Slack app built with Bolt framework and JavaScript.

## Features

- Message listening (responds to "hello")
- Slash commands (`/echo`)
- Interactive components (buttons)
- App Home tab
- Socket Mode enabled

## Setup

1. **Create a Slack App:**
   - Go to https://api.slack.com/apps
   - Click "Create New App" → "From scratch"
   - Choose a name and workspace

2. **Configure your app:**
   - Go to "OAuth & Permissions" and add these Bot Token Scopes:
     - `app_mentions:read`
     - `channels:history`
     - `chat:write`
     - `commands`
     - `im:history`
   - Install the app to your workspace

3. **Enable Socket Mode:**
   - Go to "Socket Mode" and enable it
   - Create an App Token with `connections:write` scope

4. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   Then edit `.env` with your actual values:
   - `SLACK_BOT_TOKEN`: From "OAuth & Permissions" (starts with `xoxb-`)
   - `SLACK_SIGNING_SECRET`: From "Basic Information"
   - `SLACK_APP_TOKEN`: From "Basic Information" (starts with `xapp-`)

5. **Add Event Subscriptions (if using):**
   - Go to "Event Subscriptions"
   - Subscribe to: `app_home_opened`, `message.channels`, `message.im`

6. **Add Slash Commands:**
   - Go to "Slash Commands"
   - Create `/echo` command

## Running the App

```bash
# Development mode with auto-restart
npm run dev

# Production mode
npm start
```

## Usage

- Send a message containing "hello" to trigger a response
- Use `/echo <text>` to echo back the text
- Visit the app's Home tab to see the welcome message
- Click the button in the Home tab to test interactions

## Project Structure

```
slack-app/
├── app.js              # Main application file
├── package.json        # Dependencies and scripts
├── .env.example        # Environment variables template
└── README.md          # This file
```