const authController = require("../controllers/auth-controller.js");
const { check } = require("express-validator");

module.exports = function (app) {
  app.get("/signin", authController.getSigninPage);
  app.get("/signup", authController.getSignupPage);
  app.get("/iForgot", authController.getiForgotPage);
  app.post(
    "/iForgot",
    [
      check("emailAddress")
        .not()
        .isEmpty()
        .withMessage("Please enter your email address"),
    ],
    authController.sendPasswordResetEmail
  );
  app.get("/passwordreset/:token", authController.getResetPasswordPage);
  app.post(
    "/passwordreset/:token",
    [
      check("newPassword")
        .not()
        .isEmpty()
        .withMessage("Please enter your new password"),
      check("confirmPassword")
        .not()
        .isEmpty()
        .withMessage("Please confirm your new password"),
    ],
    authController.resetPassword
  );

  app.post("/signin", authController.signin);

  app.get("/signout", authController.signout);

  app.post(
    "/join",
    [
      check("emailAddress")
        .not()
        .isEmpty()
        .escape()
        .isEmail()
        .withMessage("Please enter a valid email address"),
    ],
    authController.join
  );

  app.post(
    "/signup",
    [
      check("emailAddress")
        .not()
        .isEmpty()
        .escape()
        .isEmail()
        .withMessage("Please enter your email address"),
      check("name")
        .not()
        .isEmpty()
        .escape()
        .withMessage("Please enter your name"),
      check("phoneNumber")
        .not()
        .isEmpty()
        .escape()
        .withMessage("Please enter your phone number"),
      check("username")
        .not()
        .isEmpty()
        .escape()
        .withMessage("Please enter a unique username"),
    ],
    authController.signup
  );

  app.post("/complete", authController.complete);

  // this is the route that prints out the user information from the user table
  app.get("/sessionUserId", authController.sessionUserId);
};
