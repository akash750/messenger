const connectToMongo = require('./db');
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

var cors = require('cors') 

connectToMongo();
const app = express()

app.use(cors())
app.use(express.json())

// Express app and HTTP server setup
const server = http.createServer(app);
const io = new Server(server);

// Connect to MongoDB using your predefined function
connectToMongo();

// Define message schema and model
const mongoose = require('mongoose');
const messageSchema = new mongoose.Schema({
  sender: String,
  recipient: String,
  content: String,
  timestamp: { type: Date, default: Date.now },
});

const Message = mongoose.model('Message', messageSchema);

// Handle socket.io connections
io.on('connection', (socket) => {
  console.log('A user connected');

  // Listen for incoming messages
  socket.on('sendMessage', async ({ sender, recipient, content }) => {
    const newMessage = new Message({ sender, recipient, content });

    // Save the message to the database
    await newMessage.save();

    // Emit the message to the recipient
    io.emit('receiveMessage', { sender, recipient, content, timestamp: newMessage.timestamp });
  });

  // Handle disconnects
  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

// Start the server
server.listen(3001, () => {
  console.log('Server is running on port 3001');
});



// Available Routes
// app.use('/api/gigslist', require('./routes/gigs_list'))
// app.use('/api/categorylist', require('./routes/category_list'))
// app.use('/api/gigs', require('./routes/gigs.js'))


// app.listen(process.env.PORT || 8080, () => {
//     console.log(`Backend listening at http://localhost:${process.env.PORT}`)
// })
