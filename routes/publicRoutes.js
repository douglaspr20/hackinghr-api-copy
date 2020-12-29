const publicRoutes = {
  "POST /user": "UserController.register",
  "POST /register": "UserController.register", // alias for POST /user
  "POST /login": "UserController.login",
};

module.exports = publicRoutes;
