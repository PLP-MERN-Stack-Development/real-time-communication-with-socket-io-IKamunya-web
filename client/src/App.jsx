import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSocket } from './socket/socket';
import DiscordLayout from './components/DiscordLayout';
import Header from './components/Header';
import Chat from './components/Chat';
import PrivateChatModal from './components/PrivateChatModal';
import ConversationsList from './components/ConversationsList';
function App() {
  // 1. State hooks - All state must be declared before any other hooks
  const [username, setUsername] = useState('');
  const [isJoined, setIsJoined] = useState(false);
  const [currentRoom, setCurrentRoom] = useState('general');
  const [message, setMessage] = useState('');
  const [selectedPrivateUser, setSelectedPrivateUser] = useState(null);
  const [isPrivateChatOpen, setIsPrivateChatOpen] = useState(false);
  
  // 2. Custom hooks - Must be called after state hooks
  const {
    isConnected,
    users,
    connect,
    disconnect,
    joinRoom,
    sendMessage,
    sendPrivateMessage,
    unreadCounts,
    messages
  } = useSocket();
  
  // All useEffect hooks must be together after useState and custom hooks

  // Group all effects together
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  useEffect(() => {
    if (isConnected && isJoined && currentRoom) {
      console.log('DEBUG: Managing room:', { currentRoom, isConnected, isJoined });
      joinRoom(currentRoom);
    }
  }, [isConnected, isJoined, currentRoom, joinRoom]);

  // Event handlers after effects
  const handleJoin = useCallback((e) => {
    e.preventDefault();
    if (username.trim()) {
      console.log('DEBUG: Connecting with username:', username);
      connect(username);
      setIsJoined(true);
    }
  }, [username, connect]);

  const handleSendMessage = useCallback((e) => {
    e.preventDefault();
    if (message.trim()) {
      console.log('Sending message:', { message, room: currentRoom });
      sendMessage({ message: message.trim(), room: currentRoom });
      setMessage('');
    }
  }, [message, currentRoom, sendMessage]);

  const handlePrivateMessage = useCallback((userId) => {
    const targetUser = users.find(u => u.id === userId);
    if (targetUser) {
      console.log(`Opening private chat with ${targetUser.username}`);
      setSelectedPrivateUser(targetUser);
      setIsPrivateChatOpen(true);
    }
  }, [users]);

  const handleSwitchRoom = useCallback((room) => {
    setCurrentRoom(room);
  }, []);

  // Build conversations list from private messages
  const conversations = useMemo(() => {
    const convMap = new Map();
    messages.forEach((msg) => {
      if (msg.isPrivate) {
        const otherUsername = msg.sender === username ? msg.recipient : msg.sender;
        const otherUserId = msg.sender === username ? msg.recipientId : msg.senderId;
        
        if (!convMap.has(otherUserId)) {
          const otherUser = users.find(u => u.id === otherUserId);
          convMap.set(otherUserId, {
            userId: otherUserId,
            username: otherUsername,
            lastMessage: msg,
            unread: 0
          });
        } else {
          convMap.get(otherUserId).lastMessage = msg;
        }
      }
    });
    
    return Array.from(convMap.values()).sort((a, b) => 
      new Date(b.lastMessage.timestamp) - new Date(a.lastMessage.timestamp)
    );
  }, [messages, username, users]);

  const handleSelectConversation = useCallback((conv) => {
    const user = users.find(u => u.id === conv.userId);
    if (user) {
      setSelectedPrivateUser(user);
      setIsPrivateChatOpen(true);
    }
  }, [users]);

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
    <>
      <DiscordLayout
        rooms={['general', 'random', 'announcements']}
        currentRoom={currentRoom}
        switchRoom={handleSwitchRoom}
        users={users}
        username={username}
        unreadCounts={unreadCounts}
        isConnected={isConnected}
        onPrivateMessage={handlePrivateMessage}
        conversations={conversations}
        onSelectConversation={handleSelectConversation}
      >
        <div className="flex flex-col h-full">
          <Header 
            room={currentRoom} 
            usersCount={users.length} 
            isConnected={isConnected}
            onSearch={() => {
              // Chat component will handle showing search - just a callback
            }}
          />
          <div className="flex-1 overflow-hidden">
            <Chat username={username} room={currentRoom} />
          </div>
        </div>
      </DiscordLayout>

      <PrivateChatModal
        isOpen={isPrivateChatOpen}
        onClose={() => setIsPrivateChatOpen(false)}
        otherUser={selectedPrivateUser}
        currentUsername={username}
        messages={messages}
        onSendMessage={sendPrivateMessage}
      />
    </>
  );
}

export default App;