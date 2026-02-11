# COMP3133 Lab Test 1 - Chat Application

A real-time chat application built with Socket.io, Express, and MongoDB. Users can sign up, log in, join predefined chat rooms, send group messages, send private messages to other users, and see typing indicators.

## Tech Stack

- **Backend:** Node.js, Express, Socket.io, Mongoose
- **Frontend:** HTML5, CSS, Bootstrap 5, jQuery, Fetch API
- **Database:** MongoDB

## Features

- User signup and login with password hashing (bcrypt)
- Session management using localStorage
- Predefined chat rooms (DevOps, Cloud Computing, COVID-19, Sports, NodeJS)
- Join and leave rooms
- Real-time group messaging within rooms
- Private messaging between users in the same room
- Typing indicator ("user is typing...")
- All messages stored in MongoDB
- Logout functionality

## Setup

1. Clone the repository

```
git clone https://github.com/<your-username>/studentID_lab_test1_chat_app.git
cd studentID_lab_test1_chat_app
```

2. Install dependencies

```
npm install
```

3. Create a `.env` file in the root directory

```
MONGODB_URI=your_mongodb_connection_string
PORT=3000
```

4. Start the server

```
npm start
```

5. Open `http://localhost:3000` in your browser

## Project Structure

```
├── server.js                # Main server file (Express + Socket.io)
├── .env                     # Environment variables (not committed)
├── .gitignore
├── package.json
├── models/
│   ├── User.js              # User schema
│   ├── GroupMessage.js       # Group/room message schema
│   └── PrivateMessage.js     # Private message schema
├── routes/
│   └── userRoutes.js         # Signup and login API routes
└── view/
    ├── login.html            # Login page
    ├── signup.html           # Signup page
    └── chat.html             # Chat room page
```

## MongoDB Schemas

**User** - stores registered users with hashed passwords and unique usernames

**GroupMessage** - stores messages sent within a chat room (from_user, room, message, date_sent)

**PrivateMessage** - stores direct messages between two users (from_user, to_user, message, date_sent)

## How It Works

1. New users register on the signup page. Usernames must be unique.
2. After logging in, the username is saved to localStorage to maintain the session.
3. Users pick a room from the dropdown and click "Join Chat Room."
4. Messages are sent and received in real time through Socket.io. All messages are saved to MongoDB.
5. Users can send private messages by selecting a user from the sidebar dropdown.
6. A typing indicator appears when another user in the room is typing.
7. Clicking "Leave Room" returns to the room selection screen. Clicking "Logout" clears the session and returns to the login page.
