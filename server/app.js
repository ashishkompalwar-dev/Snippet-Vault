const cors = require('cors');
const express = require('express');
require("dotenv").config();
const bcrypt = require('bcryptjs');

const User = require('./models/User');
const Snippet = require('./models/Snippet');

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
    origin:
    "https://69cbf3603b56b01c1c2a69fb--incomparable-unicorn-65b871.netlify.app/"
}));

// ---------------- DB CONNECTION FIRST ----------------

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));
// ---------------- ROUTES ----------------

// Signup
app.post('/signup', async (req, res) => {
    const { name, email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
        name,
        email,
        password: hashedPassword
    });

    await user.save();

    res.send("User Registered Successfully ✅");
});

// Login
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
        return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(400).json({ message: "Invalid credentials" });
    }

    res.json({ message: "Login successful ✅" });
});

//get route
app.get('/snippets', async (req, res) => {
    const snippets = await Snippet.find();
    res.json(snippets);
});

// Create Snippet
app.post('/snippets', async (req, res) => {
    const { title, code, language } = req.body;

    try {
        const snippet = new Snippet({ title, code, language });
        await snippet.save();
        res.json({ message: "Snippet created successfully", snippet });
    } catch (err) {
        res.status(500).json({ message: "Error creating snippet", error: err.message });
    }
});

//delete snippet
app.delete('/snippets/:id', async (req, res) => {
    await Snippet.findByIdAndDelete(req.params.id);
    res.json({ message: "Snippet deleted successfully" });
});

//update snippet
app.put('/snippets/:id', async (req, res) => {
    const { title, code, language } = req.body;

    const updatedSnippet = await Snippet.findByIdAndUpdate(
        req.params.id,
        { title, code, language },
        { new: true }
    );

    res.json(updatedSnippet);
});

// Test route
app.get('/', (req, res) => {
    res.send('Server is running 🚀');
});

// ---------------- START SERVER LAST ----------------
app.listen(5000, () => {
    console.log('Server started on port 5000');
});