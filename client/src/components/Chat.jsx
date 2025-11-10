import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '../socket/socket';
import { Send, Image, Smile, Paperclip } from 'lucide-react';

const Chat = ({ username, room }) => {
  const {
    messages,
    sendMessage,
    sendFile,
    reactMessage,
    markRead,
    sendPrivateMessage,
    typingUsers,
    users,
    socket,
    setTyping,
    unreadCounts
  } = useSocket();

  const [input, setInput] = useState('');
  const [file, setFile] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // mark messages as read for this room when they arrive
  useEffect(() => {
    if (!messages || messages.length === 0) return;
    messages.forEach((m) => {
      if (!m.isPrivate && m.room === room && m.sender !== username) {
        if (!m.readBy || !m.readBy.includes(username)) {
          if (markRead) markRead({ messageId: m.id });
        }
      }
    });
  }, [messages, room, username, markRead]);

  // Handle typing
  const handleTyping = (e) => {
    setInput(e.target.value);
    setTyping({ room, isTyping: e.target.value.length > 0 });
  };

  // Send message
  const handleSend = () => {
    if (!input.trim() && !file) return;

    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (sendFile) {
          sendFile({ fileData: reader.result, fileName: file.name, fileType: file.type, room });
        } else {
          socket.emit('send_file', {
            fileData: reader.result,
            fileName: file.name,
            fileType: file.type,
            room,
          });
        }
      };
      reader.readAsDataURL(file);
      setFile(null);
    }

    if (input.trim()) {
      sendMessage({ message: input, room });
      setInput('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // React to message
  const reactToMessage = (msgId, emoji) => {
    if (reactMessage) reactMessage({ messageId: msgId, emoji });
    else socket.emit('react_message', { messageId: msgId, emoji });
  };

  return (
    <div className="flex flex-col h-full bg-discord-gray-950">
      {/* Top bar */}
      <div className="flex items-center justify-between p-4 bg-gray-800 shadow-lg">
        <div className="flex items-center gap-2">
          <span className="text-gray-400">#</span>
          <h2 className="font-semibold text-white">{room}</h2>
        </div>
        <div className="flex items-center gap-3">
          {users.map((user) => (
            <div key={user.id} className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                user.id === socket.id ? 'bg-blue-500' : 'bg-green-500'
              }`} />
              <span className="text-sm text-gray-300">{user.username}</span>
            </div>
          ))}
        </div>
      </div>

  {/* Messages */}
  <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-700">
        {messages
          .filter((m) => m.room === room || m.isPrivate)
          .map((msg) => {
            const isOwn = msg.sender === username;
            const reactions = msg.reactions || {};
            return (
              <div key={msg.id} className={`flex items-end gap-3 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                {/* avatar for other users */}
                {!isOwn && (
                  <div className="w-8 h-8 rounded-full bg-discord-gray-600 flex items-center justify-center text-sm font-semibold text-white">
                    {msg.sender?.charAt(0)?.toUpperCase()}
                  </div>
                )}

                <div className="flex flex-col max-w-[75%]">
                  <div className={`px-4 py-2 rounded-lg shadow-sm message-bubble ${isOwn ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white ml-auto' : 'bg-discord-gray-800 text-discord-gray-100'}`}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-sm font-medium truncate">
                        {msg.sender}
                      </div>
                      <div className="text-xs text-discord-gray-400 ml-2">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>

                    <div className="text-sm">
                      {msg.isFile ? (
                        msg.fileType?.startsWith('image') ? (
                          <img src={msg.fileData} alt={msg.fileName} className="rounded-md max-w-full" />
                        ) : (
                          <a href={msg.fileData} download={msg.fileName} className="inline-flex items-center gap-2 text-blue-300 hover:underline">
                            <Paperclip size={16} />
                            <span>{msg.fileName}</span>
                          </a>
                        )
                      ) : (
                        <div className="whitespace-pre-wrap">{msg.message}</div>
                      )}
                    </div>

                    {/* Reactions */}
                    <div className="mt-2 flex flex-wrap gap-2">
                      {['👍', '❤️', '😂', '😮', '😢'].map((emoji) => {
                        const usersReacted = reactions[emoji] || [];
                        const reacted = usersReacted.includes(username);
                        return (
                          <button
                            key={emoji}
                            onClick={() => reactToMessage(msg.id, emoji)}
                            className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-xs ${reacted ? 'bg-discord-gray-700' : 'bg-discord-gray-800 hover:bg-discord-gray-700'}`}
                          >
                            <span>{emoji}</span>
                            {usersReacted.length > 0 && <span className="text-discord-gray-300">{usersReacted.length}</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Read receipts */}
                  {msg.readBy && msg.readBy.length > 0 && (
                    <div className="text-[11px] text-discord-gray-400 mt-1 truncate">Seen by: {msg.readBy.join(', ')}</div>
                  )}
                </div>

                {/* placeholder for alignment when own message */}
                {isOwn && <div className="w-8" />}
              </div>
            );
          })}
        <div ref={messagesEndRef} />
      </div>

      {/* Typing indicator */}
      {typingUsers.length > 0 && (
        <div className="px-4 py-2 text-sm text-gray-400">
          {typingUsers.join(', ')} {typingUsers.length > 1 ? 'are' : 'is'} typing...
        </div>
      )}

      {/* Input area */}
      <div className="p-4 bg-gray-800">
        <div className="flex items-center gap-2 bg-gray-700 rounded-lg p-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-gray-400 hover:text-gray-200 rounded-full hover:bg-gray-600 transition-colors"
          >
            <Paperclip size={20} />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => setFile(e.target.files?.[0])}
            className="hidden"
          />
          <textarea
            rows="1"
            value={input}
            onChange={handleTyping}
            onKeyDown={handleKeyPress}
            placeholder={`Message #${room}`}
            className="flex-1 bg-transparent text-white placeholder-gray-400 outline-none resize-none"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() && !file}
            className="p-2 text-white rounded-full bg-blue-600 hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={20} />
          </button>
        </div>
        {file && (
          <div className="mt-2 p-2 bg-gray-700 rounded flex items-center gap-2">
            <Paperclip size={16} className="text-gray-400" />
            <span className="text-sm text-gray-300">{file.name}</span>
            <button
              onClick={() => setFile(null)}
              className="ml-auto text-gray-400 hover:text-white"
            >
              ×
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;