const homeController = require('../controllers/home-controller.js');
const Security = require('../services/security/security.js');

module.exports = function(app) {
    app.get('/', homeController.getHomePage);
    app.get('/c/:category', homeController.getPostsByCategory);
}