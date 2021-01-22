const adminRoutes = {
  "POST /event/": "EventController.create",
  "PUT /event/:id": "EventController.updateEvent",
  "GET /podcast/:id": "PodcastController.get",
  "POST /podcast/": "PodcastController.add",
  "PUT /podcast/:id": "PodcastController.update",
  "DELETE /podcast/:id": "PodcastController.remove",
  "GET /market-place/:id": "MarketPlaceController.get",
  "POST /market-place/": "MarketPlaceController.add",
  "PUT /market-place/:id": "MarketPlaceController.update",
  "DELETE /market-place/:id": "MarketPlaceController.remove",
};

module.exports = adminRoutes;
