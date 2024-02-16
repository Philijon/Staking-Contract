const express = require("express");
const opn = require("opn");

const http = require("http");

const path = require("path") ;

const myPort = 5099;


const openURL = `http://localhost:${myPort}/`;

const app = express();

app.use(express.json());

app.use(express.static(path.join(__dirname,"..","client")));

app.get("/",(req,res)=>{
    res.status(200).sendFile(path.join(__dirname,"..","client","index.html"));
})

const server = http.createServer(app);

server.listen(myPort,()=>{
    console.log(`Listening on Port ${myPort}`);
})

opn(openURL).then(()=>{
    console.log("Opened frontend")
}).catch((error)=>{
    console.log(error)
})