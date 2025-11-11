import React from 'react';
import { Bell } from 'lucide-react';

const StatusDot = ({ online }) => (
  <span className={`w-3 h-3 rounded-full ${online ? 'bg-green-400' : 'bg-red-500'} inline-block`} />
);

export default function UsersList({ users = [], unreadCounts = {}, socketId, onClose, onPrivateMessage }) {
  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-4 flex items-center justify-between border-b border-[#151618]">
        <div className="font-semibold">People</div>
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-md hover:bg-gray-800"><Bell size={16} /></button>
          {onClose && (
            <button onClick={onClose} className="px-2 py-1 text-sm text-gray-400">Close</button>
          )}
        </div>
      </div>

      <div className="p-3 overflow-y-auto space-y-2">
        {users.map((u) => (
          <div key={u.id} className="flex items-center gap-3 p-2 rounded-md hover:bg-[#0f1113]">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-[#202326] flex items-center justify-center text-sm font-semibold text-white">{u.username?.charAt(0)?.toUpperCase()}</div>
              <div className="absolute -bottom-0.5 -right-0.5">
                <StatusDot online={true} />
              </div>
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium truncate">{u.username}{u.id === socketId ? ' (you)' : ''}</div>
              <div className="text-xs text-gray-400">{u.status || 'online'}</div>
            </div>
            {/* optional unread badge by username key */}
            {unreadCounts && unreadCounts[u.username] > 0 && (
              <div className="bg-amber-500 text-[#0b0c0d] text-xs px-2 py-0.5 rounded-md">{unreadCounts[u.username]}</div>
            )}
            {/* Quick DM button */}
            {onPrivateMessage && u.id !== socketId && (
              <button onClick={() => onPrivateMessage(u.id)} className="ml-2 text-xs px-2 py-1 bg-indigo-600 rounded text-white hover:bg-indigo-500">DM</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
