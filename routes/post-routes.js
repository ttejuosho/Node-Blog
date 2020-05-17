const postController = require('../controllers/post-controller.js');
const Security = require('../services/security/security.js');
const {check} = require('express-validator');

module.exports = function(app) {
    app.get('/', postController.getHomePage);

    app.get('/newPost', Security.isLoggedIn , postController.newPostPage);

    app.post('/newPost', [ 
        check('postTitle').not().isEmpty().escape().withMessage('Post title is required'),
        check('postDescription').not().isEmpty().escape().withMessage('Post description is required'),
        check('postImage').not().isEmpty().escape().withMessage('Post image is required'),
    ], Security.isLoggedIn , postController.createNewPost);

    app.get('/post/:postId', postController.getPost);

    app.get('/post/edit/:postId', postController.getEditPost);
    app.post('/post/edit/:postId', postController.updatePost);
    
    // app.get('/postdelete/:postId', postController.deletePost);

    // app.get('/postpublish/:postId', postController.publishPost);
    // app.get('/postunpublish/:postId', postController.unpublishPost);
}