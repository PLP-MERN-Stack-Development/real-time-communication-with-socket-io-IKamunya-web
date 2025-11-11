import React from 'react';
import { MessageCircle } from 'lucide-react';

export default function ConversationsList({ 
  conversations = [], 
  currentUsername,
  onSelectConversation 
}) {
  if (!conversations || conversations.length === 0) {
    return (
      <div className="p-4 text-center text-gray-400 text-sm">
        <MessageCircle size={32} className="mx-auto mb-2 opacity-50" />
        <p>No conversations yet</p>
      </div>
    );
  }

  return (
    <div className="p-3 space-y-2">
      <h4 className="text-xs text-gray-400 uppercase mb-3 tracking-wider">Direct Messages</h4>
      {conversations.map((conv) => {
        const lastMsg = conv.lastMessage;
        const isUnread = conv.unread > 0;
        
        return (
          <button
            key={conv.userId}
            onClick={() => onSelectConversation(conv)}
            className={`w-full text-left p-2 rounded-md transition-colors ${
              isUnread 
                ? 'bg-[#1f2328] hover:bg-[#2b2f36]' 
                : 'hover:bg-[#0f1113]'
            }`}
          >
            <div className="flex items-start gap-2">
              <div className="w-8 h-8 rounded-full bg-[#202326] flex-shrink-0 flex items-center justify-center text-xs font-semibold text-white">
                {conv.username?.charAt(0)?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-sm font-medium truncate ${isUnread ? 'text-white' : 'text-gray-300'}`}>
                    {conv.username}
                  </span>
                  {isUnread && (
                    <span className="bg-indigo-600 text-white text-xs px-2 py-0.5 rounded-full flex-shrink-0">
                      {conv.unread}
                    </span>
                  )}
                </div>
                <p className={`text-xs truncate ${
                  isUnread ? 'text-gray-200' : 'text-gray-500'
                }`}>
                  {lastMsg?.sender === currentUsername ? 'You: ' : ''}{lastMsg?.message || 'No messages yet'}
                </p>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
