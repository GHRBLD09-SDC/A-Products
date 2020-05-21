const express = require("express");
const db = require("./index.js");
const app = express();
const bodyParser = require("body-parser");
const Promise = require("bluebird");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const port = 3000;
app.listen(port, () => console.log(`Listening on port ${port}`));
