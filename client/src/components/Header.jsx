import React from 'react';
import { Search } from 'lucide-react';

const Header = ({ room, usersCount, isConnected, onSearch }) => {
  return (
    <div className="flex items-center justify-between p-4 bg-discord-gray-800">
      <div className="flex items-center gap-3">
        <h2 className="text-white font-semibold">#{room}</h2>
        <span className="text-sm text-discord-gray-300">• {usersCount} online</span>
        <span className="text-sm ml-3">
          <span className={`inline-block w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-500'} mr-2`} />
          <span className="text-xs text-discord-gray-300">{isConnected ? 'connected' : 'disconnected'}</span>
        </span>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={onSearch} className="p-2 rounded-md hover:bg-gray-700 text-gray-300">
          <Search size={18} />
        </button>
        <button className="text-sm text-discord-gray-200 bg-discord-gray-700 px-3 py-1 rounded hover:bg-discord-gray-600">
          Members
        </button>
      </div>
    </div>
  );
};

export default Header;