import React from 'react';

export default function MessageReactions({ reactions = {}, readBy = [], onReactionClick }) {
  if (!reactions || Object.keys(reactions).length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1 mt-2">
      {Object.entries(reactions).map(([emoji, users]) => (
        <button
          key={emoji}
          onClick={() => onReactionClick && onReactionClick(emoji)}
          className="flex items-center gap-1 px-2 py-1 bg-[#1f2328] hover:bg-[#2b2f36] rounded text-sm transition-colors"
          title={users.join(', ')}
        >
          <span>{emoji}</span>
          <span className="text-xs text-gray-400">{users.length}</span>
        </button>
      ))}
      {readBy && readBy.length > 0 && (
        <div className="text-xs text-gray-500 mt-1 ml-1">
          Read by: {readBy.join(', ')}
        </div>
      )}
    </div>
  );
}
