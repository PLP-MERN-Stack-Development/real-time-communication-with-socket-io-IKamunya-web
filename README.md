# Real-Time Chat Application with Socket.io

This repository is a real-time chat application built with Socket.io, a Node.js/Express backend, and a React frontend. It demonstrates bidirectional web socket communication, room-based chats, private messaging (DMs), typing indicators, reactions, file sharing, read receipts, message search, and pagination.

## Project Overview

- Backend: Node.js + Express + Socket.io. Handles rooms, users, message history (in-memory for the assignment), typing indicators, reactions, read receipts, and file broadcasting.
- Frontend: React (functional components + hooks) with a small component library and a custom `useSocket` hook that centralizes socket logic and optimistic local updates.
- Intended use: local development and as a learning assignment for real-time communication concepts.

## Features Implemented

- Real-time public messaging scoped to rooms
- Private direct messages (DMs) between users
- User presence (online list) and unread counts
- Typing indicators (live) per-room
- Message reactions (emoji) with per-emoji counts and who reacted
- Read receipts (who has read a message)
- File sharing via base64 (inline images and downloadable files)
- Optimistic local echo for fast UI feedback
- Pagination / lazy-loading of older messages
- Message search within a room
- System messages for user join / leave (room-scoped)
- UI & UX polish: visible reaction button, clearer typing indicator, color-differentiated message bubbles

## Tech Stack

- Node.js (server)
- Express
- Socket.io (v4)
- React (client)
- Tailwind CSS (utility-first styling)

## Repository Structure

```
.
├── client/                 # React front-end
│   ├── public/             # Static assets (place screenshots/gifs here)
│   └── src/                # React source code
│       ├── components/     # UI components (Chat, Message, UsersList, etc.)
│       └── socket/         # useSocket hook & socket setup
├── server/                 # Node.js/Express + Socket.io
│   └── server.js           # Main server logic
├── Week5-Assignment.md     # Assignment instructions (if included)
└── README.md               # This file
```

## Setup & Local Development

Prerequisites:

- Node.js (v16+ recommended; code was validated with Node 18+)
- npm or yarn

1) Clone the repo

```bash
git clone <your-repo-url>
cd real-time-communication-with-socket-io-IKamunya-web
```

2) Install server dependencies

```bash
cd server
npm install
# or: yarn
```

3) Install client dependencies (in a new terminal tab/window)

```bash
cd ../client
npm install
# or: yarn
```

4) Configure environment variables

- Server: no required env vars for local dev. You can set PORT via `.env` if desired.
- Client: set `VITE_SOCKET_URL` if your server is not at `http://localhost:5000`.

Create a `.env` in the `client/` folder if you need to override the socket URL:

```ini
VITE_SOCKET_URL=http://localhost:5000
```

5) Run the server

```bash
# from repo/server
npm start
# or: node server.js
```

Default server port: 5000

6) Run the client

```bash
# from repo/client
npm run dev
# (or: npm start depending on the client setup)
```

Default client port: 5173 (Vite) or 3000 depending on the template. Open the URL shown in the terminal.

7) Testing locally

- Open two browser windows (or a private window) and sign in with two different usernames.
- Join the same room to test public messages, or click DM on a user to test private messaging.

## How to Use (quick guide)

- People list: shows currently connected users. Click "DM" to send a private message.
- Message input: type and press Enter or click send. Attach files through the file control.
- Reactions: use the reaction button shown on each message to add an emoji reaction.
- Typing indicator: shows who is currently typing in the same room.
- System messages: join/leave notifications appear as centered pills in the message stream.

## Screenshots

```markdown
![Login view](/client/public/screenshots/login.png)

![Chat - room view](/client/public/screenshots/chat-room.png)

```

## Features Implemented (detailed)

- Messaging: send and receive messages in real-time within named rooms. Messages include timestamps, sender name, and can be files.
- Rooms: join specific rooms; server emits `room_messages` on join with recent history.
- Private messages: send/receive DMs between sockets.
- Typing indicator: `typing` events broadcast the list of typing users for a room.
- Reactions: `react_message` updates per-message reactions. UI shows emoji counts and who reacted.
- Read receipts: messages track `readBy` and the UI updates when a recipient reads a message.
- Unread counts: server maintains unread counters per user per room and emits `unread_counts` updates.
- File sharing: client sends base64-encoded files; server re-broadcasts as `receive_message` with `isFile`.
- System messages: server now emits system `receive_message` items scoped to specific rooms when a user joins or leaves a room.

