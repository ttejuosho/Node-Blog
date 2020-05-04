const blogController = require('../controllers/blog-controller.js');
const Security = require('../services/security/security.js');
const {check} = require('express-validator');

module.exports = function(app) {
    app.get('/', blogController.getHomePage);
    app.get('/profile', Security.isLoggedIn , blogController.getProfilePage);
    app.get('/newPost', Security.isLoggedIn , blogController.newPostPage);
    app.post('/newPost', Security.isLoggedIn , blogController.createNewPost);
    app.get('/post/:postId', blogController.getPost);
}