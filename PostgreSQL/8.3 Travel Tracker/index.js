import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

const db = new pg.Client({
  user: "nicolas",
  host: "localhost",
  database: "world",
  password: "!Torino2026",
  port: 5432,
});

db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

async function checkVisited() {
  const result = await db.query("SELECT country_code from visited_countries");
  let countries = [];
  result.rows.forEach((country) => {
    countries.push(country.country_code);
  })
  console.log(result.rows);
  return countries
}

app.get("/", async (req, res) => {
  const countries = await checkVisited();
  res.render("index.ejs", { countries: countries, total: countries.length});
 });

app.post("/add", async (req, res) => {
//Retrieve the country name from the input field
  const input = req.body["country"];
  const result = await db.query(
    "SELECT country_code FROM countries WHERE country_name = $1",
    [input]
  );
  if (result.rows.length !== 0) {
    //Take the first row of the result and store it in a variable called data
    const data = result.rows[0];
    //Retrieve the country code from the data variable
    const countryCode = data.country_code;
    //Insert the country code into the visited_countries table
    await db.query("INSERT INTO visited_countries (country_code) VALUES ($1)", [
      countryCode
    ]
    );
    //Redirect the user back to the home page
    res.redirect("/");
  } else {
    //If the country name is not found in the countries table, we send an error message to the user
    res.send("Country not found");
  }

 });


app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
