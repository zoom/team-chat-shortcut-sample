// This logic does OAuth when you first authorize the bot, all the subsequent token requests will be handled by refreshTokens.js
const axios = require('axios');
const fs = require('fs');
const path = require('path');

async function zoomOAuth(req, res) {

  try {
    const { zoom_client_id, zoom_client_secret, zoom_bot_jid, redirect_uri } = process.env;
    const credentials = `${zoom_client_id}:${zoom_client_secret}`;
    const encodedCredentials = Buffer.from(credentials).toString('base64');

    const response = await axios.post(
      `https://zoom.us/oauth/token`,
      null,
      {
        params: {
          grant_type: 'authorization_code',
          code: req.query.code,
          redirect_uri: redirect_uri
        },
        headers: {
          Authorization: `Basic ${encodedCredentials}`
        }
      }
    );

    const { data } = response;
    const accessToken = data.access_token;
    const refreshToken = data.refresh_token;

    // Save tokens to a text file
    const tokensFilePath = path.join(__dirname, 'tokens.txt');
    const tokensData = `access_token: ${accessToken}\nrefresh_token: ${refreshToken}`;
    fs.writeFileSync(tokensFilePath, tokensData);

    console.log('Access Token:', accessToken);

    res.redirect(`https://zoom.us/launch/chat?jid=robot_${zoom_bot_jid}`);
  } catch (error) {
    console.log('Error getting access token', error);
    res.status(500).send('Error getting access token');
  }
}
exports.zoomOAuth = zoomOAuth;
