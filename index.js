const bodyParser = require("body-parser");
const express = require("express");
const app = express();
const uuid = require("uuid");
const morgan = require("morgan");
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const Models = require("./models.js");
const cors = require("cors");
const bcrypt = require("bcrypt");

// Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const accessLogStream = fs.createWriteStream(path.join(__dirname, "log.txt"), {
  flags: "a",
});
app.use(morgan("common", { stream: accessLogStream }));
app.use(express.static("public"));

let allowedOrigins = [
  "http://localhost:8080",
  "http://localhost:1234",
  "http://localhost:4200",
  "https://themovieflix-app.netlify.app",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        // If a specific origin isn’t found on the list of allowed origins
        let message =
          "The CORS policy for this application doesn’t allow access from origin " +
          origin;
        return callback(new Error(message), false);
      }
      return callback(null, true);
    },
  })
);

// Login Route
let auth = require("./auth")(app);

const passport = require("passport");
require("./passport");
const { check, validationResult } = require("express-validator");

const Movies = Models.Movie;
const Users = Models.User;

const userSchema = mongoose.Schema({
  Username: { type: String, required: true },
  Password: { type: String, required: true },
  Email: { type: String, required: true },
  Birthday: Date,
  FavoriteMovies: [{ type: mongoose.Schema.Types.ObjectId, ref: "Movie" }],
});

userSchema.statics.hashPassword = (password) => {
  return bcrypt.hashSync(password, 10);
};

userSchema.methods.validatePassword = function (password) {
  return bcrypt.compareSync(password, this.Password);
};

