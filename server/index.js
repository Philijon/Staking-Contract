const {express} = require("express");

const http = require("http");

const path = require("path") ;

const myPort = 5099;

const app = express();

app.use(express.json());

app.use(express.static(path.join(__dirname,"")))