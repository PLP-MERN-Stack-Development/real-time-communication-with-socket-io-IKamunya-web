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
  timeout: 10000,
  transports: ['websocket', 'polling']
});

// Custom hook for using socket.io
export const useSocket = () => {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [lastMessage, setLastMessage] = useState(null);
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [currentUsername, setCurrentUsername] = useState(null);

  // Debug current state
  useEffect(() => {
    console.log('DEBUG: Socket Hook State:', {
      isConnected,
      lastMessage: lastMessage?.id,
      messagesCount: messages.length,
      usersCount: users.length,
      socketId: socket?.id,
      messages: messages // Log full messages for debugging
    });
  }, [isConnected, lastMessage, messages, users]);

  // Connect to socket server
  const connect = async (username) => {
    console.log('DEBUG: Connecting socket with username:', username);
    setCurrentUsername(username || null);
    // Request notification permission for Web Notifications API
    try {
      await requestNotificationPermission();
    } catch (e) {
      // ignore
    }
    
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Connection timeout'));
      }, 5000);

      const handleConnect = () => {
        console.log('DEBUG: Socket connected successfully');
        clearTimeout(timeout);
        if (username) {
          socket.emit('user_join', username);
        }
        resolve();
      };

      const handleConnectError = (error) => {
        console.error('DEBUG: Socket connection error:', error);
        clearTimeout(timeout);
        reject(error);
      };

      socket.once('connect', handleConnect);
      socket.once('connect_error', handleConnectError);

      socket.connect();
    });
  };

  // Join a chat room
  const joinRoom = async (room) => {
    console.log('DEBUG: Attempting to join room:', room);
    
    // Wait for socket to be connected
    if (!socket.connected) {
      console.log('DEBUG: Socket not connected, waiting...');
      await new Promise(resolve => {
        const checkConnection = () => {
          if (socket.connected) {
            resolve();
          } else {
            setTimeout(checkConnection, 100);
          }
        };
        checkConnection();
      });
    }
    
    return new Promise((resolve, reject) => {
      // Set up a response handler
      const responseTimeout = setTimeout(() => {
        console.error('DEBUG: Room join response timeout for:', room);
        reject(new Error('Room join timeout'));
      }, 5000);
      
      const handleRoomJoined = (data) => {
        if (data.room === room) {
          console.log('DEBUG: Successfully joined room:', room);
          clearTimeout(responseTimeout);
          socket.off('room_joined', handleRoomJoined);
          resolve(data);
        }
      };
      
      socket.on('room_joined', handleRoomJoined);
      
      // Join the room
      socket.emit('join_room', room);
    });
  };

  // Disconnect from socket server
  const disconnect = () => {
    socket.disconnect();
  };

  // Send a message
  const sendMessage = async ({ message, room }) => {
    // Optimistic local echo: append message locally immediately so the UI
    // reflects the sent message without waiting for the server round-trip.
    // This is the simplest way to make messages appear instantly in the UI.
    try {
      const localMessage = {
        id: `local-${Date.now()}`,
        message,
        room,
        sender: 'You',
        senderId: socket.id || 'local',
        timestamp: new Date().toISOString(),
        pending: true,
      };

      // Append locally
      setMessages((prev) => [...prev, localMessage]);

      if (!socket.connected) {
        console.log('DEBUG: Socket not connected, waiting before sending message...');
        await new Promise((resolve) => {
          const checkConnection = () => {
            if (socket.connected) {
              resolve();
            } else {
              setTimeout(checkConnection, 100);
            }
          };
          checkConnection();
        });
      }

      console.log('\n\nCLIENT: Sending message:', {
        message: message?.slice?.(0, 100),
        room,
        socketConnected: socket.connected,
        socketId: socket.id,
      });

      socket.emit('send_message', { message, room });
    } catch (err) {
      console.error('Error in sendMessage optimistic flow:', err);
    }
  };

  const sendFile = ({ fileData, fileName, fileType, room }) => {
    // Optimistic local echo for files
    const localFileMessage = {
      id: `local-file-${Date.now()}`,
      message: `📎 ${fileName}`,
      fileName,
      fileData,
      fileType,
      room,
      sender: 'You',
      senderId: socket.id || 'local',
      timestamp: new Date().toISOString(),
      isFile: true,
      pending: true,
      reactions: {},
      readBy: []
    };

    // Append locally
    setMessages((prev) => [...prev, localFileMessage]);

    // Send to server
    socket.emit('send_file', { fileData, fileName, fileType, room });
  };

  const reactMessage = ({ messageId, emoji }) => {
    socket.emit('react_message', { messageId, emoji });
  };

  const markRead = ({ messageId }) => {
    socket.emit('read_message', { messageId });
  };

  // Send a private message
  const sendPrivateMessage = async (to, message) => {
    // Optimistic local echo for private messages
    const localMessage = {
      id: `local-pm-${Date.now()}`,
      message,
      isPrivate: true,
      sender: currentUsername || 'You',
      senderId: socket.id || 'local',
      recipient: null,
      recipientId: to,
      timestamp: new Date().toISOString(),
      pending: true,
      reactions: {},
      readBy: []
    };

    // Append locally
    setMessages((prev) => [...prev, localMessage]);

    // Send to server
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
      console.log('\n=== MESSAGE RECEIVED ===');
      console.log('1. Message data:', {
        messageId: message.id,
        sender: message.sender,
        room: message.room,
        content: message.message?.slice?.(0,100)
      });
      setLastMessage(message);
      
      setMessages((prev) => {
        // If server confirms a message that we previously added optimistically,
        // replace the pending local message with the authoritative server message.
        const pendingIndex = prev.findIndex(m => m.pending && m.message === message.message && m.room === message.room);
        if (pendingIndex !== -1) {
          const newArr = [...prev];
          newArr[pendingIndex] = message; // replace local pending with server message
          console.log('3. Replaced pending local message with server message:', message.id);
          return newArr;
        }

        // Otherwise avoid exact-duplicate messages by id
        if (prev.some(m => String(m.id) === String(message.id))) {
          console.log('3. Message already exists, skipping:', message.id);
          return prev;
        }

        console.log('2. Current messages state:', {
          count: prev.length,
          lastMessage: prev[prev.length - 1]?.id
        });

        const newMessages = [...prev, message];
        console.log('3. Updated messages state:', {
          previousCount: prev.length,
          newCount: newMessages.length,
          addedMessageId: message.id
        });
        return newMessages;
      });

      // sound & web notification when not focused
      // Don't notify for messages sent by current user
      if (message.sender !== currentUsername) {
        playNotification(message);
      }
      console.log('=== MESSAGE PROCESSING COMPLETE ===\n');
    };

    const onPrivateMessage = (message) => {
      setLastMessage(message);
      setMessages((prev) => [...prev, message]);
      playNotification(message);
    };

    const onRoomMessages = ({ room, messages: roomMessages }) => {
      console.log('DEBUG: Received room_messages event:', {
        room,
        messageCount: roomMessages.length,
        firstMessageId: roomMessages[0]?.id,
        lastMessageId: roomMessages[roomMessages.length - 1]?.id
      });
      // replace messages for room or append
      setMessages((prev) => {
        // remove messages for this room and append roomMessages
        const others = prev.filter(m => m.room !== room);
        const newMessages = [...others, ...roomMessages];
        console.log('DEBUG: Updated messages state:', {
          previousCount: prev.length,
          newCount: newMessages.length,
          room
        });
        return newMessages;
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
      // System messages for room joins are now handled by server
      // This listener just updates the users list
    };

    const onUserLeft = (user) => {
      // System messages for room leaves are now handled by server
      // This listener just updates the users list
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