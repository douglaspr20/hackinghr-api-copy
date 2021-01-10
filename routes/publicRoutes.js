const checkIsAdmin = require("../policies/auth.policy").checkIsAdmin;

const publicRoutes = {
  "POST /register": "AuthController.register", // alias for POST /user
  "POST /login": "AuthController.login",
  "POST /login/admin": {
    path: "AuthController.login",
    middlewares: [checkIsAdmin],
  },
};

module.exports = publicRoutes;
