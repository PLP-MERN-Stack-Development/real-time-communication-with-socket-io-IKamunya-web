import React from 'react';
import { Hash } from 'lucide-react';

const ChannelList = ({ rooms, currentRoom, switchRoom }) => (
  <div className="p-3">
    <h4 className="text-xs text-discord-gray-400 uppercase mb-2">Channels</h4>
    <ul className="space-y-1">
      {rooms.map((r) => (
        <li key={r}>
          <button
            onClick={() => switchRoom(r)}
            className={`w-full flex items-center gap-2 p-2 rounded transition-colors ${
              currentRoom === r
                ? 'bg-discord-gray-700 text-white'
                : 'text-discord-gray-300 hover:bg-discord-gray-800'
            }`}
          >
            <Hash size={16} />
            <span>{r}</span>
          </button>
        </li>
      ))}
    </ul>
  </div>
);

export default ChannelList;