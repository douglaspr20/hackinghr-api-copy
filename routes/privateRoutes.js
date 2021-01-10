const privateRoutes = {
  "GET /user/": "UserController.getUser",
  "PUT /user/": "UserController.updateUser",
  "POST /feedback/": "FeedbackController.sendMail",
  "PUT /user/upgrade-plan/": "UserController.upgradePlan",

  "GET /heart/": "HeartController.getAll",
  "GET /heart/:id": "HeartController.get",
  "POST /heart/": "HeartController.add",
  "PUT /heart/:id": "HeartController.update",
  "DELETE /heart/:id": "HeartController.remove",
};

module.exports = privateRoutes;
