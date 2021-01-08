const privateRoutes = {
  "GET /user/": "UserController.getUser",
  "PUT /user/": "UserController.updateUser",
  "PUT /user/upgrade-plan/": "UserController.upgradePlan",
};

module.exports = privateRoutes;
