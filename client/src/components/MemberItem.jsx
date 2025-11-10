import React from 'react';

const MemberItem = ({ user, isSelf, onPrivateMessage }) => (
  <div className={`flex items-center gap-3 p-2 rounded-md hover:bg-discord-gray-800 transition-colors ${isSelf ? 'bg-discord-gray-800' : ''}`}>
    <div className={`w-9 h-9 rounded-full flex items-center justify-center ${isSelf ? 'bg-discord-primary text-white' : 'bg-discord-gray-600 text-discord-gray-200'} font-semibold`}> 
      {user.username.charAt(0).toUpperCase()}
    </div>
    <div className="flex-1 text-sm overflow-hidden">
      <div className="text-discord-gray-200 font-medium truncate">{user.username}{isSelf ? ' (you)' : ''}</div>
      <div className="text-discord-gray-400 text-xs">{user.status || 'Online'}</div>
    </div>
    {!isSelf && (
      <button onClick={() => onPrivateMessage(user.id)} className="text-discord-gray-300 hover:text-white text-xs px-2 py-1 rounded">Message</button>
    )}
  </div>
);

export default MemberItem;