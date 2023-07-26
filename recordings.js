// Fetch recordings based on date range
function fetchRecordings(event) {
  console.log("========fetchRecordings=========")
  event.preventDefault();

  const fromInput = document.getElementById('from');
  const toInput = document.getElementById('to');
  const from = fromInput.value;
  const to = toInput.value;

  const url = `/meetingIds?from=${from}&to=${to}`;

  fetch(url)
      .then(response => response.json())
      .then(data => {
          const dropdown = document.getElementById('dropdown');
          dropdown.innerHTML = '';
          console.log("data ===> ", data)

          for (const id in data) {
              var item = data[id];
              const option = document.createElement('option');
              // Using a JSON string as the value and the id as the display text
              option.value = JSON.stringify({id: item.id, share_url: item.share_url});
              option.text = item.id;
              dropdown.appendChild(option);
          }
          

          dropdown.disabled = false;
          document.getElementById('sendButton').disabled = false;
      })
      .catch(error => {
          console.error('Error:', error);
      });
}

// Handle the send button click event
const sendCard = async () => {
  const input = document.getElementById("dropdown");
  const value = JSON.parse(input.value); // Parsing the JSON string

  try {
    await fetch('/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: value.id, share_url: value.share_url }) // Sending both id and share_url
    });

    window.close();
  } catch (e) {
    console.log("Error when sending messages ", e);
    window.close();
  }
};
// Attach event listener to the form submission
const form = document.getElementById('dateForm');
form.addEventListener('submit', fetchRecordings);

document.addEventListener('DOMContentLoaded', function () {
  document.getElementById('sendButton').addEventListener('click', sendCard);
  });
