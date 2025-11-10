import React from 'react';
import MemberItem from './MemberItem';

const MembersList = ({ users, username, onPrivateMessage }) => (
  <div className="p-3 overflow-y-auto flex-1">
    <h4 className="text-xs text-discord-gray-400 uppercase mb-3 tracking-wider">Members</h4>
    <div className="space-y-2">
      {users.map(u => (
        <MemberItem key={u.id} user={u} isSelf={u.username === username} onPrivateMessage={onPrivateMessage} />
      ))}
    </div>
  </div>
);

export default MembersList;