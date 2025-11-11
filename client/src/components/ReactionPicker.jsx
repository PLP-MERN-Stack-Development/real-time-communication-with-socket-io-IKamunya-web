import React, { useRef, useEffect } from 'react';
import { Smile, X } from 'lucide-react';

const EMOJI_LIST = ['👍', '❤️', '😂', '🔥', '😍', '🎉', '🚀', '👏', '💯', '✨', '😢', '🤔'];

export default function ReactionPicker({ messageId, onReact, isOpen, onClose }) {
  const pickerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      ref={pickerRef}
      className="absolute bottom-0 right-0 mb-8 bg-[#0f1113] border border-[#1f2328] rounded-lg p-2 flex flex-wrap gap-1 w-48 shadow-lg z-10"
    >
      {EMOJI_LIST.map((emoji) => (
        <button
          key={emoji}
          onClick={() => {
            onReact(messageId, emoji);
            onClose();
          }}
          className="text-lg hover:bg-[#1f2328] p-1 rounded cursor-pointer transition-colors"
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}
