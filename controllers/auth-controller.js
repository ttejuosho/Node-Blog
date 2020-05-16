const db = require("../models");
const passport = require("passport");
const upload = require("../services/Utils/upload.js");

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

exports.signout = function (req, res) {
  req.session.destroy(function (err) {
    res.redirect("/signin");
  });
};

exports.join = (req, res) => {
  db.User.findOne({
    where: {
      emailAddress: req.body.emailAddress,
    },
  })
    .then((dbUser) => {
      if (dbUser === null) {
        res.render("auth/signup", {
          emailAvailable: true,
          emailAddress: req.body.emailAddress,
          layout: "partials/prelogin",
        });
      } else {
        res.render("auth/signup", {
          error: "Email already exists",
          layout: "partials/prelogin",
        });
      }
    })
    .catch((err) => {
      res.render("error", { error: err });
    });
};

exports.signup = (req, res, next) => {
  if(req.body.password === req.body.confirmPassword){
  db.User.findOne({
    where: {
      username: req.body.username,
    },
  })
    .then((dbUser) => {
      if (dbUser === null) {
        db.User.findOne({
          where: {
            emailAddress: req.body.emailAddress,
          },
        })
          .then((dbUser) => {
            if (dbUser === null) {
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

                  return res.render("auth/signup", {
                    layout: "partials/prelogin",
                    userInfoSaved: true,
                    isLoggedIn: true,
                    name: user.dataValues.name,
                    username: user.dataValues.username,
                    emailAddress: user.dataValues.emailAddress,
                    userId: user.dataValues.userId,
                    phoneNumber: req.body.phoneNumber,
                  });
                });
              })(req, res, next);
            } else {
              res.render("auth/signin", { error: "Email already exists" });
            }
          })
          .catch((err) => {
            res.render("error", { error: err });
          });
      } else {
        return res.render("auth/signup", {
          emailAvailable: true,
          layout: "partials/prelogin",
          error: "Username is taken",
          emailAddress: req.body.emailAddress,
          name: req.body.name,
          username: req.body.username,
          phoneNumber: req.body.phoneNumber,
        });
      }
    })
    .catch((err) => {
      res.render("error", { error: err });
    });
  } else {
    return res.render("auth/signup", {
      emailAvailable: true,
      layout: "partials/prelogin",
      error: "Passwords dont match",
      emailAddress: req.body.emailAddress,
      name: req.body.name,
      username: req.body.username,
      phoneNumber: req.body.phoneNumber,
    });
  }
};

exports.finish = (req, res) => {
  const singleUpload = upload.single("profileImage");
  singleUpload(req, res, (err) => {
    if (err) {
      return res.status(422).send({
        errors: [{ title: "Image Upload Error", detail: err.message }],
      });
    }

    db.User.findOne({
      where: {
        emailAddress: req.body.emailAddress,
        username: req.body.username,
      },
    })
      .then((dbUser) => {
        if (dbUser === null) {
          res.render("auth/signup", {
            error: "User not found",
            emailAddress: req.body.emailAddress,
            userId: req.body.userId,
          });
        } else {
          db.User.update(
            {
              tagline: req.body.tagline,
              about: req.body.about,
              twitter: req.body.twitter,
              facebook: req.body.facebook,
              linkedIn: req.body.linkedIn,
              profileImage: req.file.location,
            },
            {
              where: {
                emailAddress: req.body.emailAddress,
              },
            }
          )
            .then((dbUser) => {
              req.session.globalUser["profileImage"] = req.file.location;
              res.redirect("/profile");
            })
            .catch((err) => {
              res.render("error", { error: err });
            });
        }
      })
      .catch((err) => {
        res.render("error", { error: err });
      });

    console.log(`File uploaded successfully. || ${req.file}`);
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
      req.session.globalUser["username"] = user.username;
      req.session.globalUser["emailAddress"] = user.emailAddress;
      req.session.globalUser["phoneNumber"] = user.phoneNumber;
      req.session.globalUser["profileImage"] = user.profileImage;
      return res.redirect("/profile");
    });
  })(req, res, next);
};



// prints out the user info from the session id
exports.sessionUserId = function (req, res) {
  // body of the session
  const sessionUser = req.session;
  // console.log the id of the user
  console.log(sessionUser.cookie, " ======Cookie=====");
  console.log(sessionUser.passport.user, " ======Logged in User UUID=====");

  db.User.findAll({
    where: {
      userId: req.session.passport.user,
    },
  }).then(function (dbUser) {
    res.json(dbUser);
  });
};
