const postController = require('../controllers/post-controller.js');
const Security = require('../services/security/security.js');
const {check} = require('express-validator');

module.exports = function(app) {

    app.get('/newPost', Security.isLoggedIn , postController.newPostPage);

    app.post('/newPost', [ 
        check('postTitle').not().isEmpty().escape().withMessage('Post title is required'),
        check('postDescription').not().isEmpty().escape().withMessage('Post description is required'),
        check('postImage').not().isEmpty().escape().withMessage('Post image is required'),
    ], Security.isLoggedIn , postController.createNewPost);

    app.get('/post/:postId', postController.getPost);

    app.get('/post/edit/:postId', postController.getEditPost);
    app.post('/post/edit/:postId', postController.updatePost);

    app.get('/post/delete/:postId', postController.deletePost);

    app.get('/post/publish/:postId', postController.publishPost);
    app.get('/post/unpublish/:postId', postController.unpublishPost);
    app.get('/post/getcomments/:postId', postController.getCommentsPage);
    app.post('/post/newcomment/:postId', Security.isLoggedIn, postController.commentOnPost);
    app.get('/recentlyviewed', Security.isLoggedIn, postController.recentlyViewed);
    app.get('/savePost', Security.isLoggedIn, postController.savePost);
}