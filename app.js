const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const path = require("path");
const db = require("./models/index.js");
const mapRoutes = require("express-routes-mapper");
const cors = require("cors");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const authPolicy = require("./policies/auth.policy");
const cron = require("node-cron");
const EventController = require("./controllers/EventController");
const JourneyController = require("./controllers/JourneyController");
const fileUpload = require("express-fileupload");

const socketService = require("./services/socket.service");

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

// Creating a cron job which runs on every an hour.
cron.schedule("25 * * * *", () => {
  console.log("running a task every 1 hour.");
  EventController().emailAfterEventThread();
});

// Creating a cron job which runs on every day.
cron.schedule("* 0 * * *", () => {
  console.log("running a task every 1 day.");
  JourneyController().createNewItems();
});

// allow cross origin requests
// configure to only allow requests from certain origins
app.use(cors());

// parsing the request bodys
app.use(bodyParser.json({ limit: "50mb" }));
app.use(
  bodyParser.urlencoded({
    limit: "50mb",
    extended: true,
    parameterLimit: 50000,
  })
);

// parsing file uploaded
app.use(
  fileUpload({
    limits: { fileSize: 5 * 1024 * 1024 },
  })
);

// secure your private routes with jwt authentication middleware
// app.all('/private/*', (req, res, next) => auth(req, res, next));

// fill routes for express application
app.use("/public", mappedOpenRoutes);
app.use("/private", mappedAuthRoutes);
app.use("/admin", mappedAdminRoutes);

const port = process.env.PORT || 3001;

const server = http.createServer(app);

const FEUrl = process.env.DOMAIN_URL || "http://localhost:3000/";

const io = socketIo(server, {
  cors: {
    origin: FEUrl.slice(0, FEUrl.length - 1),
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  socketService().addSocket(socket);

  socket.on("disconnect", () => {
    socketService().removeSocket(socket);
  });
});

server.listen(port, () =>
  console.log(`url-shortener listening on port ${port}!`)
);
