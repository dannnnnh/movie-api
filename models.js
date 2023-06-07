const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

/**
 * Mongoose schema for a movie.
 * @typedef {Object} Movie
 * @property {string} Title - The title of the movie.
 * @property {string} Description - The description of the movie.
 * @property {Object} Genre - The genre of the movie.
 * @property {string} Genre.Name - The name of the genre.
 * @property {string} Genre.Description - The description of the genre.
 * @property {Object} Director - The director of the movie.
 * @property {string} Director.Name - The name of the director.
 * @property {string} Director.Bio - The bio of the director.
 * @property {Array.<string>} Actors - The actors in the movie.
 * @property {string} ImagePath - The path to the image of the movie.
 * @property {boolean} Featured - Whether the movie is featured or not.
 */
let movieSchema = new mongoose.Schema({
  Title: { type: String, required: true },
  Description: { type: String, required: true },
  Genre: {
    Name: String,
    Description: String,
  },
  Director: {
    Name: String,
    Bio: String,
  },
  Actors: [String],
  ImagePath: String,
  Featured: Boolean,
});

/**
 * Mongoose schema for a user.
 * @typedef {Object} User
 * @property {string} Username - The username of the user.
 * @property {string} Password - The password of the user.
 * @property {string} Email - The email of the user.
 * @property {Date} Birthday - The birthday of the user.
 * @property {Array.<mongoose.Schema.Types.ObjectId>} FavoriteMovies - The favorite movies of the user.
 */
let userSchema = new mongoose.Schema({
  Username: { type: String, required: true },
  Password: { type: String, required: true },
  Email: { type: String, required: true },
  Birthday: Date,
  FavoriteMovies: [{ type: mongoose.Schema.Types.ObjectId, ref: "Movie" }],
});

/**
 * Hashes the password.
 * @param {string} password - The password to hash.
 * @returns {string} - The hashed password.
 * @throws Will throw an error if the password is not provided.
 */
userSchema.statics.hashPassword = function (password) {
  if (!password) {
    throw new Error("Password is required");
  }
  return bcrypt.hashSync(password, 10);
};

/**
 * Validates the password.
 * @param {string} password - The password to validate.
 * @returns {boolean} - True if the password is valid, false otherwise.
 */
userSchema.methods.validatePassword = function (password) {
  return bcrypt.compareSync(password, this.Password);
};

/**
 * Mongoose model for the Movie schema.
 * @type {mongoose.Model}
 */
let Movie = mongoose.model("Movie", movieSchema);

/**
 * Mongoose model for the User schema.
 * @type {mongoose.Model}
 */
let User = mongoose.model("User", userSchema);

module.exports.Movie = Movie;
module.exports.User = User;
