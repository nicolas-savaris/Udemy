import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import bcrypt from "bcrypt";
import session from "express-session";
import passport from "passport";
import dotenv from "dotenv";
import strategy from "passport-local";

dotenv.config();

const app = express();
const port = 3000;
const saltRounds = 10;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use(session({
  secret: "TOPSECRETWORD",
  resave: false,
  saveUninitialized: true,
  cookies: {
    maxAge: 24 * 60 * 60 * 1000, // 1 day in milliseconds
  }
}))

// This have to happen after the session middleware open and before any route handling that requires authentication. It initializes Passport and allows it to manage user sessions.
app.use(passport.initialize());
app.use(passport.session());

const db = new pg.Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});
db.connect();

app.get("/", (req, res) => {
  res.render("home.ejs");
});

app.get("/login", (req, res) => {
  res.render("login.ejs");
});

app.get("/register", (req, res) => {
  res.render("register.ejs");
});

app.get("/secrets", (req, res) =>{
  console.log("User authenticated:", req.user);
  if(req.isAuthenticated()){
    res.render("secrets.ejs");
  } else {
    res.redirect("/login");
  }
})

app.post("/register", async (req, res) => {
  const email = req.body.username;
  const password = req.body.password;

  try {
    const checkResult = await db.query("SELECT * FROM users WHERE username = $1", [
      email,
    ]);

    if (checkResult.rows.length > 0) {
      res.send("Username already exists. Try logging in.");
    } else {
      //hashing the password and saving it in the database
      bcrypt.hash(password, saltRounds, async (err, hash) => {
        if (err) {
          console.error("Error hashing password:", err);
        } else {
          console.log("Hashed Password:", hash);
          const result = await db.query(
            "INSERT INTO users (username, password) VALUES ($1, $2) RETURNING *",
            [email, hash]
          );
          const newUser = result.rows[0];
          req.login(newUser, (err) => {
            if (err) {
              console.error("Error logging in after registration;", err);
              res.redirect("/login");
            }
            else {
              res.redirect("/secrets");
            }
          })
          res.render("secrets.ejs");
        }
      });
    }
  } catch (err) {
    console.log(err);
  }
});

app.post("/login", passport.authenticate("local", {
  successRedirect: "/secrets",
  failureRedirect: "/login",
}));

passport.use(new strategy.Strategy(async function verify(username, password, callback){
  console.log("Verifying user:", username);
   try {
    const result = await db.query("SELECT * FROM users WHERE username = $1", [
      username,
    ]);
    if (result.rows.length > 0) {
      const user = result.rows[0];
      const storedHashedPassword = user.password;
      bcrypt.compare(password, storedHashedPassword, (err, result) => {
        if (err) {
          console.error("Error comparing passwords:", err);
          return callback(err);
        } else {
          if (result) {
            return callback(null, user)
          } else {
            return callback(null, false, {message: "Incorrect password"});
          }
        }
      });
    } else {
      return callback(null, false, {message: "User not found"});  
    }
  } catch (err) {
    return callback(err);
  }
}));

passport.serializeUser((user, callback) =>{
  callback(null, user);
});

passport.deserializeUser((user, callback) =>{
  callback(null, user);
});
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
