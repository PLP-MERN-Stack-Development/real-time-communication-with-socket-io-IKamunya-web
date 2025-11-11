import React, { useState, useEffect, useRef } from 'react';
import { Paperclip, Smile } from 'lucide-react';
import ReactionPicker from './ReactionPicker';
import MessageReactions from './MessageReactions';

const commonEmojis = ['👍', '❤️', '😂', '😮', '😢', '🎉', '🔥'];

const Avatar = ({ name }) => {
  const initial = name?.charAt(0)?.toUpperCase() || '?';
  return (
    <div className="w-10 h-10 rounded-full bg-[#202326] flex items-center justify-center text-sm font-semibold text-white drop-shadow-sm">
      {initial}
    </div>
  );
};

export default function Message({ msg, currentUser, reactMessage, markRead }) {
  const isOwn = msg.sender === currentUser;
  const ref = useRef(null);
  const [showReactionPicker, setShowReactionPicker] = useState(false);

  // Check if this is a system message
  const isSystemMessage = msg.system === true;

  // mark read when message becomes visible (IntersectionObserver)
  useEffect(() => {
    if (!ref.current || !markRead) return;
    const el = ref.current;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (!msg.isPrivate && msg.sender !== currentUser) {
              if (!msg.readBy || !msg.readBy.includes(currentUser)) {
                markRead({ messageId: msg.id });
              }
            }
          }
        });
      },
      { threshold: 0.6 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [msg, currentUser, markRead]);

  const unread = !msg.readBy || !msg.readBy.includes(currentUser);

  // Render system messages differently
  if (isSystemMessage) {
    return (
      <div className="flex justify-center my-4">
        <div className="px-4 py-2 rounded-full bg-[#0f1113] border border-[#1f2328] text-xs text-gray-400 font-medium">
          {msg.message}
        </div>
      </div>
    );
  }

  return (
    <div ref={ref} className={`flex gap-3 items-end ${isOwn ? 'justify-end' : 'justify-start'}`}>
      {!isOwn && <Avatar name={msg.sender} />}

      <div className="max-w-[78%] relative">
        <div className="flex items-baseline gap-2">
          <div className="text-sm font-medium text-gray-200 truncate">{msg.sender}</div>
          <div className="text-xs text-gray-400">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
        </div>

        <div
          className={`mt-1 px-4 py-2 rounded-2xl shadow-sm message-bubble transition-colors duration-150 group relative ${
            isOwn
              ? 'bg-gradient-to-br from-purple-600 to-purple-700 text-white'
              : 'bg-[#1a1a2e] text-gray-100'
          } ${unread && !isOwn ? 'ring-1 ring-yellow-600/20' : ''}`}
        >
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
            <div className="whitespace-pre-wrap text-sm leading-relaxed">{msg.message}</div>
          )}

          {/* Emoji reaction button on hover */}
          <button
            onClick={() => setShowReactionPicker(!showReactionPicker)}
            className="absolute -top-8 -right-2 opacity-100 p-1 rounded-md hover:bg-purple-600 text-white bg-purple-700 shadow-lg"
            title="Add reaction"
          >
            <Smile size={18} />
          </button>

          {/* Reaction picker */}
          <ReactionPicker 
            messageId={msg.id} 
            onReact={reactMessage}
            isOpen={showReactionPicker}
            onClose={() => setShowReactionPicker(false)}
          />
        </div>

        {/* Show reactions */}
        <MessageReactions reactions={msg.reactions} readBy={msg.readBy} />
      </div>

      {isOwn && <div className="w-10" />} 
    </div>
  );
}
