import React, { useState, useEffect, useRef } from 'react';
import { X, Send } from 'lucide-react';

export default function PrivateChatModal({ 
  isOpen, 
  onClose, 
  otherUser, 
  currentUsername,
  messages = [], 
  onSendMessage 
}) {
  const [text, setText] = useState('');
  const containerRef = useRef(null);
  const endRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isOpen || !otherUser) return null;

  const privateMessages = messages.filter(m => 
    m.isPrivate && 
    ((m.sender === currentUsername && m.recipient === otherUser.username) ||
     (m.sender === otherUser.username && m.recipient === currentUsername))
  );

  const handleSend = () => {
    if (text.trim()) {
      onSendMessage(otherUser.id, text.trim());
      setText('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-[color:var(--discord-900)] rounded-lg shadow-xl w-96 h-96 flex flex-col border border-[#1f2328]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#1f2328]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#202326] flex items-center justify-center text-xs font-semibold text-white">
              {otherUser.username?.charAt(0)?.toUpperCase()}
            </div>
            <span className="text-sm font-semibold">{otherUser.username}</span>
          </div>
          <button 
            onClick={onClose} 
            className="p-1 rounded-md hover:bg-[#0f1113] text-gray-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Messages */}
        <div 
          ref={containerRef} 
          className="flex-1 overflow-y-auto px-4 py-4 space-y-3 scrollbar-thin scrollbar-thumb-[#2b2f36]"
        >
          {privateMessages.length === 0 ? (
            <div className="text-center text-gray-400 text-sm mt-8">
              No messages yet. Start a conversation!
            </div>
          ) : (
            privateMessages.map((msg) => (
              <div 
                key={msg.id}
                className={`flex ${msg.sender === currentUsername ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                    msg.sender === currentUsername 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-[#0f1113] text-gray-100'
                  }`}
                >
                  {msg.message}
                </div>
              </div>
            ))
          )}
          <div ref={endRef} />
        </div>

        {/* Input */}
        <div className="px-4 py-3 border-t border-[#1f2328]">
          <div className="flex items-center gap-2">
            <input 
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              className="flex-1 bg-transparent text-sm text-gray-100 placeholder-gray-500 outline-none rounded px-2 py-1 border border-[#2b2f36] focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
            <button 
              onClick={handleSend}
              disabled={!text.trim()}
              className="p-2 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-60"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
