import React from 'react';

const Header = ({ room, usersCount }) => {
  return (
    <div className="flex items-center justify-between p-4 bg-discord-gray-800">
      <div className="flex items-center gap-3">
        <h2 className="text-white font-semibold">#{room}</h2>
        <span className="text-sm text-discord-gray-300">• {usersCount} online</span>
      </div>
      <div className="flex items-center gap-2">
        <button className="text-sm text-discord-gray-200 bg-discord-gray-700 px-3 py-1 rounded hover:bg-discord-gray-600">
          Members
        </button>
      </div>
    </div>
  );
};

export default Header;