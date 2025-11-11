import React from 'react';
import { Hash } from 'lucide-react';

const ChannelList = ({ rooms, currentRoom, switchRoom, unreadCounts = {} }) => (
  <div className="p-4">
    <h4 className="text-xs text-discord-gray-400 uppercase mb-3 tracking-wider">Channels</h4>
    <ul className="space-y-2">
      {rooms.map((r) => (
        <li key={r}>
          <button
            onClick={() => switchRoom(r)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm ${
              currentRoom === r
                ? 'bg-discord-gray-700 text-white font-semibold'
                : 'text-discord-gray-300 hover:bg-discord-gray-800'
            }`}
          >
            <Hash size={16} />
            <span className="truncate">{r}</span>
            {unreadCounts && unreadCounts[r] > 0 && (
              <span className="ml-auto bg-amber-500 text-[#0b0c0d] text-xs px-2 py-0.5 rounded-md">{unreadCounts[r]}</span>
            )}
          </button>
        </li>
      ))}
    </ul>
  </div>
);

export default ChannelList;