const postController = require('../controllers/post-controller.js');
const Security = require('../services/security/security.js');
const {check} = require('express-validator');

module.exports = function(app) {
    app.get('/', postController.getHomePage);
    app.get('/newPost', Security.isLoggedIn , postController.newPostPage);
    app.post('/newPost', Security.isLoggedIn , postController.createNewPost);
    app.get('/post/:postId', postController.getPost);
}