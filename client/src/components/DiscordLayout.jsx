import React from 'react';
import ChannelList from './ChannelList';
import ConversationsList from './ConversationsList';

const DiscordLayout = ({ rooms, currentRoom, switchRoom, users, username, children, onPrivateMessage, conversations = [], onSelectConversation, unreadCounts, isConnected }) => (
  <div className="flex min-h-screen w-full">
    <aside className="w-72 bg-discord-gray-900 flex flex-col overflow-hidden">
      <div className="p-3 border-b border-discord-gray-800">
        <h1 className="text-white text-lg font-bold">Workspace</h1>
      </div>
      <div className="flex-1 overflow-y-auto">
        <ChannelList rooms={rooms} currentRoom={currentRoom} switchRoom={switchRoom} unreadCounts={unreadCounts} />
        <div className="border-t border-discord-gray-800">
          <ConversationsList conversations={conversations} currentUsername={username} onSelectConversation={onSelectConversation} />
        </div>
      </div>
    </aside>
    <main className="flex-1 bg-discord-gray-950 text-white flex flex-col">
      {children}
    </main>
  </div>
);

export default DiscordLayout;