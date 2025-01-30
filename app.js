const express = require("express");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 4000;
const server = app.listen(PORT, () => console.log(`💬 server on port ${PORT}`));

const io = require("socket.io")(server);

app.use(express.static(path.join(__dirname, "public")));

let socketsConnected = new Set();

io.on("connection", onConnected);

function onConnected(socket) {
  console.log("Socket connected", socket.id);

  // When the user provides their username, associate it with the socket
  socket.on("set-username", (username) => {
    console.log(`User ${username} connected with Socket ID: ${socket.id}`);
    socket.username = username; // Store the username on the socket object
    socketsConnected.add(socket.id);

    // Emit the total clients count to all clients
    io.emit("clients-total", socketsConnected.size);
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log(`Socket disconnected: ${socket.id}, User: ${socket.username}`);
    socketsConnected.delete(socket.id);
    io.emit("clients-total", socketsConnected.size);
  });

  // Handle messages
  socket.on("message", (data) => {
    socket.broadcast.emit("chat-message", data);
  });

  // Handle feedback
  socket.on("feedback", (data) => {
    socket.broadcast.emit("feedback", data);
  });
}
