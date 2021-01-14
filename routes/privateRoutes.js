const privateRoutes = {
  "GET /user/": "UserController.getUser",
  "GET /events/": "EventController.getAllEvents",
  "GET /event/:id/": "EventController.getEvent",
  "GET /user/my-events/": "UserController.getMyEvents",
  "POST /feedback/": "FeedbackController.sendMail",
  "PUT /user/": "UserController.updateUser",
  "PUT /user/upgrade-plan/": "UserController.upgradePlan",
  "PUT /user/add-event/": "UserController.addEvent",
  "PUT /user/remove-event/": "UserController.removeEvent",
  "PUT /event/set-status/:id": "EventController.updateEventStatus",
};

module.exports = privateRoutes;
