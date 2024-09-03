import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';

const Messenger = ({ sender, recipient }) => {
  // Initialize socket connection once
  const [socket] = useState(() => io('http://localhost:3000'));
  const [connectionStatus, setConnectionStatus] = useState('Connecting...');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    // Check connection status
    socket.on('connect', () => {
      setConnectionStatus('Connected');
      console.log('Connected to the server');
    });

    socket.on('disconnect', () => {
      setConnectionStatus('Disconnected');
      console.log('Disconnected from the server');
    });

    socket.on('connect_error', (error) => {
      setConnectionStatus('Connection Error');
      console.error('Connection error:', error);
    });

    // Listen for incoming messages
    socket.on('receiveMessage', (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    // Clean up the socket connection when the component unmounts
    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('connect_error');
      socket.off('receiveMessage');
    };
  }, [socket]);

  const sendMessage = () => {
    if (message.trim()) {
      const newMessage = { sender, recipient, content: message.trim(), timestamp: new Date() };
      socket.emit('sendMessage', newMessage);
      setMessages((prevMessages) => [...prevMessages, newMessage]);
      setMessage('');
    }
  };

  return (
    <div>
      <p>Status: {connectionStatus}</p>
      <div className="messages">
        {messages.map((msg, index) => (
          <div key={index} className={msg.sender === sender ? 'sent' : 'received'}>
            <p>{msg.content}</p>
            {/* Uncomment the line below if you want to show the timestamp */}
            {/* <small>{new Date(msg.timestamp).toLocaleString()}</small> */}
          </div>
        ))}
      </div>
      <input 
        type="text" 
        value={message} 
        onChange={(e) => setMessage(e.target.value)} 
        placeholder="Type a message" 
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
};

export default Messenger;
