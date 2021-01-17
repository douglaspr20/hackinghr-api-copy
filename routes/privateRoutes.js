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
  "POST /stripe/checkout-session/": "StripeController.createCheckoutSession",
  "POST /stripe/portal-session/": "StripeController.createPortalSession",
  "GET /heart/": "HeartController.getAll",
  "GET /heart/:id": "HeartController.get",
  "POST /heart/": "HeartController.add",
  "PUT /heart/:id": "HeartController.update",
  "DELETE /heart/:id": "HeartController.remove",
  "POST /library/": "LibraryController.create",
  "GET /library/all/": "LibraryController.getAll"
};

module.exports = privateRoutes;
