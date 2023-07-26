document.addEventListener('DOMContentLoaded', () => {
  const fromDate = document.getElementById('fromDate');
  const toDate = document.getElementById('toDate');
  const getRecordingsButton = document.getElementById('getRecordings');
  const meetingIds = document.getElementById('meetingIds');
  const sendPreviewCardButton = document.getElementById('sendPreviewCard');

  fromDate.addEventListener('change', updateGetRecordingsButton);
  toDate.addEventListener('change', updateGetRecordingsButton);

  function updateGetRecordingsButton() {
    getRecordingsButton.disabled = !(fromDate.value && toDate.value);
  }

  let meetingsData = {};
  getRecordingsButton.addEventListener('click', async () => {
    const response = await fetch(`/meetingIds?from=${fromDate.value}&to=${toDate.value}`);
    meetingsData = await response.json();
    populateMeetingIdsDropdown(meetingsData);
  });

  function populateMeetingIdsDropdown(meetings) {
    meetingIds.innerHTML = '';
    for (const id in meetings) {
      const option = document.createElement('option');
      option.text = meetings[id].id;
      option.value = meetings[id].id;
      meetingIds.appendChild(option);
    }
    meetingIds.disabled = false;
  }

  meetingIds.addEventListener('change', () => {
    sendPreviewCardButton.disabled = !meetingIds.value;
  });

  sendPreviewCardButton.addEventListener('click', async () => {
    const selectedMeetingId = meetingIds.value;
    const meeting = meetingsData[selectedMeetingId];

    const capabilities = [
      'appendCardToCompose',
      'getSupportedJsApis',
      'getRunningContext',
      'openUrl',
      'composeCard',
      'getChatContext',
      'getAppContext'
    ];

    try {
      await zoomSdk.config({ size: { width: 480, height: 360 }, capabilities });

      const content = {
        "content": {
          "head": { "type": "message", "text": `Meeting ID: ${meeting.id}` },
          "body": [{
            "type": "message",
            "text": "Share Recording URL " + meeting.share_url
          }]
        }
      };

      const message = JSON.stringify(content);
        // Call the /sign endpoint to get the signature and timestamp
  const res = await fetch('/sign', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ message })
  });
  const { signature, timestamp } = await res.json();

  const card = {
    "type": "interactiveCard",
    "previewCard": JSON.stringify({ "title": `Meeting ID: ${meeting.id}`, "description": `Share URL: ${meeting.share_url}` }),
    "message": message,
    "signature": signature,
    "timestamp": timestamp
  };

      await zoomSdk.composeCard(card);
      window.close();
    } catch (e) {
      console.log("Error when creating preview card ", e);
    }
  });
});