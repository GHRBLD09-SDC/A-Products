require("newrelic");
const express = require("express");
const routes = require("./routes");
const app = express();
const bodyParser = require("body-parser");
const Promise = require("bluebird");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/api/:id", (req, res) => {
  let product = routes.getProduct(req.params.id);
  Promise.all(product)
    .then((data) => {
      res.status(200).send(data);
    })
    .catch((err) => console.log(err));
});

app.post("/api", (req, res) => {});

app.delete("/api/:id", (req, res) => {});

app.put("/api/:id", (req, res) => {});

const port = 3000;
app.listen(port, () => console.log(`Listening on port ${port}`));
