const privateRoutes = {
  "GET /user/": "UserController.getUser",
  "PUT /user/": "UserController.updateUser",
  "POST /feedback/": "FeedbackController.sendMail",
  "PUT /user/upgrade-plan/": "UserController.upgradePlan",
  "GET /events/": "EventController.getAllEvents",
  "GET /event/:id/": "EventController.getEvent",
  "PUT /user/add-event/": "UserController.addEvent",
  "PUT /user/remove-event/": "UserController.removeEvent",
};

module.exports = privateRoutes;
