// This function generates the chatbody for your bot. This function is used when you type you / command
const axios = require('axios');
const { accountId } = require(".");

function generateChatBody(recordings, payload) {


  const chatBody = {
    robot_jid: process.env.zoom_bot_jid,
    to_jid: payload.toJid,
    user_jid: payload.userJid,
    account_id: accountId,
    visible_to_user: true,
    content: {
      head: {
        text: 'Your recordings:',
        sub_head: {
          text: 'Sent by ' + payload.userName
        }
      },
      body: recordings.meetings.flatMap(meeting => ([
        {
          type: 'message',
          text: 'Meeting ID: ' + meeting.id
        },
        {
          type: 'message',
          text: 'Meeting UUID: ' + meeting.uuid
        },
        {
          type: 'message',
          text: 'Start Time: ' + meeting.start_time
        },
        {
          type: 'message',
          text: meeting.topic,
          link: meeting.share_url
        }
      ]))
    }
  };

  return chatBody;
}
exports.generateChatBody = generateChatBody;

async function sendChat(chatBody, chatbotToken) {
  const response = await axios({
    url: 'https://api.zoom.us/v2/im/chat/messages',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${chatbotToken}`
    },
    data: chatBody
  });

  console.log('send chat response status', response.status);
  if (response.status >= 400) {
    throw new Error('Error sending chat');
  }
}
exports.sendChat = sendChat;
