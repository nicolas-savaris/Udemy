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
  const result = await db.query("SELECT country_code FROM visited_countries");
  let countries = [];
  result.rows.forEach((country) => {
    countries.push(country.country_code);
  })
  console.log(result.rows);
  return countries;
}

//GET home page
app.get("/", async (req, res) => {
  const countries = await checkVisited();
  res.render("index.ejs", { countries: countries, total: countries.length});
 });

app.post("/add", async (req, res) => {
//Retrieve the country name from the input field
  const input = req.body["country"];
try {
  //Query the countries table to find the country code for the given country name, using a lowercase comparason to make the searche case-insensitive and using the LIKE operator to allow for partial matches
  const result = await db.query(
    "SELECT country_code FROM countries WHERE LOWER(country_name) LIKE '%' || $1 || '%';",
    [input.toLowerCase()]
  );
  const data = result.rows[0];
  const countryCode = data.country_code;
  //Insert the country code into the visited countries table
  try {
    await db.query(
      "INSERT INTO visited_countries (country_code) VALUES ($1)",
       [countryCode]
    )
    //Redirect to the home page after successful insertion
    res.redirect("/");
    //If the country code already exists in the visited countries table, catch the error and display an error message
  } catch (err) {
    console.log(err);
      const countries = await checkVisited();
      res.render("index.ejs", {
        countries: countries,
        total: countries.length,
        error: "Country has already been added, try again.",
      });
};
}catch (err) {
  console.log(err);
  //if the country 
  const countries = await checkVisited();
  res.render("index.ejs", {
    countries: countries,
    total: countries.length,
    error: "Country name does not exist, try again.",
  })
};

 });


app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