## Development Notes & Internals

- The socket logic is centralized in `client/src/socket/socket.js` (a custom `useSocket` hook) which exposes helper functions: `connect`, `joinRoom`, `sendMessage`, `sendFile`, `sendPrivateMessage`, `setTyping`, `reactMessage`, `markRead`, etc.
- Server stores data in-memory (arrays/objects). This is OK for the assignment/demo but not for production.
- Important socket events (client ↔ server):
  - `user_join` / `user_list` / `user_joined` / `user_left`
  - `join_room` / `room_joined` / `room_messages` / `room_users`
  - `send_message` / `receive_message`
  - `private_message`
  - `typing` / `typing_users`
  - `react_message` / `message_reacted`
  - `read_message` / `message_read`

## Troubleshooting

- If messages don't appear: check browser console for socket connection errors and server logs for failures. Ensure `VITE_SOCKET_URL` points to the server.
- CORS: server is configured with wide-open CORS for local development. On production tighten the `origin` setting in `server/server.js`.
- If a client cannot join a room, confirm the server is running and that the client is sending `join_room` with the correct room name.

## Tests & Manual Verification

Manual test checklist:

1. Start the server and client.
2. Open two browser windows with two different usernames.
3. Join the same room and exchange messages.
4. Verify reactions are visible and counts update on both sides.
5. Send a DM and confirm only sender & recipient receive it.
6. Upload an image file and verify inline preview.
7. Have one user type — the other should see the typing indicator.

Automated tests are not included for this assignment, but a good next step is to add unit tests for socket event handlers and small integration tests using Playwright or Cypress.

## Contribution

This project is an educational assignment. If you want to extend it:

- Persist messages to a database (MongoDB/Postgres)
- Add authentication (JWT / sessions)
- Add file storage for uploads (S3 or similar)
- Add end-to-end tests and CI integration

## License

MIT — feel free to use and adapt for learning or demos.

---

# Real-Time Chat Application with Socket.io

This assignment focuses on building a real-time chat application using Socket.io, implementing bidirectional communication between clients and server.

## Assignment Overview

You will build a chat application with the following features:
1. Real-time messaging using Socket.io
2. User authentication and presence
3. Multiple chat rooms or private messaging
4. Real-time notifications
5. Advanced features like typing indicators and read receipts

## Project Structure

```
socketio-chat/
├── client/                 # React front-end
│   ├── public/             # Static files
│   ├── src/                # React source code
│   │   ├── components/     # UI components
│   │   ├── context/        # React context providers
│   │   ├── hooks/          # Custom React hooks
│   │   ├── pages/          # Page components
│   │   ├── socket/         # Socket.io client setup
│   │   └── App.jsx         # Main application component
│   └── package.json        # Client dependencies
├── server/                 # Node.js back-end
│   ├── config/             # Configuration files
│   ├── controllers/        # Socket event handlers
│   ├── models/             # Data models
│   ├── socket/             # Socket.io server setup
│   ├── utils/              # Utility functions
│   ├── server.js           # Main server file
│   └── package.json        # Server dependencies
└── README.md               # Project documentation
```

## Getting Started

1. Accept the GitHub Classroom assignment invitation
2. Clone your personal repository that was created by GitHub Classroom
3. Follow the setup instructions in the `Week5-Assignment.md` file
4. Complete the tasks outlined in the assignment

## Files Included

- `Week5-Assignment.md`: Detailed assignment instructions
- Starter code for both client and server:
  - Basic project structure
  - Socket.io configuration templates
  - Sample components for the chat interface

## Requirements

- Node.js (v18 or higher)
- npm or yarn
- Modern web browser
- Basic understanding of React and Express

## Submission

Your work will be automatically submitted when you push to your GitHub Classroom repository. Make sure to:

1. Complete both the client and server portions of the application
2. Implement the core chat functionality
3. Add at least 3 advanced features
4. Document your setup process and features in the README.md
5. Include screenshots or GIFs of your working application
6. Optional: Deploy your application and add the URLs to your README.md

## Resources

- [Socket.io Documentation](https://socket.io/docs/v4/)
- [React Documentation](https://react.dev/)
- [Express.js Documentation](https://expressjs.com/)
- [Building a Chat Application with Socket.io](https://socket.io/get-started/chat) 