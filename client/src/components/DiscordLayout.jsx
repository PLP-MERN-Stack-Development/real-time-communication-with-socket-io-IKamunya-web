import React from 'react';
import ChannelList from './ChannelList';
import MembersList from './MembersList';

const DiscordLayout = ({ rooms, currentRoom, switchRoom, users, username, children, onPrivateMessage }) => (
  <div className="flex min-h-screen w-full">
    <aside className="w-72 bg-discord-gray-900 flex flex-col">
      <div className="p-3 border-b border-discord-gray-800">
        <h1 className="text-white text-lg font-bold">Workspace</h1>
      </div>
      <ChannelList rooms={rooms} currentRoom={currentRoom} switchRoom={switchRoom} />
      <MembersList users={users} username={username} onPrivateMessage={onPrivateMessage} />
    </aside>
    <main className="flex-1 bg-discord-gray-950 text-white flex flex-col">
      {children}
    </main>
    <aside className="w-80 bg-discord-gray-900 border-l border-discord-gray-800 p-3 hidden md:block">
      <h4 className="text-xs text-discord-gray-400 uppercase mb-2">About</h4>
      <p className="text-sm text-discord-gray-300">A real-time chat application inspired by Discord UI</p>
    </aside>
  </div>
);

export default DiscordLayout;