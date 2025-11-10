// socket.js - Socket.io client setup

import { io } from 'socket.io-client';
import { useEffect, useState } from 'react';

// Socket.io connection URL
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

// Create socket instance
export const socket = io(SOCKET_URL, {
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

// Custom hook for using socket.io
export const useSocket = () => {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [lastMessage, setLastMessage] = useState(null);
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [unreadCounts, setUnreadCounts] = useState({});

  // Connect to socket server
  const connect = (username) => {
    socket.connect();
    if (username) {
      socket.emit('user_join', username);
    }
  };

  // Join a chat room
  const joinRoom = (room) => {
    socket.emit('join_room', room);
  };

  // Disconnect from socket server
  const disconnect = () => {
    socket.disconnect();
  };

  // Send a message
  const sendMessage = ({ message, room }) => {
    socket.emit('send_message', { message, room });
  };

  const sendFile = ({ fileData, fileName, fileType, room }) => {
    socket.emit('send_file', { fileData, fileName, fileType, room });
  };

  const reactMessage = ({ messageId, emoji }) => {
    socket.emit('react_message', { messageId, emoji });
  };

  const markRead = ({ messageId }) => {
    socket.emit('read_message', { messageId });
  };

  // Send a private message
  const sendPrivateMessage = (to, message) => {
    socket.emit('private_message', { to, message });
  };

  // Set typing status (scoped to room)
  const setTyping = ({ room, isTyping }) => {
    socket.emit('typing', { room, isTyping });
  };

  // Notification helpers
  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission !== 'granted') {
      try {
        await Notification.requestPermission();
      } catch (e) {
        // ignore
      }
    }
  };

  const playBeep = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine';
      o.frequency.value = 440;
      o.connect(g);
      g.connect(ctx.destination);
      g.gain.setValueAtTime(0.0001, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.05, ctx.currentTime + 0.01);
      o.start();
      setTimeout(() => {
        g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.05);
        o.stop();
        ctx.close();
      }, 120);
    } catch (e) {
      // ignore audio errors
    }
  };

  const playNotification = (message) => {
    // play sound
    playBeep();
    // show browser notification if not focused
    if (document && document.hidden && 'Notification' in window && Notification.permission === 'granted') {
      const title = message.isPrivate ? `Private from ${message.sender}` : `${message.sender}`;
      const body = message.message || (message.fileName ? `Sent a file: ${message.fileName}` : 'New message');
      try {
        new Notification(title, { body });
      } catch (e) {
        // ignore
      }
    }
  };

  // Socket event listeners
  useEffect(() => {
    // Connection events
    const onConnect = () => {
      setIsConnected(true);
    };

    const onDisconnect = () => {
      setIsConnected(false);
    };

    // Message events
    const onReceiveMessage = (message) => {
      setLastMessage(message);
      setMessages((prev) => [...prev, message]);
      // sound & web notification when not focused
      playNotification(message);
    };

    const onPrivateMessage = (message) => {
      setLastMessage(message);
      setMessages((prev) => [...prev, message]);
      playNotification(message);
    };

    const onRoomMessages = ({ room, messages: roomMessages }) => {
      // replace messages for room or append
      setMessages((prev) => {
        // remove messages for this room and append roomMessages
        const others = prev.filter(m => m.room !== room);
        return [...others, ...roomMessages];
      });
    };

    // User events
    const onUserList = (userList) => {
      setUsers(userList);
    };

    const onUnread = (counts) => {
      setUnreadCounts(counts || {});
    };

    const onUserJoined = (user) => {
      // You could add a system message here
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          system: true,
          message: `${user.username} joined the chat`,
          timestamp: new Date().toISOString(),
        },
      ]);
    };

    const onUserLeft = (user) => {
      // You could add a system message here
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          system: true,
          message: `${user.username} left the chat`,
          timestamp: new Date().toISOString(),
        },
      ]);
    };

    // Typing events
    const onTypingUsers = (users) => {
      setTypingUsers(users);
    };

    const onMessageReacted = ({ messageId, reactions }) => {
      setMessages(prev => prev.map(m => m.id === messageId ? { ...m, reactions } : m));
    };

    const onMessageRead = ({ messageId, readBy }) => {
      setMessages(prev => prev.map(m => m.id === messageId ? { ...m, readBy } : m));
    };

    // Register event listeners
  socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('receive_message', onReceiveMessage);
    socket.on('private_message', onPrivateMessage);
  socket.on('room_messages', onRoomMessages);
  socket.on('unread_counts', onUnread);
    socket.on('user_list', onUserList);
    socket.on('user_joined', onUserJoined);
    socket.on('user_left', onUserLeft);
    socket.on('typing_users', onTypingUsers);
  socket.on('message_reacted', onMessageReacted);
  socket.on('message_read', onMessageRead);

    // Clean up event listeners
    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('receive_message', onReceiveMessage);
      socket.off('private_message', onPrivateMessage);
      socket.off('user_list', onUserList);
      socket.off('user_joined', onUserJoined);
      socket.off('user_left', onUserLeft);
      socket.off('typing_users', onTypingUsers);
      socket.off('room_messages', onRoomMessages);
      socket.off('unread_counts', onUnread);
      socket.off('message_reacted', onMessageReacted);
      socket.off('message_read', onMessageRead);
    };
  }, []);

  return {
    socket,
    isConnected,
    lastMessage,
    messages,
    users,
    typingUsers,
    unreadCounts,
    connect,
    disconnect,
    joinRoom,
    sendMessage,
    sendFile,
    sendPrivateMessage,
    reactMessage,
    markRead,
    setTyping,
  };
};

export default socket; 