# Slack App

A Node.js Slack app built with Bolt framework and JavaScript.

## Features

- Message listening (responds to "hello")
- Slash commands (`/echo`, `/coopsbotai`)
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

5. **Configure Event Subscriptions (CRITICAL):**
   - Go to "Event Subscriptions"
   - **Enable Events**: Toggle ON
   - Under "Subscribe to bot events", add these events:
     - `message.im` - **Required for direct messages**
     - `message.channels` - Required for channel messages
     - `app_home_opened` - Required for home tab functionality
     - `app_mention` - Optional, for @mentions

6. **Add Slash Commands:**
   - Go to "Slash Commands"
   - Create `/echo` command with description "Echo back the text"
   - Create `/coopsbotai` command with description "Test coopsbotai command"

## Event Subscriptions Configuration

Event Subscriptions are **critical** for your bot to receive messages. This is the most common source of setup issues.

### Required Event Subscriptions

1. **Navigate to Event Subscriptions:**
   - Go to https://api.slack.com/apps → Select your app
   - Click **"Event Subscriptions"** in the left sidebar

2. **Enable Events:**
   - Toggle **"Enable Events"** to **ON**

3. **Subscribe to Bot Events:**
   Add these events under "Subscribe to bot events":

   | Event | Purpose | Required For |
   |-------|---------|--------------|
   | `message.im` | **Direct Messages** | ✅ **Critical for DMs** |
   | `message.channels` | Channel Messages | ✅ **Channel functionality** |
   | `app_home_opened` | Home Tab | ✅ **App Home display** |
   | `app_mention` | @mentions | ⚠️ Optional |

### Why Each Event is Needed

**`message.im` (Direct Messages):**
- **Most Important**: Without this, your bot won't receive any direct messages
- Common error: "Sending messages to this app has been turned off"
- Required for: DM responses, private conversations

**`message.channels` (Channel Messages):**
- Required for: Bot responses in channels where it's invited
- Needed for: Public channel interactions, team conversations

**`app_home_opened` (Home Tab):**
- Required for: Custom app home experience
- Needed for: Welcome messages, app-specific interface

### Troubleshooting Event Subscriptions

**Problem: Bot doesn't receive any messages**
```
Solution:
1. Check if "Enable Events" is ON
2. Verify message.im and message.channels are added
3. Reinstall app after adding events
4. Restart your bot application
```

**Problem: DMs work but channel messages don't**
```
Solution:
1. Add message.channels event
2. Invite bot to channel: /invite @your-bot-name
3. Ensure bot has channels:history scope
```

**Problem: App Home doesn't load**
```
Solution:
1. Add app_home_opened event
2. Enable Messages Tab in App Home settings
3. Reinstall the app
```

### Event Subscription Best Practices

1. **Always restart your bot** after changing event subscriptions
2. **Reinstall the app** to workspace after adding new events
3. **Test each event type** separately (DM, channel, home)
4. **Check console logs** for event debugging information

### Verification Steps

After configuring events:

1. **Check Events are Listed:**
   - Go to Event Subscriptions
   - Verify all required events appear under "Subscribe to bot events"

2. **Test Event Reception:**
   - Start your bot: `npm run dev`
   - Send a DM: Should see console logs
   - Send channel message: Should see logs
   - Visit App Home: Should load properly

3. **Debug Event Issues:**
   ```javascript
   // Add this to your app.js for debugging
   app.message(async ({ message }) => {
     console.log('Event received:', {
       type: message.channel_type,
       text: message.text,
       user: message.user
     });
   });
   ```

## Running the App

```bash
# Development mode with auto-restart
npm run dev

# Production mode
npm start
```

## Testing Your Slack Bot

### Prerequisites
1. Complete all setup steps above
2. Install the app to your workspace (OAuth & Permissions → "Install to Workspace")
3. Create and configure your `.env` file with actual credentials
4. Start the bot with `npm run dev`

### Step-by-Step Testing Guide

#### 1. Verify Bot is Running
```bash
npm run dev
```
You should see: `⚡️ Bolt slackapp is running!`

#### 2. Test Message Listening
**In any channel where your bot is invited:**
- Type: `hello`
- **Expected Response**: `Hey there @yourname!`

**In direct messages:**
- Send a DM to your bot: `hello`
- **Expected Response**: `Hey there @yourname!`

#### 3. Test Slash Commands

**Test `/echo` command:**
- Type: `/echo Hello World!`
- **Expected Response**: `Hello World!`

**Test `/coopsbotai` command:**
- Type: `/coopsbotai testing 123`
- **Expected Response**: `testing 123`
- Check console output for command details

#### 4. Test Interactive Components

**Test App Home Tab:**
1. Click on your bot name in the sidebar or search for it
2. Go to the "Home" tab
3. **Expected**: Welcome message with "Click me!" button
4. Click the button
5. **Expected Response**: `@yourname clicked the button`

