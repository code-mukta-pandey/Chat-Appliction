const socket = io();

const clientsTotal = document.getElementById("client-total");
const messageContainer = document.getElementById("message-container");
const nameInput = document.getElementById("name-input");
const messageForm = document.getElementById("message-form");
const messageInput = document.getElementById("message-input");
const themeToggle = document.getElementById("theme-toggle");

const messageTone = new Audio("/message-tone.mp3");

// Send the username to the server once it's typed in and focused out
nameInput.addEventListener("blur", () => {
  const username = nameInput.value;
  if (username) {
    socket.emit("set-username", username); // Send the username to the server
  }
});

messageForm.addEventListener("submit", (e) => {
  e.preventDefault();
  sendMessage();
});

socket.on("clients-total", (data) => {
  clientsTotal.innerText = `Total Clients: ${data}`;
});

function sendMessage() {
  if (messageInput.value === "") return;

  const data = {
    name: nameInput.value,
    message: messageInput.value,
    dateTime: new Date(),
  };

  socket.emit("message", data);
  addMessageToUI(true, data);
  messageInput.value = "";
}

socket.on("chat-message", (data) => {
  messageTone.play();
  addMessageToUI(false, data);
});

function addMessageToUI(isOwnMessage, data) {
  clearFeedback();
  const element = `
    <li class="${isOwnMessage ? "message-right" : "message-left"}">
        <p class="message">
          ${data.message}
          <span>${data.name} ● ${moment(data.dateTime).fromNow()}</span>
        </p>
      </li>
    `;
  messageContainer.innerHTML += element;
  scrollToBottom();
}

function scrollToBottom() {
  messageContainer.scrollTo(0, messageContainer.scrollHeight);
}

messageInput.addEventListener("focus", () => {
  socket.emit("feedback", {
    feedback: `✍️ ${nameInput.value} is typing a message`,
  });
});

messageInput.addEventListener("keypress", () => {
  socket.emit("feedback", {
    feedback: `✍️ ${nameInput.value} is typing a message`,
  });
});

messageInput.addEventListener("blur", () => {
  socket.emit("feedback", {
    feedback: "",
  });
});

socket.on("feedback", (data) => {
  clearFeedback();
  const element = `
        <li class="message-feedback">
          <p class="feedback" id="feedback">${data.feedback}</p>
        </li>
    `;
  messageContainer.innerHTML += element;
});

function clearFeedback() {
  document.querySelectorAll("li.message-feedback").forEach((element) => {
    element.parentNode.removeChild(element);
  });
}

// Dark Mode Toggle
themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
  document.querySelector(".chat-container").classList.toggle("dark-mode");
  document.querySelector(".message-container").classList.toggle("dark-mode");
  document
    .querySelectorAll(".message-left")
    .forEach((msg) => msg.classList.toggle("dark-mode"));
  document
    .querySelectorAll(".message-right")
    .forEach((msg) => msg.classList.toggle("dark-mode"));
  themeToggle.classList.toggle("dark-mode");

  // Change icon based on theme
  const icon = document.querySelector(".theme-toggle i");
  icon.classList.toggle("fa-sun");
  icon.classList.toggle("fa-moon");
});
