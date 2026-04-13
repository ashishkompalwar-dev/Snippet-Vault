require('dns').setDefaultResultOrder('ipv4first');
const cors = require('cors');
const express = require('express');
require("dotenv").config();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require("mongoose")

const User = require('./models/User');
const Snippet = require('./models/Snippet');

const app = express();
const PORT = Number(process.env.PORT) || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "dev-only-secret";

// Middleware
app.use(express.json());
app.use(cors());
app.disable('x-powered-by');

function createToken(userId) {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
}

function toUserResponse(user) {
    return {
        _id: user._id,
        name: user.name,
        email: user.email,
    };
}

function requireAuth(req, res, next) {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";

    if (!token) {
        return res.status(401).json({ message: "Authorization token missing." });
    }

    try {
        const payload = jwt.verify(token, JWT_SECRET);
        req.userId = payload.userId;
        return next();
    } catch (error) {
        return res.status(401).json({ message: "Invalid or expired token." });
    }
}

const api = express.Router();

// ---------------- DB CONNECTION FIRST ----------------

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));
// ---------------- ROUTES ----------------

// Signup
api.post('/auth/signup', async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: "Name, email and password are required." });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
        return res.status(409).json({ message: "Email is already registered." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
        name: String(name).trim(),
        email: normalizedEmail,
        password: hashedPassword
    });

    await user.save();

    const token = createToken(user._id);

    res.status(201).json({
        message: "User registered successfully.",
        token,
        user: toUserResponse(user),
    });
});

// Login
api.post('/auth/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required." });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
        return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = createToken(user._id);

    res.json({
        message: "Login successful.",
        token,
        user: toUserResponse(user),
    });
});

// Get all note snippets
api.get('/snippets', async (req, res) => {
    const snippets = await Snippet.find()
        .sort({ createdAt: -1 })
        .populate('owner', 'name email');

    res.json(snippets);
});

// Create note snippet (auth required)
api.post('/snippets', requireAuth, async (req, res) => {
    const { title, content } = req.body;

    if (!title || !content) {
        return res.status(400).json({ message: "Title and note text are required." });
    }

    try {
        const snippet = new Snippet({
            title: String(title).trim(),
            content: String(content).trim(),
            owner: req.userId,
        });

        await snippet.save();

        await snippet.populate('owner', 'name email');

        res.json({ message: "Snippet created successfully", snippet });
    } catch (err) {
        res.status(500).json({ message: "Error creating snippet", error: err.message });
    }
});

// Delete snippet (owner only)
api.delete('/snippets/:id', requireAuth, async (req, res) => {
    const snippet = await Snippet.findById(req.params.id);

    if (!snippet) {
        return res.status(404).json({ message: "Snippet not found." });
    }

    if (String(snippet.owner) !== String(req.userId)) {
        return res.status(403).json({ message: "You can only delete your own snippets." });
    }

    await snippet.deleteOne();
    res.json({ message: "Snippet deleted successfully" });
});

// Update snippet (owner only)
api.put('/snippets/:id', requireAuth, async (req, res) => {
    const { title, content } = req.body;

    const snippet = await Snippet.findById(req.params.id);

    if (!snippet) {
        return res.status(404).json({ message: "Snippet not found." });
    }

    if (String(snippet.owner) !== String(req.userId)) {
        return res.status(403).json({ message: "You can only edit your own snippets." });
    }

    snippet.title = title ? String(title).trim() : snippet.title;
    snippet.content = content ? String(content).trim() : snippet.content;

    await snippet.save();
    await snippet.populate('owner', 'name email');

    res.json(snippet);
});

app.get('/', (req, res) => {
    res.json({
        ok: true,
        message: 'Snippet Vault API is running.',
        docs: '/api',
    });
});

app.get('/api', (req, res) => {
    res.json({
        ok: true,
        service: 'snippet-vault',
        routes: {
            signup: 'POST /api/auth/signup',
            login: 'POST /api/auth/login',
            listSnippets: 'GET /api/snippets',
            createSnippet: 'POST /api/snippets',
            updateSnippet: 'PUT /api/snippets/:id',
            deleteSnippet: 'DELETE /api/snippets/:id',
        },
    });
});

app.use('/api', api);

app.use((req, res) => {
    res.status(404).json({
        message: 'Route not found.',
        path: req.originalUrl,
    });
});

app.use((error, req, res, next) => {
    if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
        return res.status(400).json({ message: 'Invalid JSON payload.' });
    }

    const statusCode = error.status || 500;
    return res.status(statusCode).json({
        message: statusCode === 500 ? 'Internal server error.' : error.message,
    });
});

// ---------------- START SERVER LAST ----------------
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});