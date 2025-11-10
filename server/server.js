// server.js - Main server file for Socket.io chat application

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Store connected users, messages and rooms
const users = {}; // socketId -> { username, id }
const messages = []; // global list of messages (includes room property)
const typingUsers = {}; // socketId -> username
const rooms = {}; // roomName -> Set of socketIds
const unreadCounts = {}; // socketId -> { roomName: count }

// Socket.io connection handler
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Handle user joining
  socket.on('user_join', (username) => {
    users[socket.id] = { username, id: socket.id };
    // initialize unreadCounts for this user
    unreadCounts[socket.id] = unreadCounts[socket.id] || {};

    io.emit('user_list', Object.values(users));
    io.emit('user_joined', { username, id: socket.id });
    console.log(`${username} joined the chat`);
  });

  // Handle chat messages (supports rooms)
  socket.on('send_message', (messageData) => {
    console.log(`send_message received from ${socket.id}:`, { room: messageData.room, msg: messageData.message?.slice?.(0,100) });
    const room = messageData.room || 'general';
    const message = {
      ...messageData,
      room,
      id: Date.now(),
      sender: users[socket.id]?.username || 'Anonymous',
      senderId: socket.id,
      timestamp: new Date().toISOString(),
      reactions: {},
      readBy: [],
    };

    messages.push(message);

    // Keep history to a reasonable limit
    if (messages.length > 5000) messages.shift();

    // Emit to room
    io.to(room).emit('receive_message', message);
  console.log(`Emitted receive_message to room ${room} for message id ${message.id}`);

    // Update unread counts for members in the room (except sender)
    const members = rooms[room] || new Set();
    members.forEach((sid) => {
      if (sid !== socket.id) {
        unreadCounts[sid] = unreadCounts[sid] || {};
        unreadCounts[sid][room] = (unreadCounts[sid][room] || 0) + 1;
        // send updated unread count to the user
        io.to(sid).emit('unread_counts', unreadCounts[sid]);
      }
    });
  });

  // Handle typing indicator (scoped to room)
  socket.on('typing', ({ room, isTyping }) => {
    if (users[socket.id]) {
      const username = users[socket.id].username;

      if (isTyping) {
        typingUsers[socket.id] = username;
      } else {
        delete typingUsers[socket.id];
      }

      // broadcast typing users for the room
      io.to(room || 'general').emit('typing_users', Object.values(typingUsers));
    }
  });

  // Join a room
  socket.on('join_room', (room) => {
    room = room || 'general';
    socket.join(room);
    rooms[room] = rooms[room] || new Set();
    rooms[room].add(socket.id);
    unreadCounts[socket.id] = unreadCounts[socket.id] || {};
    unreadCounts[socket.id][room] = 0;
    // send last messages for the room
    const last = messages.filter(m => m.room === room).slice(-100);
    socket.emit('room_messages', { room, messages: last });
    io.to(room).emit('room_users', { room, users: Array.from(rooms[room]).map(id => users[id]).filter(Boolean) });
  });

  // Handle private messages
  socket.on('private_message', ({ to, message }) => {
    const messageData = {
      id: Date.now(),
      sender: users[socket.id]?.username || 'Anonymous',
      senderId: socket.id,
      message,
      timestamp: new Date().toISOString(),
      isPrivate: true,
    };

    messages.push(messageData);
    // emit to recipient and sender
    socket.to(to).emit('private_message', messageData);
    socket.emit('private_message', messageData);
  });

  // Handle file upload via base64
  socket.on('send_file', (data) => {
    const room = data.room || 'general';
    const message = {
      id: Date.now(),
      room,
      sender: users[socket.id]?.username || 'Anonymous',
      senderId: socket.id,
      timestamp: new Date().toISOString(),
      isFile: true,
      fileData: data.fileData,
      fileName: data.fileName,
      fileType: data.fileType,
      reactions: {},
      readBy: [],
    };

    messages.push(message);
    io.to(room).emit('receive_message', message);
  });

  // React to a message
  socket.on('react_message', ({ messageId, emoji }) => {
    const msg = messages.find(m => String(m.id) === String(messageId));
    if (!msg) return;
    msg.reactions = msg.reactions || {};
    msg.reactions[emoji] = msg.reactions[emoji] || [];
    const username = users[socket.id]?.username || 'Anonymous';
    if (!msg.reactions[emoji].includes(username)) msg.reactions[emoji].push(username);
    // broadcast update
    if (msg.isPrivate) {
      // send only to sender & recipient
      io.emit('message_reacted', { messageId, reactions: msg.reactions });
    } else {
      io.to(msg.room || 'general').emit('message_reacted', { messageId, reactions: msg.reactions });
    }
  });

  // Mark message as read
  socket.on('read_message', ({ messageId }) => {
    const msg = messages.find(m => String(m.id) === String(messageId));
    if (!msg) return;
    const username = users[socket.id]?.username || 'Anonymous';
    msg.readBy = msg.readBy || [];
    if (!msg.readBy.includes(username)) msg.readBy.push(username);
    // notify others in room
    if (msg.isPrivate) {
      io.emit('message_read', { messageId, readBy: msg.readBy });
    } else {
      io.to(msg.room || 'general').emit('message_read', { messageId, readBy: msg.readBy });
    }
    // reset unread count for this user for the room
    if (msg.room && unreadCounts[socket.id]) {
      unreadCounts[socket.id][msg.room] = 0;
      io.to(socket.id).emit('unread_counts', unreadCounts[socket.id]);
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    if (users[socket.id]) {
      const { username } = users[socket.id];
      io.emit('user_left', { username, id: socket.id });
      console.log(`${username} left the chat`);
    }
    
    delete users[socket.id];
    delete typingUsers[socket.id];
    
    io.emit('user_list', Object.values(users));
    io.emit('typing_users', Object.values(typingUsers));
  });
});

// API routes
app.get('/api/messages', (req, res) => {
  // optional query params: room, before (timestamp), limit
  const { room, before, limit } = req.query;
  let list = messages.slice();
  if (room) list = list.filter(m => m.room === room);
  if (before) list = list.filter(m => new Date(m.timestamp) < new Date(before));
  const lim = Math.min(parseInt(limit || '50', 10), 200);
  // return last `lim` messages
  list = list.slice(-lim);
  res.json(list);
});

// Search messages by text
app.get('/api/search', (req, res) => {
  const q = (req.query.q || '').toLowerCase();
  const room = req.query.room;
  if (!q) return res.json([]);
  let list = messages.filter(m => (m.message || '').toLowerCase().includes(q) || (m.fileName || '').toLowerCase().includes(q));
  if (room) list = list.filter(m => m.room === room);
  res.json(list.slice(-200));
});

// Return unread counts for a socket id (not safe for production, just helper)
app.get('/api/unread/:socketId', (req, res) => {
  const id = req.params.socketId;
  res.json(unreadCounts[id] || {});
});

app.get('/api/users', (req, res) => {
  res.json(Object.values(users));
});

// Root route
app.get('/', (req, res) => {
  res.send('Socket.io Chat Server is running');
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = { app, server, io }; 