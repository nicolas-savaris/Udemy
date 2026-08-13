import express from 'express';

const app = express();
const port = 3000;

app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    res.sendFile(process.cwd() + "/public/index.html");
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

app.post("/submit", (req, res) => {
    console.log(req.body);

    res.send("Dati ricevuti! 🚀");
});