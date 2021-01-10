const express = require("express");
const path = require("path");
const db = require("./models/index.js");
const mapRoutes = require("express-routes-mapper");
const cors = require("cors");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const authPolicy = require("./policies/auth.policy");

dotenv.config();

/**
 * server configuration
 */
const routes = require("./routes");

/**
 * express application
 */
const app = express();
const mappedOpenRoutes = mapRoutes(routes.publicRoutes, "controllers/");
const mappedAuthRoutes = mapRoutes(routes.privateRoutes, "controllers/", [
  authPolicy.validate,
]);
const mappedAdminRoutes = mapRoutes(routes.adminRoutes, "controllers/", [
  authPolicy.validate,
  authPolicy.checkAdminRole,
]);

// allow cross origin requests
// configure to only allow requests from certain origins
app.use(cors());

// parsing the request bodys
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// secure your private routes with jwt authentication middleware
// app.all('/private/*', (req, res, next) => auth(req, res, next));

// fill routes for express application
app.use("/public", mappedOpenRoutes);
app.use("/private", mappedAuthRoutes);
app.use("/admin", mappedAdminRoutes);

const port = process.env.PORT || 3001;

app.listen(port, () => console.log(`url-shortener listening on port ${port}!`));
