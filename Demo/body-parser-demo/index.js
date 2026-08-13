import express from 'express';
import ExcelJS from 'exceljs';

   
const app = express();
const port = 3000;

const workbook = new ExcelJS.Workbook(); 
const worksheet = workbook.addWorksheet("Contacts");

worksheet.columns = [
    { header: "Name", key: "name" },
    { header: "Email", key: "email" }
];

worksheet.addRow({
    name: "John Doe",
    email: "john.doe@example.com"
});

async function createExcelFile() {
    await workbook.xlsx.writeFile("./data/contacts.xlsx");
    console.log("Excel file created! 📊");
}

createExcelFile();

app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    res.sendFile(process.cwd() + "/public/index.html");
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

app.post("/submit", (req, res) => {
    const name = req.body.name;
    const email = req.body.email;

    console.log(name);
    console.log(email);

    res.send(`Ciaoo ${name}!, abbiamo ricevuto la tua email: ${email}`);
});