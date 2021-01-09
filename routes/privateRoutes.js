const privateRoutes = {
  "GET /user/": "UserController.getUser",
  "PUT /user/": "UserController.updateUser",
  "POST /feedback/": "FeedbackController.sendMail",
  "PUT /user/upgrade-plan/": "UserController.upgradePlan",
};

module.exports = privateRoutes;
