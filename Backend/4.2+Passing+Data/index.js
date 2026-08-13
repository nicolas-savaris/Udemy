import express from "express";
import bodyParser from "body-parser";

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.render("index.ejs", { numberOfLetters: "" });
});

app.post("/submit", (req, res) => {
  const name = req.body["fName"].length + req.body["lName"].length;
  console.log(name);

  res.render("index.ejs", { numberOfLetters: name });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