//Integrating Mongoose with RESTAPI myFlix is the name od Database with movies and users
mongoose.connect(process.env.CONNECTION_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// GET requests
app.get("/", (req, res) => {
  res.send("Welcome to my movie API!");
});

app.post(
  "/users",
  [
    check("Username", "Username is required").isLength({ min: 5 }),
    check(
      "Username",
      "Username contains non alphanumeric characters - not allowed."
    ).isAlphanumeric(),
    check("Password", "Password is required").not().isEmpty(),
    check("Email", "Email does not appear to be valid").isEmail(),
  ],
  (req, res) => {
    // check the validation object for errors
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    let hashedPassword = Users.hashPassword(req.body.Password);
    Users.findOne({ Username: req.body.Username })
      .then((user) => {
        if (user) {
          return res.status(400).send(req.body.Username + "already exists");
        } else {
          Users.create({
            Username: req.body.Username,
            Password: hashedPassword,
            Email: req.body.Email,
            Birthday: req.body.Birthday,
          })
            .then((user) => {
              res.status(201).json(user);
            })
            .catch((error) => {
              console.error(error);
              res.status(500).send("Error: " + error);
            });
        }
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send("Error: " + error);
      });
  }
);


// Get a user by username
/**
 * Get a user by username.
 * @name getUserByUsername
 * @function
 * @memberof app
 * @inner
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 */

// Get all users
app.get(
  "/users",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Users.find()
      .then((users) => {
        res.status(200).json(users);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

// Get a user by username
app.get(
  "/users/:Username",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Users.findOne({ Username: req.params.Username })
      .then((user) => {
        res.json(user);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);


// Update a user by username
/**
 * Update a user by username.
 * @name updateUserByUsername
 * @function
 * @memberof app
 * @inner
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 */

app.put(
  "/users/:Username",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Users.findOneAndUpdate(
      { Username: req.params.Username },
      {
        $set: {
          Username: req.body.Username,
          Password: Users.hashPassword(req.body.Password),
          Email: req.body.Email,
          Birthday: req.body.Birthday,
        },
      },
      { new: true },
      (err, updatedUser) => {
        if (err) {
          console.error(err);
          res.status(500).send("Error: " + err);
        } else {
          res.json(updatedUser);
        }
      }
    );
  }
);

// Add a movie to a user's list of favorites
/**
 * Add a movie to a user's list of favorites.
 * @name addFavoriteMovie
 * @function
 * @memberof app
 * @inner
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 */

app.post(
  "/users/:Username/movies/:MovieID",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Users.findOneAndUpdate(
      { Username: req.params.Username },
      {
        $push: { FavoriteMovies: req.params.MovieID },
      },
      { new: true }, // This line makes sure that the updated document is returned
      (err, updatedUser) => {
        if (err) {
          console.error(err);
          res.status(500).send("Error: " + err);
        } else {
          res.json(updatedUser);
        }
      }
    );
  }
);

// Delete a movie from a user's list of favorites
/**
 * Delete a movie from a user's list of favorites.
 * @name deleteFavoriteMovie
 * @function
 * @memberof app
 * @inner
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 */

// DELETE a movie to a user's list of favorites
app.delete(
  "/users/:Username/movies/:MovieID",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Users.findOneAndUpdate(
      { Username: req.params.Username },
      {
        $pull: { FavoriteMovies: req.params.MovieID },
      },
      { new: true }, // This line makes sure that the updated document is returned
      (err, updatedUser) => {
        if (err) {
          console.error(err);
          res.status(500).send("Error: " + err);
        } else {
          res.json(updatedUser);
        }
      }
    );
  }
);

// Delete a user by username
/**
 * Delete a user by username.
 * @name deleteUserByUsername
 * @function
 * @memberof app
 * @inner
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 */

// Delete a user by username
app.delete(
  "/users/:Username",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Users.findOneAndRemove({ Username: req.params.Username })
      .then((user) => {
        if (!user) {
          res.status(400).send(req.params.Username + " was not found");
        } else {
          res.status(200).send(req.params.Username + " was deleted.");
        }
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

// Get all movies
/**
 * Get all movies.
 * @name getAllMovies
 * @function
 * @memberof app
 * @inner
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 */

app.get(
  "/movies",
  //passport.authenticate("jwt", { session: false }), (removed)
  (req, res) => {
    Movies.find()
      .then((movies) => {
        res.status(200).json(movies);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

// Get a movie by title
/**
 * Get a movie by title.
 * @name getMovieByTitle
 * @function
 * @memberof app
 * @inner
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 */

app.get(
  "/movies/:Title",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Movies.findOne({ Title: req.params.Title })
      .then((movie) => {
        res.json(movie);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

// Get a Movie by Genre
/**
 * Get a movie by genre.
 * @name getMovieByGenre
 * @function
 * @memberof app
 * @inner
 * @param {object} req - The request object.
 *
 // @param {object} res - The response object.
 */

app.get(
  "/movies/genre/:genreName",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Movies.findOne({ "Genre.Name": req.params.genreName })
      .then((movie) => {
        res.json(movie.Genre);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

// Get a Movie by Director
/**
 * Get a movie by director.
 * @name getMovieByDirector
 * @function
 * @memberof app
 * @inner
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 */

app.get(
  "/movies/directors/:directorName",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Movies.findOne({ "Director.Name": req.params.directorName })
      .then((movie) => {
        res.json(movie.Director);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

// Get documentation
/**
 * Get documentation.
 * @name getDocumentation
 * @function
 * @memberof app
 * @inner
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 */

app.get("/doc", (req, res) => {
  res.sendFile("public/documentation.html", { root: __dirname });
});

// Handle errors
/**
 * Handle errors.
 * @name handleError
 * @function
 * @memberof app
 * @inner
 * @param {object} err - The error object.
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 * @param {function} next - The next middleware function.
 */

// Error
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("There was an error. Please try again later.");
});

// Start server
/**
 * Start server.
 * @name startServer
 * @function
 * @memberof app
 * @inner
 * @param {number} port - The port number.
 * @param {string} ip - The IP address.
 * @param {function} callback - The callback function.
 */

// listen for requests
const port = process.env.PORT || 8080;
app.listen(port, "0.0.0.0", () => {
  console.log("Listening on Port " + port);
});
