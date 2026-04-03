const mongoose = require('mongoose');

const snippetSchema = new mongoose.Schema({
    title: { type: String, required: true },
    code: { type: String, required: true },
    language: { type: String, required: true },
});

module.exports = mongoose.model('Snippet', snippetSchema);