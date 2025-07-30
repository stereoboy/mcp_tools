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

// Listen to ALL direct messages for debugging
app.message(async ({ message, say }) => {
  // Only log DMs to avoid spam
  if (message.channel_type === 'im') {
    console.log('DM received:', message.text);
    console.log('From user:', message.user);
  }
  console.log(message);
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