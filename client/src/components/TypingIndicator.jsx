import React from 'react';

export default function TypingIndicator({ typingUsers = [], currentUser }) {
  const others = typingUsers.filter((t) => t !== currentUser);
  if (!others || others.length === 0) return null;

  return (
    <div className="flex items-center gap-3 mb-4 p-3 bg-[#0f1113] rounded-lg border border-[#1f2328] animate-pulse">
      <div className="flex items-center gap-1">
        <span className="typing-dot bg-indigo-400 w-2 h-2 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
        <span className="typing-dot bg-indigo-400 w-2 h-2 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
        <span className="typing-dot bg-indigo-400 w-2 h-2 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
      </div>
      <div className="text-sm text-indigo-300 font-medium">
        {others.join(', ')} {others.length > 1 ? 'are' : 'is'} typing...
      </div>
    </div>
  );
}
