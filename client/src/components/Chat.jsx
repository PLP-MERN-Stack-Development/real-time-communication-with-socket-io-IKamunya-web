import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useSocket } from '../socket/socket';
import { Menu, Bell, Search } from 'lucide-react';
import Message from './Message';
import MessageInput from './MessageInput';
import UsersList from './UsersList';
import TypingIndicator from './TypingIndicator';
import SearchBar from './SearchBar';

const Chat = ({ username, room }) => {
  const {
    messages,
    sendMessage,
    sendFile,
    reactMessage,
    markRead,
    typingUsers,
    users,
    socket,
    setTyping,
    unreadCounts,
    joinRoom,  // Added joinRoom to destructuring
    sendPrivateMessage
  } = useSocket();

  const [showUsers, setShowUsers] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchResults, setSearchResults] = useState(null);
  const [displayedMessages, setDisplayedMessages] = useState([]);
  const [isLoadingOlder, setIsLoadingOlder] = useState(false);
  const [messagesPerPage] = useState(50);
  const containerRef = useRef(null);
  const endRef = useRef(null);
  const scrollObserverRef = useRef(null);

  // Join room when component mounts or room changes
  useEffect(() => {
    let mounted = true;
    
    const joinAndSetupRoom = async () => {
      if (socket && room && mounted) {
        try {
          console.log('DEBUG: Joining room:', room);
          await joinRoom(room);
          console.log('DEBUG: Successfully joined and setup room:', room);
        } catch (error) {
          console.error('Failed to join room:', error);
        }
      }
    };
    
    joinAndSetupRoom();
    
    // Re-join room on reconnection
    const handleReconnect = () => {
      console.log('DEBUG: Reconnected, rejoining room:', room);
      joinAndSetupRoom();
    };
    
    socket?.on('connect', handleReconnect);
    
    return () => {
      mounted = false;
      socket?.off('connect', handleReconnect);
    };
  }, [socket, room, joinRoom]);

  // smooth scroll to bottom when messages change
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [messages, room]);

  // legacy fallback: mark messages in this room as read on change (keeps socket behaviour intact)
  useEffect(() => {
    if (!messages || !room) return;
    console.log('CHAT: Messages updated:', {
      totalMessages: messages.length,
      roomMessages: messages.filter(m => m.room === room || m.isPrivate).length,
      room
    });
    messages.forEach((m) => {
      if (!m.isPrivate && m.room === room && m.sender !== username) {
        if (!m.readBy || !m.readBy.includes(username)) {
          if (markRead) markRead({ messageId: m.id });
        }
      }
    });
  }, [messages, room, username, markRead]);

  // Filter messages for current room and include private messages for the current user
  const roomMessages = (messages || []).filter((m) => 
    m.room === room || 
    (m.isPrivate && (m.sender === username || m.recipient === username))
  );

  // Update displayed messages based on search or pagination
  useEffect(() => {
    if (searchResults) {
      setDisplayedMessages(searchResults);
    } else {
      // Show latest messagesPerPage messages or all if less than limit
      const start = Math.max(0, roomMessages.length - messagesPerPage);
      setDisplayedMessages(roomMessages.slice(start));
    }
  }, [roomMessages, searchResults, messagesPerPage]);

  // Handle scroll up to load older messages
  useEffect(() => {
    if (!containerRef.current || searchResults) return;

    const container = containerRef.current;
    const handleScroll = () => {
      if (container.scrollTop < 100 && !isLoadingOlder && roomMessages.length > displayedMessages.length) {
        setIsLoadingOlder(true);
        // Simulate loading delay
        setTimeout(() => {
          setDisplayedMessages((prev) => {
            const newStart = Math.max(0, roomMessages.length - (prev.length + messagesPerPage));
            return roomMessages.slice(newStart);
          });
          setIsLoadingOlder(false);
        }, 300);
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [containerRef, isLoadingOlder, roomMessages, displayedMessages, messagesPerPage, searchResults]);

  return (
    <div className="flex h-full w-full bg-[color:var(--discord-950)] text-gray-100">
      {/* mobile top bar */}
      <div className="w-full md:hidden flex items-center justify-between px-4 py-2 bg-[color:var(--discord-900)] border-b border-[#1f2328]">
        <div className="flex items-center gap-3">
          <button onClick={() => setShowUsers((s) => !s)} className="p-2 rounded-md hover:bg-gray-800">
            <Menu size={18} />
          </button>
          <div className="font-semibold">#{room}</div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowSearch(!showSearch)} className="p-2 rounded-md hover:bg-gray-800"><Search size={18} /></button>
          <button className="p-2 rounded-md hover:bg-gray-800"><Bell size={18} /></button>
        </div>
      </div>

      {/* Users sidebar (collapses on mobile) */}
      <aside className={`hidden md:flex md:flex-col w-72 bg-[color:var(--discord-900)] border-r border-[#151618] ${showUsers ? 'block' : ''}`}>
        <UsersList users={users} unreadCounts={unreadCounts} socketId={socket?.id} onPrivateMessage={(to, text) => {
          // if text is provided, send immediately; otherwise prompt
          if (text) return sendPrivateMessage(to, text);
          const body = window.prompt('Send a private message:');
          if (body && body.trim()) sendPrivateMessage(to, body.trim());
        }} />
      </aside>

      <main className="flex-1 flex flex-col">
        {/* Search bar */}
        {showSearch && (
          <SearchBar 
            messages={roomMessages}
            currentRoom={room}
            currentUsername={username}
            onSearch={(results) => setSearchResults(results)}
            onClose={() => {
              setShowSearch(false);
              setSearchResults(null);
            }}
          />
        )}

        {/* header */}
        <div className="hidden md:flex items-center justify-between px-6 py-4 border-b border-[#151618] bg-[color:var(--discord-900)]">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold">#{room}</h3>
            <div className="text-sm text-gray-400">Welcome, {username}</div>
          </div>
          <div className="text-sm text-gray-400">{users.length} online</div>
        </div>

        {/* messages container */}
        <div ref={containerRef} className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-4 scrollbar-thin scrollbar-thumb-[#2b2f36]">
          {isLoadingOlder && (
            <div className="text-center text-gray-400 text-sm py-2">
              Loading older messages...
            </div>
          )}

          {displayedMessages.length === 0 && (
            <div className="text-center text-gray-400 mt-20">No messages yet — say hi 👋</div>
          )}

          {displayedMessages.length > 0 && roomMessages.length > displayedMessages.length && (
            <div className="text-center text-gray-500 text-xs py-2">
              ⬆️ Scroll up to load more ({roomMessages.length - displayedMessages.length} older messages)
            </div>
          )}

          {displayedMessages.map((msg) => (
            <Message
              key={msg.id}
              msg={msg}
              currentUser={username}
              reactMessage={reactMessage}
              markRead={markRead}
            />
          ))}

          <div ref={endRef} />
        </div>

        <div className="px-4 py-3 border-t border-[#151618] bg-[color:var(--discord-900)]">
          <TypingIndicator typingUsers={typingUsers} currentUser={username} />
          <MessageInput
            placeholder={`Message #${room}`}
            onSend={(text) => sendMessage({ message: text, room })}
            onFile={(fileData) => sendFile({ ...fileData, room })}
            setTyping={(isTyping) => setTyping({ room, isTyping })}
          />
        </div>
      </main>

      {/* mobile sliding users panel */}
      {showUsers && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setShowUsers(false)} />
      )}
      {showUsers && (
        <aside className="md:hidden fixed z-50 left-0 top-0 bottom-0 w-72 bg-[color:var(--discord-900)] border-r border-[#151618]">
          <UsersList users={users} unreadCounts={unreadCounts} socketId={socket?.id} onClose={() => setShowUsers(false)} />
        </aside>
      )}
    </div>
  );
};

export default Chat;