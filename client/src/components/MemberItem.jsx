import React from 'react';

const MemberItem = ({ user, isSelf, onPrivateMessage }) => (
  <div className={`flex items-center gap-3 p-2 rounded hover:bg-discord-gray-700 ${isSelf ? 'bg-discord-gray-700' : ''}`}>
    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isSelf ? 'bg-discord-primary text-white' : 'bg-discord-gray-600 text-discord-gray-200'}`}>
      {user.username.charAt(0).toUpperCase()}
    </div>
    <div className="flex-1 text-sm">
      <div className="text-discord-gray-200 font-medium">{user.username}{isSelf ? ' (you)' : ''}</div>
      <div className="text-discord-gray-400 text-xs">{user.status || 'Online'}</div>
    </div>
    {!isSelf && (
      <button onClick={() => onPrivateMessage(user.id)} className="text-discord-gray-300 hover:text-white">Message</button>
    )}
  </div>
);

export default MemberItem;