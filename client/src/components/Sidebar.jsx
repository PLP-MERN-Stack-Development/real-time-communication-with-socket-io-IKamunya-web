import React from 'react';
import { Users, MessageCircle, Hash } from 'lucide-react';

const Sidebar = ({ rooms = ['general'], currentRoom = 'general', switchRoom = () => {}, users = [], username = '', unreadCounts = {}, onPrivateMessage = () => {} }) => {
  return (
    <div className="w-72 bg-gray-800 flex flex-col h-full">
      {/* Rooms */}
      <div className="p-4 border-b border-gray-700">
        <h3 className="text-gray-400 text-xs font-bold uppercase flex items-center gap-2 mb-3">
          <Hash size={16} />
          Rooms
        </h3>
        <div className="flex flex-col gap-1">
          {rooms.map((room) => (
            <button
              key={room}
              onClick={() => switchRoom(room)}
              className={`w-full flex justify-between items-center px-3 py-2 rounded hover:bg-gray-700 transition-all ${
                currentRoom === room ? 'bg-gray-700 text-white' : 'text-gray-400'
              }`}
            >
              <div className="flex items-center gap-2">
                <Hash size={14} />
                <span>{room}</span>
              </div>
              {unreadCounts[room] > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  {unreadCounts[room]}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Users */}
      <div className="p-4 flex-1 overflow-y-auto">
        <h3 className="text-gray-400 text-xs font-bold uppercase flex items-center gap-2 mb-3">
          <Users size={16} />
          Online Users
        </h3>
        <div className="flex flex-col gap-1">
          {users.map((user) => (
            <div
              key={user.id}
              className={`flex items-center gap-3 p-2 rounded hover:bg-gray-700 transition-all ${
                user.username === username ? 'bg-gray-700' : ''
              }`}
            >
              {/* Online/Offline dot */}
              <div className={`w-2 h-2 rounded-full ${
                user.username === username ? 'bg-blue-500' : 'bg-green-500'
              }`} />

              {/* Avatar */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                user.username === username ? 'bg-blue-600' : 'bg-gray-600'
              }`}>
                {user.username.charAt(0).toUpperCase()}
              </div>

              <span className={`flex-1 text-sm ${
                user.username === username ? 'text-blue-400' : 'text-gray-300'
              }`}>
                {user.username}
                {user.username === username && (
                  <span className="text-gray-500 text-xs ml-1">
                    (you)
                  </span>
                )}
              </span>

              {/* Private message icon */}
              {user.username !== username && (
                <MessageCircle 
                  size={16} 
                  className="text-gray-400 hover:text-white cursor-pointer transition-colors"
                  onClick={() => onPrivateMessage(user.id)}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;