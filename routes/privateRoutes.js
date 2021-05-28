const privateRoutes = {
  "GET /user/": "UserController.getUser",
  "GET /events/": "EventController.getAllEvents",
  "GET /user/my-events/": "UserController.getMyEvents",
  "POST /feedback/": "FeedbackController.sendMail",
  "PUT /user/": "UserController.updateUser",
  "PUT /user/upgrade-plan/": "UserController.upgradePlan",
  "PUT /user/add-event/": "UserController.addEvent",
  "PUT /user/remove-event/": "UserController.removeEvent",
  "POST /user/invite-friend/": "UserController.generateInvitationEmail",
  "GET /user/search": "UserController.searchUser",
  "PUT /user/attend-conference": "UserController.setAttendedToConference",
  "PUT /user/add-session/:id": "UserController.addSession",
  "PUT /user/remove-session/:id": "UserController.removeSession",
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
  "POST /library/channel": "LibraryController.create",
  "GET /library/approved/": "LibraryController.getApproved",
  "GET /library/channel/": "LibraryController.getChannelLibraries",
  "GET /library/recommendations/": "HomeController.getRecommendations",
  "GET /library/:id/": "LibraryController.getLibrary",
  "POST /mentoring": "MentoringController.create",
  "GET /mentoring": "MentoringController.getMentoringInfo",
  "PUT /mentoring": "MentoringController.updateMentoringInfo",
  "GET /mentor/all/": "MentoringController.getMentorList",
  "GET /mentee/all/": "MentoringController.getMenteeList",
  "PUT /mentoring/match": "MentoringController.setMatch",
  "GET /podcast/": "PodcastController.getAll",
  "POST /podcast/channel": "PodcastController.add",
  "GET /podcast/channel": "PodcastController.getChannelPodcasts",
  "GET /category/:id": "CategoryController.get",
  "GET /journey/": "JourneyController.getAll",
  "GET /journey/:id": "JourneyController.get",
  "POST /journey/": "JourneyController.add",
  "PUT /journey/:id": "JourneyController.update",
  "DELETE /journey/:id": "JourneyController.remove",
  "GET /journey-items/:id": "JourneyItemController.getItemsByJourney",
  "PUT /journey-items/:id": "JourneyItemController.update",
  "GET /conference/": "ConferenceController.getAll",
  "POST /channel/": "ChannelController.create",
  "GET /channel/": "ChannelController.getAll",
  "GET /channel/:id": "ChannelController.get",
  "GET /channel-category/:id": "ChannelCategoryController.get",
  "POST /event/channel": "EventController.create",
  "GET /event/channel": "EventController.getChannelEvents",
  "DELETE /library/channel/:id": "LibraryController.deleteChannelLibrary",
  "PUT /library/channel/:id": "LibraryController.update",
  "DELETE /podcast/channel/:id": "PodcastController.deleteChannelPodcast",
  "PUT /podcast/channel/:id": "PodcastController.update",
  "DELETE /event/channel/:id": "EventController.deleteChannelEvent",
  "PUT /event/channel/:id": "EventController.updateEvent",
  "PUT /channel/follow/:id": "ChannelController.setFollow",
  "PUT /channel/unfollow/:id": "ChannelController.unsetFollow",
  "PUT /channel/:id": "ChannelController.put",
  "PUT /event/reset-email-reminders": "EventController.resetEmailReminders",
  "GET /courses/": "CourseController.getAll",
  "GET /course/:id": "CourseController.get",
  "GET /course-classes/:course": "CourseClassController.getByCourse",
  "GET /session/:id": "AnnualConferenceController.get",
  "GET /session": "AnnualConferenceController.getAll",
  "GET /course-instructors/:course": "CourseController.getInstructorsByCourse",
  "GET /course-sponsors/:course": "CourseController.getSponsorsByCourse",
  "GET /course-classes-user/:course": "CourseClassUserController.getProgressCourseByUser",
  "POST /course-classes-user/": "CourseClassUserController.setProgress",
  "GET /live/": "LiveController.get",
};

module.exports = privateRoutes;
