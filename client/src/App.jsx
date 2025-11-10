import React, { useState, useEffect } from 'react';
import { useSocket } from './socket/socket';
import Sidebar from './components/Sidebar';
import Chat from './components/Chat';

function App() {
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState('');
  const [isJoined, setIsJoined] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);
  
  const {
    isConnected,
    messages,
    users,
    typingUsers,
    connect,
    disconnect,
    sendMessage,
    setTyping
  } = useSocket();

  const handleJoin = (e) => {
    e.preventDefault();
    if (username.trim()) {
      connect(username);
      setIsJoined(true);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (message.trim()) {
      sendMessage(message);
      setMessage('');
    }
  };

  const handleTyping = (e) => {
    setMessage(e.target.value);
    
    if (!isTyping) {
      setIsTyping(true);
      setTyping(true);
    }

    // Clear existing timeout
    if (typingTimeout) clearTimeout(typingTimeout);

    // Set new timeout
    const timeout = setTimeout(() => {
      setIsTyping(false);
      setTyping(false);
    }, 2000);
    
    setTypingTimeout(timeout);
  };

  useEffect(() => {
    return () => {
      if (typingTimeout) clearTimeout(typingTimeout);
      disconnect();
    };
  }, [disconnect, typingTimeout]);

  const [currentRoom, setCurrentRoom] = useState('general');
  const [unreadCounts, setUnreadCounts] = useState({});

  const handlePrivateMessage = (userId) => {
    const targetUser = users.find(u => u.id === userId);
    if (targetUser) {
      // Implement private messaging logic here
      console.log(`Opening private chat with ${targetUser.username}`);
    }
  };

  if (!isJoined) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md">
          <h1 className="text-3xl font-bold text-white mb-6 text-center">Welcome to Chat</h1>
          <form onSubmit={handleJoin} className="space-y-4">
            <input
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-3 bg-gray-700 text-white rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="w-full py-3 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors"
            >
              Join Chat
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-900">
      <Sidebar
        rooms={['general', 'random', 'announcements']}
        currentRoom={currentRoom}
        switchRoom={setCurrentRoom}
        users={users}
        username={username}
        unreadCounts={unreadCounts}
        onPrivateMessage={handlePrivateMessage}
      />
      <div className="flex-1">
        <Chat
          username={username}
          room={currentRoom}
        />
      </div>
    </div>
  );
}

export default App;