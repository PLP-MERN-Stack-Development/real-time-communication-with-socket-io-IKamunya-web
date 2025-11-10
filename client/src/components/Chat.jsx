import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '../socket/socket';
import { Send, Image, Smile, Paperclip } from 'lucide-react';

const Chat = ({ username, room }) => {
  const {
    messages,
    sendMessage,
    sendPrivateMessage,
    typingUsers,
    users,
    socket,
    setTyping,
    readMessages = {},
    messageReactions = {},
  } = useSocket();

  const [input, setInput] = useState('');
  const [file, setFile] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
        socket.emit('send_file', {
          fileData: reader.result,
          fileName: file.name,
          fileType: file.type,
        });
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
    socket.emit('react_message', { messageId: msgId, emoji });
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
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === username ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[70%] group ${
              msg.sender === username ? 'order-1' : ''
            }`}>
              {/* Message header */}
              <div className="flex items-center gap-2 mb-1">
                <span className={`font-medium ${
                  msg.sender === username ? 'text-blue-400' : 'text-green-400'
                }`}>
                  {msg.sender}
                </span>
                <span className="text-xs text-gray-500">
                  {new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>

              {/* Message content */}
              <div className={`p-3 rounded-lg ${
                msg.sender === username
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-100'
              }`}>
                {msg.isFile ? (
                  msg.fileType?.startsWith('image') ? (
                    <img
                      src={msg.fileData}
                      alt={msg.fileName}
                      className="rounded-md max-w-full"
                    />
                  ) : (
                    <a
                      href={msg.fileData}
                      download={msg.fileName}
                      className="flex items-center gap-2 text-blue-300 hover:text-blue-200"
                    >
                      <Paperclip size={16} />
                      {msg.fileName}
                    </a>
                  )
                ) : (
                  <p className="whitespace-pre-wrap">{msg.message}</p>
                )}

                {/* Reactions */}
                <div className="flex gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {['👍', '❤️', '😂', '😮', '😢'].map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => reactToMessage(msg.id, emoji)}
                      className={`text-xs p-1 rounded hover:bg-gray-700 transition-colors ${
                        messageReactions[msg.id]?.[emoji]?.includes(username)
                          ? 'bg-gray-700'
                          : ''
                      }`}
                    >
                      {emoji}
                      {messageReactions[msg.id]?.[emoji]?.length > 0 && (
                        <span className="ml-1 text-xs">
                          {messageReactions[msg.id][emoji].length}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Read receipts */}
              {readMessages[msg.id]?.length > 0 && (
                <div className="text-xs text-gray-500 mt-1">
                  Seen by {readMessages[msg.id].join(', ')}
                </div>
              )}
            </div>
          </div>
        ))}
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