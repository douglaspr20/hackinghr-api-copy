const adminRoutes = {
  "POST /event/": "EventController.create",
  "PUT /event/:id": "EventController.updateEvent",
  "GET /event/:id/users": "EventController.getEventUsers",
  "GET /podcast/:id": "PodcastController.get",
  "POST /podcast/": "PodcastController.add",
  "PUT /podcast/:id": "PodcastController.update",
  "DELETE /podcast/:id": "PodcastController.remove",
  "GET /marketplace/:id": "MarketPlaceController.get",
  "POST /marketplace/": "MarketPlaceController.add",
  "PUT /marketplace/:id": "MarketPlaceController.update",
  "DELETE /marketplace/:id": "MarketPlaceController.remove",
  "GET /marketplace-categories/:id": "MarketplaceCategoriesController.get",
  "POST /marketplace-categories/": "MarketplaceCategoriesController.add",
  "PUT /marketplace-categories/:id": "MarketplaceCategoriesController.update",
  "DELETE /marketplace-categories/:id": "MarketplaceCategoriesController.remove",
  "GET /library/all/": "LibraryController.getAll",
  "POST /library/": "LibraryController.create",
  "PUT /library/:id": "LibraryController.update",
  "PUT /library/approve/:id": "LibraryController.approve",
  "PUT /library/reject/:id": "LibraryController.reject",
  "PUT /library/recommend/:id": "LibraryController.recommend",
  "POST /category": "CategoryController.create",
  "PUT /category/:id": "CategoryController.update",
  "DELETE /category/:id": "CategoryController.remove",
  "GET /user/all": "UserController.getAll",
};

module.exports = adminRoutes;
