const mongoose = require('mongoose');

// Create a schema for the documents
const animeSchema = new mongoose.Schema({
  anime_id: Number,
  Name: String,
  Genres: String,
  Ranked: Number,
  Image: String,
  isUpdating: { type: Boolean, default: false }, // Temporary flag
});

// Explicitly set the collection name
const Anime = mongoose.model('Anime', animeSchema, 'animelist');

module.exports = Anime;
