import React, { useState, useCallback } from 'react';
import { Search, X } from 'lucide-react';

export default function SearchBar({ 
  messages = [], 
  currentRoom,
  currentUsername,
  onSearch,
  onClose
}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  const handleSearch = useCallback((text) => {
    setQuery(text);
    
    if (!text.trim()) {
      setResults([]);
      onSearch && onSearch([]);
      return;
    }

    const searchTerm = text.toLowerCase();
    const filtered = messages.filter((msg) => {
      // Search in current room or private messages with current user
      const inRoom = msg.room === currentRoom && !msg.isPrivate;
      const isPrivate = msg.isPrivate && 
        ((msg.sender === currentUsername && msg.recipientId) || 
         (msg.recipient === currentUsername && msg.senderId));
      
      if (!inRoom && !isPrivate) return false;
      
      // Search text
      const messageText = msg.message?.toLowerCase() || '';
      const fileName = msg.fileName?.toLowerCase() || '';
      
      return messageText.includes(searchTerm) || fileName.includes(searchTerm);
    });

    setResults(filtered);
    onSearch && onSearch(filtered);
  }, [messages, currentRoom, currentUsername, onSearch]);

  return (
    <div className="relative">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[#1f2328] bg-[color:var(--discord-900)]">
        <Search size={18} className="text-gray-400" />
        <input
          type="text"
          placeholder="Search messages..."
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          className="flex-1 bg-transparent text-sm text-gray-100 placeholder-gray-500 outline-none"
          autoFocus
        />
        {query && (
          <button 
            onClick={() => handleSearch('')}
            className="p-1 text-gray-400 hover:text-white"
          >
            <X size={18} />
          </button>
        )}
        <button 
          onClick={onClose}
          className="p-1 text-gray-400 hover:text-white"
        >
          <X size={18} />
        </button>
      </div>

      {/* Search results dropdown */}
      {query && (
        <div className="absolute top-12 left-0 right-0 max-h-64 overflow-y-auto bg-[#0f1113] border border-[#1f2328] rounded-b-lg z-20">
          {results.length === 0 ? (
            <div className="p-4 text-center text-gray-400 text-sm">
              No messages found
            </div>
          ) : (
            <div className="divide-y divide-[#1f2328]">
              {results.map((msg) => (
                <div 
                  key={msg.id}
                  className="p-3 hover:bg-[#1f2328] cursor-pointer transition-colors text-sm"
                >
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="font-medium text-gray-200">{msg.sender}</span>
                    <span className="text-xs text-gray-500">
                      {new Date(msg.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-gray-300 truncate">
                    {msg.isFile ? `📎 ${msg.fileName}` : msg.message}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
