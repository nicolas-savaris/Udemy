import { error } from "console";
import fs from "fs";
import { readFile } from 'node:fs';

//fs.writeFile("message.txt", "Hello from NodeJS", (err)=>{
//    if (err) throw err;
//   console.log("This file has been saved!");
//});


fs.readFile("./message.txt", "utf8", (err, data) => {
  if (err) throw err;
  console.log(data);
});