#### 5. Test Bot Mentions
- In a channel: `@coopsbotai hello`
- **Expected**: Bot should respond if mention handling is implemented

### Troubleshooting

#### 🚨 **"Sending messages to this app has been turned off" Error**

This is the most common setup issue. Follow these steps to fix it:

**Step 1: Enable Messages Tab**
1. Go to https://api.slack.com/apps → Select your app
2. Navigate to **"App Home"** in the left sidebar
3. Scroll down to **"Show Tabs"** section
4. **Enable** the **"Messages Tab"** (toggle ON)
5. **Check** ✅ **"Allow users to send Slash commands and messages from the messages tab"**

**Step 2: Add Required OAuth Scopes**
1. Go to **"OAuth & Permissions"**
2. Under "Bot Token Scopes", ensure you have:
   - `app_mentions:read` - Read mentions
   - `channels:history` - Read channel messages
   - `chat:write` - Send messages
   - `commands` - Use slash commands
   - `im:history` - Read direct messages
   - `im:write` - **Send direct messages (CRITICAL)**

**Step 3: Reinstall the App**
1. After adding scopes, click **"Reinstall to Workspace"**
2. Review and approve all permissions
3. Copy the new **Bot User OAuth Token**

**Step 4: Update Environment Variables**
```bash
# Update .env with NEW tokens after reinstallation
SLACK_BOT_TOKEN=xoxb-your-NEW-bot-token-here
SLACK_SIGNING_SECRET=your-signing-secret-here
SLACK_APP_TOKEN=xapp-your-app-token-here
PORT=3000
```

**Step 5: Verify Event Subscriptions**
1. Go to **"Event Subscriptions"**
2. Enable Events: **ON** (toggle switch)
3. Under "Subscribe to bot events", add:
   - `message.im` - **Critical for direct messages**
   - `message.channels` - Required for channel messages
   - `app_home_opened` - Required for home tab
4. **Save Changes** at the bottom of the page

**Step 6: Test the Fix**
1. Restart your bot: `npm run dev`
2. Send a DM to your bot: `hello`
3. Should respond without the "turned off" message

#### 🔧 **Other Common Issues**

**Bot not responding to messages:**
- Ensure bot is invited to the channel: `/invite @your-bot-name`
- Check if bot has necessary permissions (`channels:history`, `chat:write`)
- Verify Socket Mode is enabled
- Make sure app is installed to your workspace

**Slash commands not working:**
- Make sure commands are created in Slack App settings
- Verify `commands` scope is added to bot permissions
- Check if app is installed to workspace
- Ensure bot has been invited to the channel where you're testing

**Permission errors:**
- Review Bot Token Scopes in OAuth & Permissions
- Reinstall app to workspace after adding new scopes
- Ensure environment variables are correctly set
- Check workspace app restrictions (ask admin if needed)

**Socket connection issues:**
- Verify `SLACK_APP_TOKEN` is correct and starts with `xapp-`
- Check that Socket Mode is enabled in app settings
- Ensure `connections:write` scope is added to App Token
- Restart the bot after token changes

**Bot appears offline or not responding:**
- Check console for error messages
- Verify all environment variables are set correctly
- Ensure `.env` file is in the correct directory
- Try creating a new app if issues persist

### Quick Test Checklist

**✅ Setup Verification:**
- [ ] App installed to workspace
- [ ] Messages Tab enabled in App Home
- [ ] All required OAuth scopes added (`im:history`, `im:write`, `chat:write`, `channels:history`, `commands`)
- [ ] Socket Mode enabled with App Token
- [ ] Event Subscriptions enabled with required events (`message.im`, `message.channels`, `app_home_opened`)
- [ ] Environment variables configured (.env file with correct tokens)
- [ ] Bot running: `npm run dev`

**✅ Functionality Tests:**
- [ ] Bot responds to `hello` messages in DM
- [ ] Bot responds to `hello` messages in channels
- [ ] `/echo test` returns `test`
- [ ] `/coopsbotai test` returns `test`
- [ ] App Home tab displays properly
- [ ] Button click generates response
- [ ] Bot can be invited to channels
- [ ] Console shows command logs
- [ ] No "turned off" error messages

### Environment Variables Test
Create `.env` file with your actual values:
```bash
SLACK_BOT_TOKEN=xoxb-your-bot-token-here
SLACK_SIGNING_SECRET=your-signing-secret-here
SLACK_APP_TOKEN=xapp-your-app-token-here
PORT=3000
```

**Where to find credentials:**
- **SLACK_BOT_TOKEN**: OAuth & Permissions → "Bot User OAuth Token"
- **SLACK_SIGNING_SECRET**: Basic Information → "Signing Secret"
- **SLACK_APP_TOKEN**: Basic Information → "App-Level Tokens"

## Usage

- Send a message containing "hello" to trigger a response
- Use `/echo <text>` to echo back the text
- Use `/coopsbotai <text>` to test the coopsbotai command
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