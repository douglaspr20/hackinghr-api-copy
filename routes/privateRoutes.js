const privateRoutes = {
  "GET /user/": "UserController.getUser",
  "GET /events/": "EventController.getAllEvents",
  "GET /user/my-events/": "UserController.getMyEvents",
  "POST /feedback/": "FeedbackController.sendMail",
  "PUT /user/": "UserController.updateUser",
  "PUT /user/upgrade-plan/": "UserController.upgradePlan",
  "PUT /user/add-event/": "UserController.addEvent",
  "PUT /user/remove-event/": "UserController.removeEvent",
  "PUT /event/set-status/:id": "EventController.updateEventStatus",
  "POST /stripe/checkout-session/": "StripeController.createCheckoutSession",
  "GET /stripe/portal-session/": "StripeController.createPortalSession",
  "GET /stripe/subscription/": "StripeController.getSubscription",
  "GET /heart/": "HeartController.getAll",
  "GET /heart/:id": "HeartController.get",
  "POST /heart/": "HeartController.add",
  "PUT /heart/:id": "HeartController.update",
  "DELETE /heart/:id": "HeartController.remove",
  "POST /library/share": "LibraryController.share",
  "GET /library/approved/": "LibraryController.getApproved",
  "GET /library/recommendations/": "LibraryController.getRecommendations",
  "GET /library/:id/": "LibraryController.getLibrary",
  "POST /mentoring": "MentoringController.create",
  "GET /mentoring": "MentoringController.getMentoringInfo",
  "PUT /mentoring": "MentoringController.updateMentoringInfo",
  "GET /mentor/all/": "MentoringController.getMentorList",
  "GET /mentee/all/": "MentoringController.getMenteeList",
  "PUT /mentoring/match": "MentoringController.setMatch",
  "GET /podcast/": "PodcastController.getAll",
  "GET /category/:id": "CategoryController.get",
  "GET /journey/": "JourneyController.getAll",
  "GET /journey/:id": "JourneyController.get",
  "POST /journey/": "JourneyController.add",
  "PUT /journey/:id": "JourneyController.update",
  "DELETE /journey/:id": "JourneyController.remove",
  "GET /journey-items/:id": "JourneyItemController.getItemsByJourney",
};

module.exports = privateRoutes;
