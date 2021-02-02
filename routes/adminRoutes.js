const adminRoutes = {
  "POST /event/": "EventController.create",
  "PUT /event/:id": "EventController.updateEvent",
  "GET /event/:id/users": "EventController.getEventUsers",
  "GET /podcast/:id": "PodcastController.get",
  "POST /podcast/": "PodcastController.add",
  "PUT /podcast/:id": "PodcastController.update",
  "DELETE /podcast/:id": "PodcastController.remove",
  "GET /library/all/": "LibraryController.getAll",
  "POST /library/": "LibraryController.create",
  "PUT /library/:id": "LibraryController.update",
  "PUT /library/approve/:id": "LibraryController.approve",
  "PUT /library/reject/:id": "LibraryController.reject",
  "PUT /library/recommend/:id": "LibraryController.recommend",
};

module.exports = adminRoutes;
