const db = require("../models");
const passport = require('passport');
const upload = require('../services/utils/utils.js');

// Render Signin page
exports.getSigninPage = (req, res) => {
  return res.render("auth/signin", {
    title: "Sign In",
    layout: "partials/prelogin",
  });
};

// Render Signup page
exports.getSignupPage = (req, res) => {
  return res.render("auth/signup", {
    title: "Sign Up",
    layout: "partials/prelogin",
  });
};

exports.signup = (req, res, next) => {
  upload(req, res, (err) => {
    if (req.file === undefined) {
      const msg = {
        error: "Sign Up Failed: No Image Attached",
        layout: "partials/prelogin",
      };
      return res.render("auth/signup", msg);
    } else if (
      req.body.name == "" ||
      req.body.emailAddress == "" ||
      req.body.phoneNumber == ""
    ) {
      const msg = {
        error: "Name, Email, & Phone Number required",
        layout: "partials/prelogin",
      };
      return res.render("auth/signup", msg);
    } else if (err) {
      const msg = {
        error: "Sign Up Failed",
        layout: "partials/prelogin",
      };
      return res.render("auth/signup", msg);
    } else {
      passport.authenticate("local-signup", (err, user, info) => {
        if (err) {
          return next(err); // will generate a 500 error
        }
        if (!user) {
          const msg = {
            error: "Sign Up Failed: Username already exists",
            layout: "partials/prelogin",
          };
          return res.render("auth/signup", msg);
        }
        req.login(user, (signupErr) => {
          if (signupErr) {
            const msg = {
              error: "Sign up Failed",
              layout: "partials/prelogin",
            };
            return res.render("auth/signup", msg);
          }

          req.session.globalUser = {};
          req.session.globalUser["userId"] = user.userId;
          req.session.globalUser["name"] = user.name;
          req.session.globalUser["emailAddress"] = user.emailAddress;
          req.session.globalUser["phoneNumber"] = user.phoneNumber;
          req.session.globalUser["profileImage"] = user.profileImage;
          res.redirect("/newPost");
        });
      })(req, res, next);
    }
  });
};

exports.signin = (req, res, next) => {
  passport.authenticate("local-signin", function (err, user, info) {
    if (err) {
      return next(err); // will generate a 500 error
    }
    // User is boolean
    if (!user) {
      const msg = {
        error: "Your Username or Password was incorrect",
        layout: "partials/prelogin",
      };
      return res.render("auth/signin", msg);
    }

    req.login(user, (loginErr) => {
      if (loginErr) {
        const msg = {
          error: "Authentication Failed",
          layout: "partials/prelogin",
        };
        return res.render("auth/signin", msg);
      }

      req.session.globalUser = {};
      req.session.globalUser["userId"] = user.userId;
      req.session.globalUser["name"] = user.name;
      req.session.globalUser["emailAddress"] = user.emailAddress;
      req.session.globalUser["phoneNumber"] = user.phoneNumber;
      req.session.globalUser["profileImage"] = user.profileImage;
      return res.redirect("/newPost");
    });
  })(req, res, next);
};

exports.signout = function(req, res) {
  req.session.destroy(function(err) {
    res.redirect('/signin');
  });
};

// prints out the user info from the session id
exports.sessionUserId = function(req, res) {
  // body of the session
  const sessionUser = req.session;
  // console.log the id of the user
  console.log(sessionUser.cookie, ' ======Cookie=====');
  console.log(sessionUser.passport.user, ' ======Logged in User UUID=====');

  db.User.findAll({
    where: {
      userId: req.session.passport.user,
    },
  }).then(function(dbUser) {
    res.json(dbUser);
  });
};