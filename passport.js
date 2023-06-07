const passport = require("passport"),
  LocalStrategy = require("passport-local").Strategy,
  Models = require("./models.js"),
  passportJWT = require("passport-jwt");

/**
 * @typedef {Object} Users
 * @property {function} findOne
 * @property {function} findById
 */

/**
 * @type {Users}
 */
let Users = Models.User;

/**
 * @type {passportJWT.Strategy}
 */
let JWTStrategy = passportJWT.Strategy;

/**
 * @type {passportJWT.ExtractJwt}
 */
let ExtractJWT = passportJWT.ExtractJwt;

/**
 * Use Passport's LocalStrategy for local authentication.
 * Users' username and password are authenticated.
 */
passport.use(
  new LocalStrategy(
    {
      usernameField: "Username",
      passwordField: "Password",
    },
    (username, password, callback) => {
      console.log(username + "  " + password);
      Users.findOne({ Username: username }, (error, user) => {
        if (error) {
          console.log(error);
          return callback(error);
        }

        if (!user) {
          console.log("incorrect username");
          return callback(null, false, { message: "Incorrect username." });
        }

        if (!user.validatePassword(password)) {
          console.log("incorrect password");
          return callback(null, false, { message: "Incorrect password." });
        }

        console.log("finished");
        return callback(null, user);
      });
    }
  )
);

/**
 * Use Passport's JWTStrategy for authentication using JWT.
 * Extracts JWT from the Authorization header with the Bearer schema.
 */
passport.use(
  new JWTStrategy(
    {
      jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
      secretOrKey: "your_jwt_secret",
    },
    (jwtPayload, callback) => {
      return Users.findById(jwtPayload._id)
        .then((user) => {
          return callback(null, user);
        })
        .catch((error) => {
          return callback(error);
        });
    }
  )
);
