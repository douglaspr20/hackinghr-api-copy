const privateRoutes = {
  "GET /user/": "UserController.getUser",
  "PUT /user/": "UserController.updateUser",
  "POST /feedback/": "FeedbackController.sendMail",
  "PUT /user/upgrade-plan/": "UserController.upgradePlan",
  "GET /events/": "EventController.getAllEvents",
  "GET /event/:id/": "EventController.getEvent",
  "POST /stripe/checkout-session/": "StripeController.createCheckoutSession",
  "POST /stripe/portal-session/": "StripeController.createPortalSession",
};

module.exports = privateRoutes;
