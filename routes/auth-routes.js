const authController = require('../controllers/auth-controller.js');
const {check} = require('express-validator');

module.exports = function(app) {
    app.get('/signin', authController.getSigninPage);
    app.get('/signup', authController.getSignupPage);
    app.get('/iForgot', authController.getiForgotPage);
    app.post('/iForgot', authController.iForgot);    
    app.post('/signin', authController.signin);

    app.get('/signout', authController.signout);

    app.post('/join', [
        check('emailAddress').not().isEmpty().escape().isEmail().withMessage('Please enter a valid email address')
    ], authController.join);

    app.post('/signup', [
        check('emailAddress').not().isEmpty().escape().isEmail().withMessage('Please enter your email address'),
        check('name').not().isEmpty().escape().withMessage('Please enter your name'),
        check('phoneNumber').not().isEmpty().escape().withMessage('Please enter your phone number'),
        check('username').not().isEmpty().escape().withMessage('Please enter a unique username'),
    ], authController.signup);

    app.post('/finish', authController.finish);
    
// this is the route that prints out the user information from the user table
    app.get('/sessionUserId', authController.sessionUserId);
}