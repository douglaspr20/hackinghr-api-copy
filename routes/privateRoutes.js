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
  "PUT /user/upload-resume": "UserController.uploadResume",
  "PUT /user/delete-resume": "UserController.deleteResume",
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
  "GET /podcast/episode/:id": "PodcastController.get",
  "GET /podcast/search": "PodcastController.searchPodcast",
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
  "GET /conference/:id": "ConferenceController.get",
  "POST /channel/": "ChannelController.create",
  "GET /channel/": "ChannelController.getAll",
  "GET /channel/:id": "ChannelController.get",
  "GET /channel-category/:id": "ChannelCategoryController.get",
  "POST /event/channel": "EventController.create",
  "GET /event/channel": "EventController.getChannelEvents",
  "DELETE /library/channel/:id": "LibraryController.deleteChannelLibrary",
  "PUT /library/channel/:id": "LibraryController.update",
  "PUT /library/viewed": "LibraryController.markAsViewed",
  "DELETE /podcast/channel/:id": "PodcastController.deleteChannelPodcast",
  "PUT /podcast/channel/:id": "PodcastController.update",
  "PUT /podcast/viewed": "PodcastController.markAsViewed",
  "DELETE /event/channel/:id": "EventController.deleteChannelEvent",
  "PUT /event/channel/:id": "EventController.updateEvent",
  "PUT /channel/follow/:id": "ChannelController.setFollow",
  "PUT /channel/unfollow/:id": "ChannelController.unsetFollow",
  "PUT /channel/:id": "ChannelController.put",
  "PUT /event/reset-email-reminders": "EventController.resetEmailReminders",
  "GET /courses/": "CourseController.getAll",
  "GET /course/:id": "CourseController.get",
  "POST /course/claim": "CourseController.claim",
  "GET /course-classes/:course": "CourseClassController.getByCourse",
  "GET /session/:id": "AnnualConferenceController.get",
  "GET /session": "AnnualConferenceController.getAll",
  "GET /course-instructors/:course": "CourseController.getInstructorsByCourse",
  "GET /course-sponsors/:course": "CourseController.getSponsorsByCourse",
  "GET /notification": "NotificationController.getAll",
  "PUT /notification/mark-to-read":
    "NotificationController.setNotificationsRead",
  "PUT /notification/mark-to-un-read":
    "NotificationController.setNotificationsUnRead",
  "GET /course-classes-user/:course":
    "CourseClassUserController.getProgressCourseByUser",
  "POST /course-classes-user/": "CourseClassUserController.setProgress",
  "GET /live/": "LiveController.get",
  "GET /podcast-series": "PodcastSeriesController.getAll",
  "GET /podcast-series/:id": "PodcastSeriesController.get",
  "POST /podcast-series/claim": "PodcastSeriesController.claim",
  "POST /library/claim": "LibraryController.claim",
  "POST /conference/claim": "ConferenceController.claim",
  "POST /event/claim-credit": "EventController.claimCredit",
  "POST /event/claim-attendance": "EventController.claimAttendance",
  "PUT /conference/viewed": "ConferenceController.markAsViewed",
  "PUT /podcast-series/viewed": "PodcastSeriesController.markAsViewed",
  "GET /post/": "PostController.getAll",
  "GET /post/:id": "PostController.get",
  "GET /posts/search": "PostController.searchPost",
  "POST /post/": "PostController.add",
  "PUT /post/:id": "PostController.update",
  "DELETE /post/:id": "PostController.remove",
  "POST /postLike/": "PostLikeController.add",
  "DELETE /postLike/:id": "PostLikeController.remove",
  "POST /postFollow/": "PostFollowController.add",
  "DELETE /postFollow/:id": "PostFollowController.remove",
  "GET /postComment/": "PostCommentController.getAll",
  "POST /postComment/": "PostCommentController.add",
  "DELETE /postComment/:id": "PostCommentController.remove",
  "POST /project": "ProjectController.create",
  "GET /project": "ProjectController.getAll",
  "GET /project/:id": "ProjectController.get",
  "POST /bonfire": "BonfireController.create",
  "GET /bonfire": "BonfireController.getAll",
  "GET /bonfire/:id": "BonfireController.get",
  "GET /skill-cohort": "SkillCohortController.getAll",
  "GET /skill-cohort/:id": "SkillCohortController.get",
  "GET /skill-cohort/:skillCohortId/resources":
    "SkillCohortResourcesController.getAll",
  "GET /skill-cohort/resource/:resourceId":
    "SkillCohortResourcesController.get",
  "POST /skill-cohort/participant": "SkillCohortParticipantController.create",
  "GET /skill-cohort/:skillCohortId/participant/:userId":
    "SkillCohortParticipantController.get",
  "GET /skill-cohort/:skillCohortId/participants/":
    "SkillCohortParticipantController.getAll",
  "GET /skill-cohort/participant/:userId":
    "SkillCohortParticipantController.getParticipantInAllCohortById",
  "POST /skill-cohort/resource/:resourceId/response":
    "SkillCohortResourceResponseController.create",
  "PUT /skill-cohort/response/:responseId":
    "SkillCohortResourceResponseController.update",
  "GET /skill-cohort/resource/:resourceId/participant/:participantId/response":
    "SkillCohortResourceResponseController.get",
  "GET /skill-cohort/resource/:resourceId/responses/:participantId":
    "SkillCohortResourceResponseController.getAllExceptCurrentUser",
  "POST /skill-cohort/response/assessment":
    "SkillCohortResourceResponseAssessmentController.create",
  "GET /skill-cohort/resource/:resourceId/participant/:participantId/assessments":
    "SkillCohortResourceResponseAssessmentController.getAllAssessmentByIds",
  "POST /skill-cohort/resource/assessment/upsert":
    "SkillCohortResourceResponseAssessmentController.upsertAssessment",
  "POST /skill-cohort/response/rating":
    "SkillCohortResponseRatingController.upsert",
  "GET /skill-cohort/resource/:resourceId/participant/:participantId/ratings":
    "SkillCohortResponseRatingController.getAllByIds",
  "GET /learning-badges/": "LearningBadgeController.getAll",
};

module.exports = privateRoutes;
