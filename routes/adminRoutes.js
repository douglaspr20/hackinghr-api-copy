const adminRoutes = {
  "POST /event/": "EventController.create",
  "PUT /event/:id": "EventController.updateEvent",
  "GET /podcast/:id": "PodcastController.get",
  "POST /podcast/": "PodcastController.add",
  "PUT /podcast/:id": "PodcastController.update",
  "DELETE /podcast/:id": "PodcastController.remove",
};

module.exports = adminRoutes;
