import bot from './assets/bot.svg';
import user from './assets/user.svg';
import trainingData from './trainingData.js';

const form = document.querySelector('form');
const chatForm = document.querySelector('form');
const chatContainer = document.querySelector('#chat_container');

let loadInterval;

function loader(element) {
  element.textContent = '';

  loadInterval = setInterval(() => {
    element.textContent += '.';

    if (element.textContent === '....') {
      element.textContent = '';
    }
  }, 300);
}

function typeText(element, text) {
  let index = 0;

  let interval = setInterval(() => {
    if (index < text.length) {
      element.innerHTML += text.charAt(index);
      index++;
    } else {
      clearInterval(interval);
    }
  }, 20);
}

function generateUniqueId() {
  const timestamp = Date.now();
  const randomNumber = Math.random();
  const hexadecimalString = randomNumber.toString(16);

  return `id-${timestamp}-${hexadecimalString}`;
}

function chatStripe(isAi, value, uniqueId) {
  return (
    `
    <div class="wrapper ${isAi && 'ai'}">
      <div class="chat">
        <div class="profile">
        <img
          src="${isAi ? bot : user}"
          alt="${isAi ? 'bot' : 'user'}"
        />
        </div>
        <div class="message" id=${uniqueId}>${value}</div>
      </div>  
    </div>
    `
  );
}

const handleSubmit = async (event) => {
  event.preventDefault();
  const prompt = new FormData(chatForm).get("prompt");

  messageDiv.innerHTML += formatMessage(false, prompt);
  chatForm.reset();

  const responseId = createResponseId();
  messageDiv.innerHTML += formatMessage(true, "", responseId);
  messageDiv.scrollTop = messageDiv.scrollHeight;

  const responseDiv = document.getElementById(responseId);
  showLoadingIndicator(responseDiv);

  const matchingInput = trainingData.find(data => data.input === prompt);
  if (matchingInput) {
    showResponse(responseDiv, matchingInput.output);
  } else {
    const response = await fetch(apiEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: prompt })
    });

    if (clearInterval(loadInterval), response.ok) {
      const responseJson = await response.json();
      showResponse(responseDiv, responseJson.response.trim());
    } else {
      const errorMessage = await response.text();
      responseDiv.innerHTML = "Something went wrong";
      alert(errorMessage);
    }
  }

  clearInterval(loadInterval);
  responseDiv.innerHTML = "<span class='chat-bot'>ChatBot: </span>" + getResponse(prompt);
};

const getResponse = (prompt) => {
  const matchingInput = trainingData.find(data => data.input === prompt);
  return matchingInput ? matchingInput.output : "Error: No matching input found in training data";
}

chatForm.addEventListener("submit", handleSubmit);
chatForm.addEventListener("keyup", (event) => {
  if (event.keyCode === 13) {
    handleSubmit(event);
  }
});

