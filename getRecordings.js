//Here is the logic to make API calls from our bot
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { refreshTokens } = require("./refreshTokens");


async function getRecordings(from, to) {
  const tokensFilePath = path.join(__dirname, 'tokens.txt');
  const tokensData = fs.readFileSync(tokensFilePath, 'utf8');
  let accessToken = tokensData.split('\n')[0].split(':')[1].trim(); // Extract the access token from the file

  try {
    const response = await makeApiRequest(accessToken, from, to);

    if (response.status !== 200 || response.data.errors) {
      throw new Error('Error getting recordings from Zoom');
    }

    return response.data;
  } catch (error) {
    if (isAccessTokenInvalidOrExpired(error)) {
      console.log('Access token is invalid or expired. Refreshing access token...');

      try {
        accessToken = await refreshTokens();
        const retryResponse = await makeApiRequest(accessToken);

        if (retryResponse.status !== 200 || retryResponse.data.errors) {
          throw new Error('Error getting recordings from Zoom after refreshing the access token');
        }

        return retryResponse.data;
      } catch (refreshError) {
        console.log('Error refreshing access token', refreshError);
        throw new Error('Error refreshing access token');
      }
    }

    throw error;
  }
}
exports.getRecordings = getRecordings;

async function makeApiRequest(accessToken, from, to) {
  const url = `https://api.zoom.us/v2/users/me/recordings?from=${from}&to=${to}`;

  return await axios.get(url, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });
}
function isAccessTokenInvalidOrExpired(error) {
  return error.response &&
    error.response.status === 401 &&
    error.response.data &&
    error.response.data.code === 124;
}
