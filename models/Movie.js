
const mongoose = require("mongoose");

const movieSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },

  // Keep this field for compatibility with the current app
  genre: {
    type: String,
    required: true,
    trim: true
  },

  // Supports movies belonging to multiple genres
  genres: {
    type: [String],
    default: []
  },

  year: {
    type: Number,
    required: true
  },

  releaseDate: {
    type: Date,
    default: null
  },

  language: {
    type: String,
    default: "",
    trim: true
  },

  duration: {
    type: Number,
    default: null,
    min: 1
  },

  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 10
  },

  description: {
    type: String,
    default: ""
  },

  poster: {
    type: String,
    default: ""
  },

  director: {
    type: String,
    default: ""
  },

  cast: {
    type: [String],
    default: []
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("Movie", movieSchema);
