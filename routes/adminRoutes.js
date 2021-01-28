const adminRoutes = {
  "POST /event/": "EventController.create",
  "PUT /event/:id": "EventController.updateEvent",
  "GET /podcast/:id": "PodcastController.get",
  "POST /podcast/": "PodcastController.add",
  "PUT /podcast/:id": "PodcastController.update",
  "DELETE /podcast/:id": "PodcastController.remove",
  "GET /marketplace/:id": "MarketplaceController.get",
  "POST /marketplace/": "MarketplaceController.add",
  "PUT /marketplace/:id": "MarketplaceController.update",
  "DELETE /marketplace/:id": "MarketplaceController.remove",
  "GET /marketplace-categories/:id": "MarketplaceCategoriesController.get",
  "POST /marketplace-categories/": "MarketplaceCategoriesController.add",
  "PUT /marketplace-categories/:id": "MarketplaceCategoriesController.update",
  "DELETE /marketplace-categories/:id": "MarketplaceCategoriesController.remove",
};

module.exports = adminRoutes;
