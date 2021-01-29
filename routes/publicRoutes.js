const checkIsAdmin = require("../policies/auth.policy").checkIsAdmin;

const publicRoutes = {
  "POST /register": "AuthController.register", // alias for POST /user
  "POST /login": "AuthController.login",
  "POST /login/admin": {
    path: "AuthController.login",
    middlewares: [checkIsAdmin],
  },
  "POST /auth/password-recovery": "AuthController.sendMailPasswordRecovery",
  "POST /auth/verify-token": "AuthController.verifyResetPasswordToken",
  "PATCH /auth/reset-password": "AuthController.resetPassword",
  "POST /stripe/webhook": "StripeController.webhook",
  "POST /marketPlace/": "MarketplaceController.getAll",
  "GET /marketPlace-categories/": "MarketplaceCategoriesController.getAll",
};

module.exports = publicRoutes;
