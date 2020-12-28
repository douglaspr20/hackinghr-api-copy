const express = require("express");
const app = express();
const path = require("path");
const port = process.env.PORT || 3000;
const db = require("./models/index.js");

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded());

app.post("/url", function (req, res) {
  const url = req.body.url;
  console.log('******* req.body', req.body);
  console.log('******* req.query', req.query);

  db.Url.findOrCreate({ where: { url: url } }).then(([urlObj, created]) => {
    console.log("******** urlObj", urlObj);
    console.log("******** created", created);
    res.send(`******  success  ******: ${url}`);
  });
});

app.get("/url", function (req, res) {
  const url = req.body.url;

  res.send("******  success  ******");
});

app.listen(port, () => console.log(`url-shortener listening on port ${port}!`));
