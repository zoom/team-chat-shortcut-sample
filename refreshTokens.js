const axios = require('axios');
const fs = require('fs');
const path = require('path');

async function refreshTokens() {
  const tokensFilePath = path.join(__dirname, 'tokens.txt');
  const tokensData = fs.readFileSync(tokensFilePath, 'utf8');
  const refreshToken = tokensData.split('\n')[1].split(':')[1].trim();

  try {
    const { zoom_client_id, zoom_client_secret } = process.env;
    const encodedCredentials = Buffer.from(`${zoom_client_id}:${zoom_client_secret}`).toString('base64');

    const refreshResponse = await axios.post(
      'https://zoom.us/oauth/token',
      null,
      {
        params: {
          grant_type: 'refresh_token',
          refresh_token: refreshToken
        },
        headers: {
          Authorization: `Basic ${encodedCredentials}`
        }
      }
    );

    const { access_token: newAccessToken, refresh_token: newRefreshToken } = refreshResponse.data;

    fs.writeFileSync(tokensFilePath, `access_token: ${newAccessToken}\nrefresh_token: ${newRefreshToken}`);

    return newAccessToken;
  } catch (error) {
    throw new Error('Error refreshing access token');
  }
}
exports.refreshTokens = refreshTokens;