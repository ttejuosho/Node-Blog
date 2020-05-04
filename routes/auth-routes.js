const authController = require('../controllers/auth-controller.js');

module.exports = function(app) {
    app.get('/signin', authController.getSigninPage);
    app.get('/signup', authController.getSignupPage);
    app.post('/signin', authController.signin);
    app.post('/signup', authController.signup);
    app.get('/signout', authController.signout);
// this is the route that prints out the user information from the user table
    app.get('/sessionUserId', authController.sessionUserId);
}