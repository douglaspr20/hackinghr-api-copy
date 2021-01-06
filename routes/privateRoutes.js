const multer = require("multer");
const upload = multer();

const privateRoutes = {
  "GET /user/": "UserController.getUser",
  "PUT /user/": "UserController.updateUser",
  "PUT /user/image": {
    path: "UserController.updateImage",
    middlewares: [upload.single("file")],
  },
  "POST /feedback/": "FeedbackController.sendMail",
};

module.exports = privateRoutes;
