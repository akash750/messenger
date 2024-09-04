const connectToMongo = require('./db');
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const User = require('./models/Users');
const Message = require('./models/message');

const app = express();

// CORS setup to allow frontend connection
app.use(cors({
  origin: 'http://localhost:3000', // Ensure this matches your frontend URL
  methods: ['GET', 'POST'],
}));

app.use(express.json());
connectToMongo();

// Create HTTP server for Socket.IO
const server = http.createServer(app);

// Initialize Socket.IO with the server and CORS configuration
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

// In-memory user store to keep track of connected users
const users = {};

// Listen for socket connections
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Store user information
  socket.on('register', async (username) => {
    // Save or update the user
    await User.findOneAndUpdate({ username }, { socketId: socket.id }, { upsert: true });
    users[socket.id] = username;
    socket.emit('registered', username); // Emit a confirmation event back to the client
  });

  // Handle message events
  socket.on('sendMessage', async ({ sender, recipient, content }) => {
    console.log('Message received:', { sender, recipient, content });

    // Save message to database
    const newMessage = new Message({ sender, recipient, content });
    await newMessage.save();

    // Find recipient's socketId
    const recipientUser = await User.findOne({ username: recipient });
    if (recipientUser) {
      const recipientSocketId = recipientUser.socketId;
      io.sockets.sockets[recipientSocketId].emit('receiveMessage', { sender, content, timestamp: newMessage.timestamp });
    }
  });

  // Handle disconnection
  socket.on('disconnect', async () => {
    console.log('A user disconnected:', socket.id);

    // Remove user from the in-memory store
    const username = users[socket.id];
    if (username) {
      await User.findOneAndUpdate({ username }, { socketId: null });
      delete users[socket.id];
    }
  });
});

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Backend listening at http://localhost:${PORT}`);
});
