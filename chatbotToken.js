const axios = require('axios');

async function getChatbotToken() {
  try {
    const response = await axios.post('https://api.zoom.us/oauth/token', null, {
      headers: {
        'Authorization': `Basic ${Buffer.from(`${process.env.zoom_client_id}:${process.env.zoom_client_secret}`).toString('base64')}`
      },
      params: {
        grant_type: 'client_credentials'
      }
    });

    if (response.status !== 200) {
      throw new Error('Error getting chatbot_token from Zoom');
    }

    return response.data.access_token;
  } catch (error) {
    throw new Error('Error getting chatbot_token from Zoom');
  }
}

module.exports = {
  getChatbotToken
};