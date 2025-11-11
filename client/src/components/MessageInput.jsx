import React, { useEffect, useRef, useState } from 'react';
import { Send, Paperclip, Image, Smile } from 'lucide-react';

export default function MessageInput({ placeholder = 'Message', onSend, onFile, setTyping }) {
  const [text, setText] = useState('');
  const [file, setFile] = useState(null);
  const fileRef = useRef(null);
  const typingTimer = useRef(null);

  useEffect(() => {
    return () => clearTimeout(typingTimer.current);
  }, []);

  const handleChange = (e) => {
    setText(e.target.value);
    if (setTyping) setTyping(true);
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => setTyping && setTyping(false), 1200);
  };

  const handleSend = () => {
    console.log('MessageInput: Attempting to send message:', { text, file });
    if (!text.trim() && !file) {
      console.log('MessageInput: No content to send');
      return;
    }
    if (file) {
      console.log('MessageInput: Processing file:', file.name);
      const reader = new FileReader();
      reader.onload = () => {
        console.log('MessageInput: File processed, calling onFile');
        onFile && onFile({ fileData: reader.result, fileName: file.name, fileType: file.type });
      };
      reader.readAsDataURL(file);
      setFile(null);
    }
    if (text.trim()) {
      console.log('MessageInput: Sending text message:', text.trim());
      onSend && onSend(text.trim());
      setText('');
    }
    setTyping && setTyping(false);
    console.log('MessageInput: Message sent');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {/* Drag and drop area */}
      <div 
        className="border-2 border-dashed border-[#2b2f36] rounded-lg p-4 text-center text-sm text-gray-400 hover:border-indigo-500 hover:text-indigo-400 transition-colors cursor-pointer"
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation();
          const droppedFile = e.dataTransfer.files?.[0];
          if (droppedFile) {
            setFile(droppedFile);
          }
        }}
        onClick={() => fileRef.current?.click()}
      >
        📎 Drag files here or click to upload
      </div>

      <div className="flex items-center gap-2">
        <button onClick={() => fileRef.current?.click()} className="p-2 rounded-full hover:bg-gray-800 text-gray-300">
          <Paperclip size={18} />
        </button>

        <input 
          ref={fileRef} 
          type="file" 
          className="hidden" 
          onChange={(e) => setFile(e.target.files?.[0])} 
          id="message-file-input"
          name="message-file-input"
        />

        <div className="flex-1 relative">
          <textarea
            id="message-text-input"
            name="message-text-input"
            value={text}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            rows={1}
            placeholder={placeholder}
            className="w-full resize-none bg-transparent text-sm text-gray-100 placeholder-gray-500 outline-none px-3 py-2 rounded-lg border border-transparent focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <button onClick={handleSend} className="p-2 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-60" disabled={!text.trim() && !file}>
          <Send size={18} />
        </button>
      </div>

      {file && (
        <div className="flex items-center gap-2 px-3 py-2 bg-[#0f1113] rounded-md border border-[#1f2328]">
          {file.type.startsWith('image') && (
            <img src={URL.createObjectURL(file)} alt="preview" className="w-12 h-12 object-cover rounded" />
          )}
          <div className="text-sm text-gray-300 truncate flex-1">{file.name}</div>
          <span className="text-xs text-gray-500">{(file.size / 1024).toFixed(2)} KB</span>
          <button onClick={() => setFile(null)} className="ml-auto text-gray-400 hover:text-white">×</button>
        </div>
      )}
    </div>
  );
}
