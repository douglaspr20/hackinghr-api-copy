const privateRoutes = {
  "GET /user/": "UserController.getUser",
  "POST /user/apply-business-partner":
    "UserController.acceptInvitationApplyBusinessPartner",
  "POST /user/confirm-apply-business/:id":
    "UserController.confirmInvitationApplyBusiness",
  "GET /council/members/": "CouncilMembersController.getCouncilMembers",
  "GET /council/resources/": "CouncilMembersController.getAll",
  "GET /council/resource/:id": "CouncilMembersController.getCouncilResource",
  "POST /council/add-resources/": "CouncilMembersController.create",
  "GET /councilComments/": "CouncilCommentController.getAll",
  "POST /councilComments/create-comment": "CouncilCommentController.add",
  "DELETE /councilComments/delete-comment/:id":
    "CouncilCommentController.remove",
  "GET /business-partner/members/":
    "BusinessPartnerController.getBusinessPartnerMembers",
  "GET /business-partner/resources/": "BusinessPartnerController.getAll",
  "GET /business-partner/resource/:id":
    "BusinessPartnerController.getBusinessPartnerResource",
  "POST /business-partner/add-resources/": "BusinessPartnerController.create",
  "DELETE /business-partner/resource/:id":
    "BusinessPartnerController.deleteResource",
  "PUT /business-partner/resource/:id":
    "BusinessPartnerController.updateResource",
  "GET /business-partner/documents/":
    "BusinessPartnerController.getBusinessPartnerDocuments",
  "POST /business-partner/create-document/":
    "BusinessPartnerController.createDocument",
  "PUT /business-partner/upload-document/":
    "BusinessPartnerController.uploadDocumentFile",
  "DELETE /business-partner/delete-document/:id":
    "BusinessPartnerController.deleteDocumentFile",
  "GET /business-partner-comments/": "BusinessPartnerCommentController.getAll",
  "POST /business-partner-comments/create-comment":
    "BusinessPartnerCommentController.add",
  "DELETE /business-partner-comments/delete-comment/:id":
    "BusinessPartnerCommentController.remove",
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
  "PUT /user/session-joined/:id": "UserController.sessionUserJoined",
  "PUT /user/add-bonfire/:id": "UserController.addBonfire",
  "PUT /user/remove-bonfire/:id": "UserController.removeBonfire",
  "PUT /user/upload-resume": "UserController.uploadResume",
  "PUT /user/delete-resume": "UserController.deleteResume",
  "POST /user/create-invitation": "UserController.createInvitation",
  "GET /user/accept-invitation/:newuser": "UserController.acceptInvitationJoin",
  "GET /user/confirm-accessibility-requirements/:id":
    "UserController.confirmAccessibilityRequirements",
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
  "PUT /library/:id/save-for-later": "LibraryController.saveForLater",
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
  "PUT /conference/:id/save-for-later": "ConferenceController.saveForLater",
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
  "PUT /podcast/:id/save-for-later": "PodcastController.saveForLater",
  "DELETE /event/channel/:id": "EventController.deleteChannelEvent",
  "PUT /event/:id": "EventController.updateEventUserAssistence",
  "PUT /event/channel/:id": "EventController.updateEvent",
  "PUT /channel/follow/:id": "ChannelController.setFollow",
  "PUT /channel/unfollow/:id": "ChannelController.unsetFollow",
  "PUT /channel/:id": "ChannelController.put",
  "PUT /event/reset-email-reminders": "EventController.resetEmailReminders",
  "GET /courses/": "CourseController.getAll",
  "GET /course/:id": "CourseController.get",
  "POST /course/claim": "CourseController.claim",
  "GET /course-classes/:course": "CourseClassController.getByCourse",
  "GET /session": "AnnualConferenceController.getAll",
  "GET /sessions-user": "AnnualConferenceController.getSessionsUser",
  "GET /sessions-user-joined":
    "AnnualConferenceController.getSessionsUserJoined",
  "GET /session/participants": "AnnualConferenceController.getParticipants",
  "GET /session/recommended-agenda":
    "AnnualConferenceController.recommendedAgenda",
  "POST /session/claim": "AnnualConferenceController.claim",
  "PUT /session/viewed": "AnnualConferenceController.markAsViewed",
  "GET /session/:id": "AnnualConferenceController.get",
  "PUT /session/:id/save-for-later": "AnnualConferenceController.saveForLater",
  "GET /conference-classes/:conference":
    "AnnualConferenceClassController.getByAnnualConference",
  "GET /conference-classes-user/:conference":
    "AnnualConferenceClassUserController.getProgressAnnualConferenceByUser",
  "POST /conference-classes-user/":
    "AnnualConferenceClassUserController.setProgress",
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
  "PUT /podcast-series/:id/save-for-later":
    "PodcastSeriesController.saveForLater",
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
  "PUT /bonfire/:id": "BonfireController.update",
  "PUT /bonfire/:id/invitedUser/:userId": "BonfireController.inviteUser",
  "DELETE /bonfire/:id": "BonfireController.remove",
  "GET /skill-cohort": "SkillCohortController.getAllActiveUserSide",
  "GET /skill-cohort/my-cohort/:UserId":
    "SkillCohortController.getAllOfMyCohort",
  "GET /skill-cohort/:id": "SkillCohortController.get",
  "GET /skill-cohort/:skillCohortId/resources":
    "SkillCohortResourcesController.getAllAndCount",
  "GET /skill-cohort/resources/:skillCohortId/entire":
    "SkillCohortResourcesController.getEntire",
  "GET /skill-cohort/resource/:resourceId":
    "SkillCohortResourcesController.get",
  "GET /skill-cohort/:SkillCohortId/resource/":
    "SkillCohortResourcesController.getTodaysResource",
  "POST /skill-cohort/participant": "SkillCohortParticipantController.create",
  "GET /skill-cohort/:skillCohortId/participant/:userId":
    "SkillCohortParticipantController.get",
  "GET /skill-cohort/:SkillCohortId/participants/":
    "SkillCohortParticipantController.getAll",
  "GET /skill-cohort/participant/:userId":
    "SkillCohortParticipantController.getParticipantInAllCohortById",
  "DELETE /skill-cohort/participant/:SkillCohortParticipantId":
    "SkillCohortParticipantController.withdrawParticipation",
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
  "POST /user/:UserId/change-password": "UserController.changePassword",
  "GET /my-learnings/saved": "LearningController.getAllSaved",
  "GET /my-learnings/completed": "LearningController.getAllCompleted",
  "GET /my-learnings/items-with-hr-credits":
    "LearningController.getAllItemsWithHrCredit",
  "GET /my-learnings/event-videos": "LearningController.getAllEventVideos",
  "GET /learning-badges": "LearningBadgeController.getAll",
  "GET /partner": "PartnerController.getAll",
  "GET /partner/:id": "PartnerController.get",
  "GET /users": "UserController.getAllUsersExcludePassword",
  "GET /job-board/job-posts": "JobPostController.getAll",
  "GET /job-board/job-post/:JobPostId": "JobPostController.getJobPost",
  "POST /job-board/job-post": "JobPostController.upsert",
  "GET /job-board/my-job-posts": "JobPostController.getMyJobPosts",
  "POST /job-board/invitation-to-apply": "JobPostController.invitationToApply",
  "GET /marketplace-profiles": "MarketplaceProfileController.getAll",
  "POST /marketplace-profiles": "MarketplaceProfileController.add",
  "GET /marketplace-profiles/:id": "MarketplaceProfileController.get",
  "PUT /marketplace-profiles/:id": "MarketplaceProfileController.update",
  "PUT /user/accept-terms-condition-g-conference/:id":
    "UserController.acceptTermsConditionGConference",
  "PUT /user/view-rules-g-conference/:id":
    "UserController.viewRulesGConference",
  "GET /users/count-all": "UserController.countAllUsers",
  "GET /ads-by-page": "AdvertisementController.getAdvertisementsTodayByPage",
  "GET /ads/active": "AdvertisementController.getAllActiveAdvertisements",
  "GET /ads/:UserId": "AdvertisementController.getAdvertisementByAdvertiser",
  "POST /ad": "AdvertisementController.createAdvertisement",
  "GET /ad/:advertisementId": "AdvertisementController.getAdvertisementById",
  "GET /matchmake": "MatchmakingController.getMatchmake",
  "PUT /ad/:AdvertisementId": "AdvertisementController.editAdvertisement",
  "POST /matchmake/send-email": "MatchmakingController.sendMatchEmail",
  "POST /council/event": "CouncilEventController.upsert",
  "GET /council/events": "CouncilEventController.getAll",
  "DELETE /council/event/:id": "CouncilEventController.destroy",
  "POST /council/event/panelist":
    "CouncilEventController.joinCouncilEventPanelist",
  "POST /council-conversation": "CouncilConversationController.upsert",
  "GET /council-conversations": "CouncilConversationController.getAll",
  "GET /council-conversation/:id": "CouncilConversationController.get",
  "DELETE /council-conversation/:id": "CouncilConversationController.destroy",
  "POST /council-conversation/comment":
    "CouncilConversationCommentController.upsert",
  "POST /council-conversation/reply":
    "CouncilConversationReplyController.upsert",
  "PUT /council-conversation/comment/:id":
    "CouncilConversationCommentController.destroy",
  "PUT /council-conversation/reply/:id":
    "CouncilConversationReplyController.destroy",
  "POST /council-conversation/like": "CouncilConversationLikeController.create",
  "DELETE /council-conversation/like/:id":
    "CouncilConversationLikeController.destroy",
  "DELETE /council/event/panel/:CouncilEventPanelId/panelist/:CouncilEventPanelistId":
    "CouncilEventController.removePanelist",
  "GET /council/event/search-user": "CouncilEventController.search",
};

module.exports = privateRoutes;
