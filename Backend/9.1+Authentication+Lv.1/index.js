import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = 3000;


const db = new pg.Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

export default db;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.render("home.ejs");
});

app.get("/login", (req, res) => {
  res.render("login.ejs");
});

app.get("/register", (req, res) => {
  res.render("register.ejs");
});

app.get("/test-db", async (req, res) => {
  try {
    const result = await db.query("SELECT NOW()");
    console.log(result.rows);

    res.send("Database connection successful!");
  } catch (err) {
    console.error("Database connection error:", err);
    res.status(500).send("Database connection failed!");
  }
});


app.post("/register", async (req, res) => {

  console.log("1. POST request received");

  const { username, password } = req.body;

  console.log("2. Data received:", username, password);

  try {

    console.log("3. Executing SQL query...");

    const result = await db.query(
      "INSERT INTO users (username, password) VALUES ($1, $2)",
      [username, password]
    );

    console.log("4. Query completed!");

    return res.render("secrets.ejs", {
      message: "User registered successfully!"
    });

  } catch (err) {

    console.error("5. Database error:", err.message);

    return res.status(500).send("Registration failed!");
  }
});

app.post("/login", async (req, res) => {});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
