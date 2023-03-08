const express = require("express");
const morgan = require("morgan");
const app = express();

// Define an array of objects containing data about your top 10 movies
const movies = [
  { title: "Matrix", year: 1994 },
  { title: "The Godfather", year: 1972 },
  { title: "Harry Potter", year: 2001 },
  { title: "The Dark Knight", year: 2008 },
  { title: "Inception", year: 2010 },
  { title: "Star Wars", year: 1977 },
  { title: "The Lord of the Rings: The Return of the King", year: 2003 },
  { title: "Pulp Fiction", year: 1994 },
  { title: "The Good, the Bad and the Ugly", year: 1966 },
  { title: "Fight Club", year: 1999 },
];

// Define a route handler for the "/movies" endpoint
app.get("/movies", (req, res) => {
  // Send the movies array as a JSON response
  res.json(movies);
});

// Define a route handler for the "/" endpoint
app.get("/", (req, res) => {
  // Send a default textual response
  res.send("Welcome to my movie club!");
});

// Serve the "documentation.html" file from the public folder
app.use(express.static("public"));

// Use the Morgan middleware library to log all requests
app.use(morgan("combined"));

// Define an error-handling middleware function
app.use((err, req, res, next) => {
  // Log the error to the terminal
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

// Start the server
app.listen(3000, () => {
  console.log("Server started on port 3000");
});
