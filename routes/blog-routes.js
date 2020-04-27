const blogController = require('../controllers/blog-controller.js');

module.exports = function(app) {
    app.get('/', blogController.getHomePage);
    app.get('/profile', blogController.getProfilePage);
}