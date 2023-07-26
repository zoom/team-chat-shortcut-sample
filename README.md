# Disclaimer

The following sample application is a personal, open-source project shared by the app creator and not an officially supported Zoom Video Communications, Inc. sample application. Zoom Video Communications, Inc., its employees and affiliates are not responsible for the use and maintenance of this application. Please use this sample application for inspiration, exploration and experimentation at your own risk and enjoyment. You may reach out to the app creator and broader Zoom Developer community on https://devforum.zoom.us/ for technical discussion and assistance, but understand there is no service level agreement support for this application. Thank you and happy coding!”

# Node.js Zoom Recordings Team Chat App

This repository contains a Node.js application that allows you to create a Zoom Team Chat App for managing recordings. Follow the instructions below to set up and run the application.

## Prerequisites

Before running the code, make sure you have the following libraries installed:

- Node.js
- Express.js
- axios
- helmet
- crypto-js
- zoom-apps-sdk (npm install @zoom/appssdk)

## Installation

1. Clone the repository to your local machine.

```bash
git clone https://github.com/ojusave/zoom-recordings-team-chat-app
```

2. Install the required dependencies.

```bash
npm install
```

3. Create a `.env` file in the root directory of your local repository and add the following details from your Zoom Team Chat App:

```plaintext
zoom_client_id=YOUR_CLIENT_ID
zoom_client_secret=YOUR_CLIENT_SECRET
zoom_bot_jid=YOUR_BOT_JID
zoom_verification_token=YOUR_VERIFICATION_TOKEN
redirect_uri=YOUR_REDIRECT_URI
```

Replace `YOUR_CLIENT_ID`, `YOUR_CLIENT_SECRET`, `YOUR_BOT_JID`, `YOUR_VERIFICATION_TOKEN`, and `YOUR_REDIRECT_URI` with the corresponding values from your Zoom Team Chat App.

## Usage

To run the code, navigate to the `zoom-recordings-team-chat-app` directory and start the Node.js server.

```bash
cd zoom-recordings-team-chat-app
npm run start
```

Make sure the server is running successfully.

### App Configuration in the Zoom Marketplace

1. Create a Team Chat Apps using the guidelines provided [here](https://developers.zoom.us/docs/team-chat-apps/create/).

2. Enable the App Shortcuts in the Zoom Marketplace configuration.

3. Click on "Add Shortcuts" and provide an "Action Name" and "Action Command ID" for each action you want to create. This code demonstrates two actions:
   - Send Message Preview: To demonstrate the message Preview functionality from a Compose Box and Message Action.
   - Find Recordings: To demonstrate sending a message from a Compose Box and Message Action.

   Depending on what your command is, you may want to change them here:
   const routeHandlers = {
   'SendMessagePreview': (req, res) => {
    res.sendFile(SEND_PREVIEW_HTML_PATH);
   },
   'findrecordings': (req, res) => {
    res.sendFile(WEBVIEW_HTML_PATH);
    }
   }; 

4. Save the configuration.

5. Enable the "Display on Zoom Client" option and provide the "Home URL" for development and production environments. These URLs will be used to invoke the web view when you click on the message action or compose box.

6. Add your domain to the allow list along with "appssdk.zoom.us".

7. Click on "Add API" and select the following API scopes:

   - getRunningContext
   - openUrl
   - composeCard
   - getChatContext
   - getAppContext
   - composeText
   - getComposeContext

   Click "Continue".

8. In the scopes section, click on "Add Scopes" and add the following recordings scopes:

   - View all user recordings: `/recording:read:admin`
   - View and manage all user recordings: `/recording:write:admin`

9. Save the configuration.

### Running the App

1. Authorize the app by clicking on the local test or publishable URL, depending on the credentials you have selected. This will allow you to see the bot in your Zoom client.

2. To get the recordings, use the following command in a chat:

   ```plaintext
   /"your command" YYYY-MM-DD, YYYY-MM-DD (from and to dates)
   ```

3. You will also see compose box and message actions options from the app in your Zoom client.

4. Clicking on them will invoke the web view.

5. Selecting "Find Recordings"