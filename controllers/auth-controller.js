const db = require("../models");
const passport = require("passport");
const upload = require("../services/Utils/upload.js");

// Render Signin page
exports.getSigninPage = (req, res) => {
  return res.render("auth/auth", {
    title: "Sign In",
    layout: "partials/prelogin",
    signin: true,
  });
};

// Render Signup page
exports.getSignupPage = (req, res) => {
  return res.render("auth/auth", {
    title: "Sign Up",
    layout: "partials/prelogin",
  });
};

// Render Forgot Password page
exports.getiForgotPage = (req, res) => {
  return res.render("auth/auth", {
    title: "iForgot",
    layout: "partials/prelogin",
    iForgot: true,
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
        res.render("auth/auth", {
          emailAvailable: true,
          emailAddress: req.body.emailAddress,
          layout: "partials/prelogin",
        });
      } else {
        res.render("auth/auth", {
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
                  return res.render("auth/auth", msg);
                }
                req.login(user, (signupErr) => {
                  if (signupErr) {
                    const msg = {
                      error: "Sign up Failed",
                      layout: "partials/prelogin",
                    };
                    return res.render("auth/auth", msg);
                  }

                  return res.render("auth/auth", {
                    layout: "partials/prelogin",
                    userInfoSaved: true,
                    name: user.dataValues.name,
                    shortName: user.dataValues.shortName,
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
        return res.render("auth/auth", {
          emailAvailable: true,
          layout: "partials/prelogin",
          error: "Username is taken",
          emailAddress: req.body.emailAddress,
          shortName: user.body.shortName,
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
    return res.render("auth/auth", {
      emailAvailable: true,
      layout: "partials/prelogin",
      error: "Passwords dont match",
      emailAddress: req.body.emailAddress,
      name: req.body.name,
      shortName: user.body.shortName,
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
          res.render("auth/auth", {
            error: "User not found",
            emailAddress: req.body.emailAddress,
          });
        } else {
          db.User.update(
            {
              tagline: req.body.tagline,
              about: req.body.about,
              twitter: req.body.twitter,
              facebook: req.body.facebook,
              linkedIn: req.body.linkedIn,
              github: req.body.github,
              profileImage: req.file.location,
            },
            {
              where: {
                emailAddress: req.body.emailAddress,
              },
            }
          )
            .then((dbUser) => {
              res.locals.profileImage = req.file.location;
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

exports.iForgot = (req, res) => {
  return res.json("This will send an email to " + req.body.emailAddress);
}

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
