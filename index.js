const express = require("express");
const morgan = require("morgan");
const app = express();
uuid = require("uuid");

// Define an array of objects containing data about your top 10 movies
const movies = [
  {
    title: "The Good, the Bad and the Ugly",
    year: 1966,
    genre: {
      name: "Western",
      description:
        "A bounty hunting scam joins two men in an uneasy alliance against a third in a race to find a fortune in gold buried in a remote cemetery.",
    },
    director: {
      name: "Sergio Leone",
      bio: "Sergio Leone was an Italian film director, producer, and screenwriter, credited as the inventor of the Spaghetti Western genre.",
      birthYear: 1929,
      deathYear: 1989,
    },
    imageUrl: "https://www.imdb.com/title/tt0060196/mediaviewer/rm1092517376",
    featured: true,
  },
  {
    title: "Inception",
    year: 2010,
    genre: {
      name: "Sci-Fi",
      description:
        "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
    },
    director: {
      name: "Christopher Nolan",
      bio: "Christopher Nolan is a British-American film director, producer, and screenwriter. He is known for his distinctive, non-linear storytelling style and his work on blockbuster films such as The Dark Knight Trilogy, Inception, and Interstellar.",
      birthYear: 1970,
      deathYear: null,
    },
    imageUrl: "https://www.imdb.com/title/tt1375666/mediaviewer/rm4068450560/",
    featured: true,
  },
  {
    title: "Star Wars",
    year: 1977,
    genre: {
      name: "Adventure",
      description:
        "The Imperial Forces, under orders from cruel Darth Vader, hold Princess Leia hostage in their efforts to quell the rebellion against the Galactic Empire.",
    },
    director: {
      name: "George Lucas",
      bio: "George Lucas is an American filmmaker, philanthropist, and entrepreneur. He is best known for creating the Star Wars and Indiana Jones franchises and founding Lucasfilm and Industrial Light & Magic.",
      birthYear: 1944,
      deathYear: null,
    },
    imageUrl: "https://www.imdb.com/title/tt0076759/mediaviewer/rm2453100032/",
    featured: true,
  },
  {
    title: "The Lord of the Rings: The Return of the King",
    year: 2003,
    genre: {
      name: "Adventure",
      description:
        "Gandalf and Aragorn lead the World of Men against Sauron's army to draw his gaze from Frodo and Sam as they approach Mount Doom with the One Ring.",
    },
    director: {
      name: "Peter Jackson",
      bio: "Peter Jackson is a New Zealand film director, screenwriter, and film producer. He is best known for directing The Lord of the Rings film trilogy and the Hobbit film trilogy, both of which are based on the novels by J.R.R. Tolkien.",
      birthYear: 1961,
      deathYear: null,
    },
    imageUrl: "https://www.imdb.com/title/tt0167260/mediaviewer/rm2237120768/",
    featured: true,
  },
  {
    title: "Pulp Fiction",
    year: 1994,
    genre: {
      name: "Drama",
      description:
        "The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption.",
    },
    director: {
      name: "Quentin Tarantino",
      bio: "Quentin Tarantino is an American film director, screenwriter, producer, and actor. He is known for his distinctive, nonlinear narrative style and his love for genre films, particularly crime and martial arts movies.",
      birthYear: 1963,
      deathYear: null,
    },
    imageUrl: "https://www.imdb.com/title/tt0110912/mediaviewer/rm1677240321/",
    featured: true,
  },

  {
    title: "Fight Club",
    year: 1999,
    genre: {
      name: "Drama",
      description:
        "An insomniac office worker and a devil-may-care soapmaker form an underground fight club that evolves into something much, much more.",
    },
    director: {
      name: "David Fincher",
      bio: "David Fincher is an American film director, producer, and screenwriter, known for his stylish and technically innovative filmmaking.",
      birthYear: 1962,
      deathYear: null,
    },
    imageUrl: "https://www.imdb.com/title/tt0137523/mediaviewer/rm3873225216",
    featured: true,
  },
];

const users = [
  {
    id: 1,
    name: "kim",
    favoriteMovies: [],
  },
  {
    id: 2,
    name: "Tim",
    favoriteMovies: ["Matrix"],
  },
];

app.use(express.json());

//READ - GET LIST OF USERS
app.get("/users", (req, res) => {
  res.status(200).json(users);
});

//POST - CREATE NEW USER
app.post("/users", (req, res) => {
  const newUser = req.body;
  if (newUser.name) {
    newUser.id = uuid.v4();
    users.push(newUser);
    res.status(201).json(newUser);
  } else {
    res.status(400).send("users need names");
  }
});

//READ - GET LIST OF ALL MOVIES
app.get("/movies", (req, res) => {
  // Send the movies array as a JSON response
  res.status(200).json(movies);
});

//READ - FIND MOVIE BY A TITLE
app.get("/movies/title/:title", (req, res) => {
  const { title } = req.params;
  const movie = movies.find((movie) => movie.title === title);

  if (movie) {
    res.status(200).json(movie);
  } else {
    res.status(400).send("No such movie.");
  }
});

//READ - FIND MOVIE BY GENRE
app.get("/movies/genre/:genreName", (req, res) => {
  const { genreName } = req.params;
  const genre = movies.find((movie) => movie.genre.name === genreName).genre;

  if (genre) {
    res.status(200).json(genre.genre);
  } else {
    res.status(400).send("No movies found with that genre.");
  }
});

//READ - FIND DIRECTOR
app.get("/movies/directors/:directorName", (req, res) => {
  const { directorName } = req.params;
  const director = movies.find(
    (movie) => movie.director.name === directorName
  )?.director;

  if (director) {
    res.status(200).json(director);
  } else {
    res.status(400).send("No movies found with that director.");
  }
});

//PUT (UPDATE) -  UPDATE USERNAME
app.put("/users/:id", (req, res) => {
  const { id } = req.params;
  const updatedUser = req.body;

  let user = users.find((user = user.id == id));

  if (user) {
    user.name = updatedUser.name;
    res.status(200).json(user);
  } else {
    res.status(400).send("no such user");
  }
}); // <-- add this closing bracket

//CREATE - ADD MOVIE TO USER'S FAVORITE MOVIES
app.post("/users/:id/:movie/movieTitle", (req, res) => {
  const { id, movieTitle } = req.params;
  let user = users.find((user = user.id == id));
  if (user) {
    user.favoriteMovies.push(movieTitle);
    res
      .status(200)
      .send(`${movieName} has been added to ${id}'s favorite movies`);
  } else {
    res.status(400).send("no such user");
  }
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
  // Return a specific error message to the client
  res.status(err.status || 500).send(err.message || "Something broke!");
});

// Start the server
app.listen(3000, () => {
  console.log("Server started on port 3000");
});
