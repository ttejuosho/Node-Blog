const userController = require('../controllers/user-controller.js');
const Security = require('../services/security/security.js');
const {check} = require('express-validator');

module.exports = function(app) {
    app.get('/profile', Security.isLoggedIn , userController.getProfilePage);
    app.get('/profile/:username', userController.getPublicProfilePage);
    app.get('/follow/:userId', Security.isLoggedIn, userController.follow);
    app.get('/@:username', userController.getPublicProfilePage);
}