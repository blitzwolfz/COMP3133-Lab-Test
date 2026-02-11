require('dotenv').config();
const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const { Server } = require('socket.io');
const path = require('path');

const userRoutes = require('./routes/userRoutes');
const GroupMessage = require('./models/GroupMessage');
const PrivateMessage = require('./models/PrivateMessage');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'view')));

// API Routes
app.use('/api', userRoutes);

// Page routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'view', 'login.html'));
});

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Track connected users: { socketId: { username, room } }
const connectedUsers = {};

// Socket.io
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Join room
    socket.on('joinRoom', async ({ username, room }) => {
        socket.join(room);
        connectedUsers[socket.id] = { username, room };

        // Send room history
        const messages = await GroupMessage.find({ room }).sort({ date_sent: 1 }).limit(50);
        socket.emit('roomHistory', messages);

        // Notify room
        socket.to(room).emit('message', {
            from_user: 'Chat App Bot',
            message: `${username} has joined the chat`,
            date_sent: new Date()
        });

        // Send welcome message to the user
        socket.emit('message', {
            from_user: 'Chat App Bot',
            message: `Welcome to chat app :)`,
            date_sent: new Date()
        });

        // Update user list for the room
        const roomUsers = Object.values(connectedUsers)
            .filter(u => u.room === room)
            .map(u => u.username);
        io.to(room).emit('roomUsers', roomUsers);
    });

    // Room message
    socket.on('chatMessage', async ({ username, room, message }) => {
        const msg = new GroupMessage({
            from_user: username,
            room,
            message,
            date_sent: new Date()
        });
        await msg.save();

        io.to(room).emit('message', {
            from_user: username,
            room,
            message,
            date_sent: msg.date_sent
        });
    });

    // Private message
    socket.on('privateMessage', async ({ from_user, to_user, message }) => {
        const msg = new PrivateMessage({
            from_user,
            to_user,
            message,
            date_sent: new Date()
        });
        await msg.save();

        // Find recipient socket
        const recipientSocket = Object.entries(connectedUsers)
            .find(([, u]) => u.username === to_user);

        if (recipientSocket) {
            io.to(recipientSocket[0]).emit('privateMessage', {
                from_user,
                to_user,
                message,
                date_sent: msg.date_sent
            });
        }

        // Also send back to sender
        socket.emit('privateMessage', {
            from_user,
            to_user,
            message,
            date_sent: msg.date_sent
        });
    });

    // Typing indicator
    socket.on('typing', ({ username, room }) => {
        socket.to(room).emit('typing', { username });
    });

    socket.on('stopTyping', ({ username, room }) => {
        socket.to(room).emit('stopTyping', { username });
    });

    // Leave room
    socket.on('leaveRoom', ({ username, room }) => {
        socket.leave(room);
        delete connectedUsers[socket.id];

        socket.to(room).emit('message', {
            from_user: 'Chat App Bot',
            message: `${username} has left the chat`,
            date_sent: new Date()
        });

        // Update user list
        const roomUsers = Object.values(connectedUsers)
            .filter(u => u.room === room)
            .map(u => u.username);
        io.to(room).emit('roomUsers', roomUsers);
    });

    // Disconnect
    socket.on('disconnect', () => {
        const user = connectedUsers[socket.id];
        if (user) {
            socket.to(user.room).emit('message', {
                from_user: 'Chat App Bot',
                message: `${user.username} has left the chat`,
                date_sent: new Date()
            });

            const room = user.room;
            delete connectedUsers[socket.id];

            const roomUsers = Object.values(connectedUsers)
                .filter(u => u.room === room)
                .map(u => u.username);
            io.to(room).emit('roomUsers', roomUsers);
        }
        console.log('User disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
