const checkIsAdmin = require("../policies/auth.policy").checkIsAdmin;

const publicRoutes = {
  "POST /register": "AuthController.register", // alias for POST /user
  "POST /login": "AuthController.login",
  "POST /login/admin": {
    path: "AuthController.login",
    middlewares: [checkIsAdmin],
  },
  "POST /auth/password-recovery": "AuthController.sendMailPasswordRecovery",
  "POST /auth/verify-token": "AuthController.verifyResetPasswordToken",
  "PATCH /auth/reset-password": "AuthController.resetPassword",
  "POST /stripe/webhook": "StripeController.webhook",
  "POST /marketPlace/": "MarketPlaceController.getAll",
  "GET /marketPlace-categories/": "MarketplaceCategoriesController.getAll",
  "GET /event/:id/": "EventController.getEvent",
  "GET /event/ics/:id": "EventController.downloadICS",
  "GET /global-conference/ics/:id": "AnnualConferenceController.downloadICS",
  "GET /bonfire/ics/:id": "BonfireController.downloadICS",
  "GET /category": "CategoryController.getAll",
  "GET /channel-category": "ChannelCategoryController.getAll",
  "GET /env/editor": "UserController.getEditorSignature",
  "GET /council/event/panel/:id/ics": "CouncilEventController.downloadICS",
  "GET /simulation-sprint/ics/:id": "SimulationSprintController.downloadICS",
  "GET /speakers/all-panel": "Speakers2023Controller.allPanelSpeakers",
  "GET /speakers/all-users-speakers":
    "Speakers2023Controller.getAllUserSpeaker",
  "GET /speakers/get-all-sponsor": "Speakers2023Controller.getAllSponsor",
  "GET /speakers/all-panel-of-user/:id":
    "Speakers2023Controller.getAllPanelsOfOneUser",
};

module.exports = publicRoutes;
