//Main File. 
require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const helmet = require('helmet')
const { log, error } = require('console')
const app = express()
const axios = require('axios');
const port = process.env.PORT || 4000
const { getChatbotToken } = require('./chatbotToken');
const { zoomOAuth } = require("./zoomOAuth");
const { getRecordings } = require("./getRecordings");
const { generateChatBody, sendChat } = require("./generateChatBody");
const e = require('express');
const { getAppContext } = require("./getAppContext");
const { title } = require('process')
const crypto = require('crypto');


/*  Middleware */
const headers = {
  frameguard: {
    action: 'sameorigin',
  },
  hsts: {
    maxAge: 31536000,
  },
  referrerPolicy: 'same-origin',
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      'default-src': 'self',
      styleSrc: ["'self'"],
      imgSrc: ["'self'", `*`],
      'connect-src': 'self',
      'base-uri': 'self',
      'form-action': 'self',
    },
  },
};

var appContextCache = {}
var accountId = "";
exports.accountId = accountId;

app.use(helmet(headers));

app.use(bodyParser.json())

app.get('/', (req, res) => {
  res.send('Welcome to this demo bot')
})

app.get('/authorize', zoomOAuth);

app.post('/sign', (req, res) => {
  const { message } = req.body;
  const timestamp = Date.now().toString();
  const dataToSign = `v0:${timestamp}:${message}`;
  const signature = crypto.createHmac('sha256', process.env.zoom_client_secret)
    .update(dataToSign)
    .digest('hex');
  
  res.json({ signature, timestamp });
});

const WEBVIEW_HTML_PATH = __dirname + '/webview.html';
const SEND_PREVIEW_HTML_PATH = __dirname + '/SendPreview.html';

const routeHandlers = {
  'SendMessagePreview': (req, res) => {
    res.sendFile(SEND_PREVIEW_HTML_PATH);
  },
  'findrecordings': (req, res) => {
    res.sendFile(WEBVIEW_HTML_PATH);
  }
};

app.get('/webview.html', (req, res) => {
  const appContext = getAppContext(req.get('x-zoom-app-context'), process.env.zoom_client_secret);
  appContextCache = appContext;
  console.log("app context - ", appContext);
  const { sid } = appContext;
  console.log('SID ', sid);
  req.app.locals.sid = sid;

  const nonce = crypto.randomBytes(16).toString('hex');

  res.set({
    "Content-Security-Policy": `default-src 'self' * 'nonce-${nonce}'`,
    "X-Frame-Options": "SAMEORIGIN",
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "origin"
  });


  const routeHandler = routeHandlers[appContext.actid];
  if (routeHandler) {
    routeHandler(req, res);
  } else {
    res.sendStatus(404);
  }
});

app.get('/meetingIds', async (req, res) => {
  const { from, to } = req.query;
  console.log("from = ", from, " , to = ", to);
  // Validate the date format
  const dateFormat = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateFormat.test(from) || !dateFormat.test(to)) {
    return res.status(400).json({ error: 'Invalid date format. Please provide dates in yyyy-mm-dd format.' });
  }

  var recordings = await getRecordings(from, to);

  console.log("recordings", recordings)

  const meetingsData = {};

  for(let meeting of recordings.meetings) {
    meetingsData[meeting.id] = meeting;
  }


  res.json(meetingsData);
});

app.get('/recordings.js', (req, res) => {
  res.sendFile(__dirname + '/recordings.js');
})

app.get('/sdk.js', (req, res) => {
  res.sendFile(__dirname + '/sdk.js');
})

app.get('/card.js', (req, res) => {
  res.sendFile(__dirname + '/card.js');
})

app.get('/crypto-js.js', (req, res) => {
  res.sendFile(__dirname + '/crypto-js.js');
})
  ;

app.post('/chat', async (req, res) => {
    const chatbotToken = await getChatbotToken();
    
    // Extract id and share_url from the request body
    const { id, share_url } = req.body;
  
    const reqBody = {
      robot_jid: process.env.zoom_bot_jid,
      to_jid: `${appContextCache.uid}@xmpp.zoom.us/${appContextCache.sid}`,
      account_id: accountId,
      user_jid: `${appContextCache.uid}@xmpp.zoom.us`,
      is_markdown_support: true,
      content: {
        settings: {
          default_sidebar_color: "#357B2A"
        },
        body: [
          {
            type: 'message',
            text: "Meeting ID: " + id
          },
          {
            type: 'message',
            text: 'Recording URL: '+ share_url
          }
        ]
      }
    };
  
    try {
      const response = await axios({
        method: 'POST',
        url: 'https://api.zoom.us/v2/im/chat/messages',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${chatbotToken}`
        },
        data: reqBody
      });
  console.log(reqBody)
      console.log("response for zoom api call", response.data);
      res.status(200).send(response.data);
    } catch (error) {
      console.log('Error sending chat.', error);
      res.status(500).send(error.message);
    }
  });
  
app.post('/:command', async (req, res) => {
  const command = req.body.payload.cmd; // Extract the command from the route parameter
  if(!command) {
    res.status(200).send();
   return;
  }

  const [from, to] = command.split(',').map(date => date.trim()); // Extract from and to dates from the command
  
  if (req.headers.authorization === process.env.zoom_verification_token) {
    try {
      const chatbotToken = await getChatbotToken();
      const recordings = await getRecordings(from, to);
      const chatBody = generateChatBody(recordings, req.body.payload);
      await sendChat(chatBody, chatbotToken);
      res.status(200).send();
    } catch (error) {
      console.log('Error occurred:', error);
      res.status(500).send(`/${command} api -- Internal Server Error`);
    }
  } else {
    res.status(401).send(`/${command} api -- Unauthorized request to Zoom Chatbot.`);
  }
});


app.listen(port, () => console.log(`The recordings bot is listnening on ${port}!`))