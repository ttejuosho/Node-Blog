const authController = require('../controllers/auth-controller.js');
//const passport = require('passport');

module.exports = function(app) {
    app.get('/signin', authController.getSigninPage);
    app.get('/signup', authController.getSignupPage);
    app.post('/signin', authController.signin);
    app.post('/signup', authController.signup);
}