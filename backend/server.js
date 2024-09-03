const connectToMongo = require('./db');
const express = require('express');
const cors = require('cors');
const http = require('http'); // Import HTTP to create server
const { Server } = require('socket.io'); // Import Server class from socket.io

connectToMongo();
const app = express();

// Create HTTP server for socket.io
const server = http.createServer(app);

// Initialize socket.io with the server
const io = new Server(server, {
  cors: {
    origin: '*', // Allow all origins, adjust according to your security needs
  }
});

app.use(cors());
app.use(express.json());


// Listen for socket connections
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Handle message events
  socket.on('sendMessage', (message) => {
    console.log('Message received:', message);
    // Emit the message to the recipient
    io.emit('receiveMessage', message);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('A user disconnected:', socket.id);
  });
});

// Start the server
const PORT = process.env.PORT || 5000; // Use environment PORT or default to 5000
server.listen(PORT, () => {
  console.log(`Backend listening at http://localhost:${PORT}`);
});
