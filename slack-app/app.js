const { App } = require('@slack/bolt');
require('dotenv').config();

// Initialize your app with your bot token and signing secret
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN,
  // Socket Mode doesn't listen on a port, but in case you want HTTP mode:
  port: process.env.PORT || 3000
});

// Listens to incoming messages that contain "hello"
app.message('hello', async ({ message, say }) => {
  // say() sends a message to the channel where the event was triggered
  console.log('Received message:', message);
  console.log('Message channel type:', message.channel_type);
  await say(`Hey there <@${message.user}>!`);
});

// Method 1: Using app_mention event (Recommended)
app.event('app_mention', async ({ event, say }) => {
  console.log('Bot mentioned:', event.text);
  console.log('In channel:', event.channel);
  console.log('By user:', event.user);

  await say(`Hello <@${event.user}>! You mentioned me in a channel. 👋`);
});

// Method 2: Using message listener with mention detection
app.message(async ({ message, say }) => {
  // Check if message contains a mention of the bot
  if (message.text && message.text.includes(`<@${process.env.BOT_USER_ID}>`)) {
    console.log('Bot mentioned in message:', message.text);
    await say(`I see you mentioned me! Message: "${message.text}"`);
  }

  // Only log DMs to avoid spam
  if (message.channel_type === 'im') {
    console.log('DM received:', message.text);
    console.log('From user:', message.user);
  }
});

// Method 3: Using regex to detect different mention patterns
app.message(/hey bot|hello bot|hi bot/i, async ({ message, say }) => {
  console.log('Bot called with pattern:', message.text);
  await say(`Hi there <@${message.user}>! You called me with: "${message.text}"`);
});

// Method 4: Custom mention handling with keywords
app.message(async ({ message, say }) => {
  if (!message.text) return;

  const text = message.text.toLowerCase();
  const botKeywords = ['coopsbotai', 'bot', 'assistant', 'help'];

  // Check if any bot keywords are mentioned
  const mentionedKeyword = botKeywords.find(keyword => text.includes(keyword));

  if (mentionedKeyword) {
    console.log(`Bot referenced with keyword: ${mentionedKeyword}`);
    await say(`I heard you mention "${mentionedKeyword}"! How can I help? 🤖`);
  }
});

// Method 5: Advanced mention handling with thread replies
app.event('app_mention', async ({ event, say, client }) => {
  const text = event.text.toLowerCase();

  // Reply in thread if the mention was in a thread
  const replyOptions = event.thread_ts ? { thread_ts: event.thread_ts } : {};

  if (text.includes('help')) {
    await say({
      ...replyOptions,
      text: `Here's how I can help:
• Say "hello" and I'll greet you
• Use /echo <text> to echo back text
• Use /coopsbotai <text> for testing
• Visit my Home tab for more options!`
    });
  } else if (text.includes('joke')) {
    await say({
      ...replyOptions,
      text: `Why don't scientists trust atoms? Because they make up everything! 😄`
    });
  } else if (text.includes('status')) {
    await say({
      ...replyOptions,
      text: `I'm running perfectly! ⚡ Ready to assist you.`
    });
  } else {
    await say({
      ...replyOptions,
      text: `You mentioned me! Try saying "help", "joke", or "status" for specific responses.`
    });
  }
});

// Method 6: Detect indirect mentions (without @)
app.message(/.*(?:coops|bot|ai|assistant).*/i, async ({ message, say }) => {
  // Avoid responding to the bot's own messages
  if (message.user === process.env.BOT_USER_ID) return;

  console.log('Indirect mention detected:', message.text);
  await say(`I think you might be talking about me! Did you need something? 🤖`);
});

// Listen for a slash command invocation
app.command('/echo', async ({ command, ack, respond }) => {
  // Acknowledge the command request
  console.log(command);
  await ack();

  await respond(`${command.text}`);
});

app.command('/coopsbotai', async ({ command, ack, respond }) => {
  await ack();
  console.log(command);
  await respond(`${command.text}`);
});

// Listen for a button interaction
app.action('button_click', async ({ body, ack, say }) => {
  // Acknowledge the action
  await ack();
  await say(`<@${body.user.id}> clicked the button`);
});

// Handle the app home opened event
app.event('app_home_opened', async ({ event, client, logger }) => {
  try {
    // Call views.publish with the built-in client
    const result = await client.views.publish({
      // Use the user ID associated with the event
      user_id: event.user,
      view: {
        type: 'home',
        callback_id: 'home_view',

        // body of the view
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: '*Welcome to your _App\'s Home_* :tada:'
            }
          },
          {
            type: 'divider'
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: 'This button won\'t do much for now but you can set up a listener for it using the `button_click` action ID and `block_id` property.'
            },
            accessory: {
              type: 'button',
              action_id: 'button_click',
              text: {
                type: 'plain_text',
                text: 'Click me!'
              }
            }
          }
        ]
      }
    });

    logger.info(result);
  }
  catch (error) {
    logger.error(error);
  }
});

// Error handling
app.error((error) => {
  console.error(error);
});

(async () => {
  // Start your app
  await app.start();

  console.log('⚡️ Bolt slackapp is running!');
})();