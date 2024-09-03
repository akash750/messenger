
// Define message schema and model
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: String,
  recipient: String,
  content: String,
  timestamp: { type: Date, default: Date.now },
});

const Message = mongoose.model('Message', messageSchema);