const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Signup
router.post('/signup', async (req, res) => {
    try {
        const { username, firstname, lastname, password } = req.body;

        const existingUser = await User.findOne({ username: username.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({ error: 'Username already exists' });
        }

        const user = new User({ username, firstname, lastname, password });
        await user.save();

        res.status(201).json({ message: 'User created successfully', username: user.username });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ error: 'Username already exists' });
        }
        res.status(500).json({ error: err.message });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await User.findOne({ username: username.toLowerCase() });
        if (!user) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        res.json({
            message: 'Login successful',
            username: user.username,
            firstname: user.firstname,
            lastname: user.lastname
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
