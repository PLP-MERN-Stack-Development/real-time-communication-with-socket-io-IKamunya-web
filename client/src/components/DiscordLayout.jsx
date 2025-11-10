import React from 'react';
import ChannelList from './ChannelList';

const DiscordLayout = ({ rooms, currentRoom, switchRoom, users, username, children, onPrivateMessage }) => (
  <div className="flex min-h-screen w-full">
    <aside className="w-72 bg-discord-gray-900 flex flex-col">
      <div className="p-3 border-b border-discord-gray-800">
        <h1 className="text-white text-lg font-bold">Workspace</h1>
      </div>
  <ChannelList rooms={rooms} currentRoom={currentRoom} switchRoom={switchRoom} />
    </aside>
    <main className="flex-1 bg-discord-gray-950 text-white flex flex-col">
      {children}
    </main>
  </div>
);

export default DiscordLayout;