const db = require("../models");
const passport = require("passport");
const upload = require("../services/Utils/upload.js");
const {validationResult} = require('express-validator');
const bCrypt = require('bcrypt-nodejs');
const crypto = require('crypto');
const sendEmail = require('../services/email/email.js');


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
              res.render("auth/auth", { error: "Email already exists" });
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
      shortName: req.body.shortName,
      username: req.body.username,
      phoneNumber: req.body.phoneNumber,
    });
  }
};

exports.complete = (req, res) => {
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
        signin: true,
      };
      return res.render("auth/auth", msg);
    }

    req.login(user, (loginErr) => {
      if (loginErr) {
        const msg = {
          error: "Authentication Failed",
          layout: "partials/prelogin",
          signin: true,
        };
        return res.render("auth/auth", msg);
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

exports.sendPasswordResetEmail = (req, res) => {
  const token = crypto.randomBytes(20).toString('hex');
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    errors.layout = 'partials/prelogin';
    errors.iForgot = true;
    return res.render('auth/auth', errors);
  }

  db.User.findOne({
    where: {
      emailAddress: req.body.emailAddress,
    },
  }).then((dbUser) => {
    if (dbUser === null) {
      const errors = { iForgot: true, error: 'Email not found', layout: 'partials/prelogin' };
      return res.render('auth/auth', errors);
    }
    const userInfo = {
      shortName: dbUser.dataValues.shortName,
      emailAddress: dbUser.dataValues.emailAddress,
      resetPasswordToken: token,
      resetPasswordExpires: Date.now() + 3600000,
    };

    const subject = 'Reset Your Bloget Password';
    const emailBody = `
        <p>Hello ${userInfo.shortName},</p>
        <p style="color: black;">Ready to reset your password ?.</p>    
        <p>Click <a href="https://bloget.herokuapp.com/passwordreset/${token}">Reset now</a> to begin.</p>
        <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
        <span style="font-size: 1rem;color: black;"><strong>Bloget Inc.</strong></span>
        `;

        return new Promise((resolve, reject) => {
          sendEmail(emailBody, subject, userInfo.emailAddress);
          db.User.update({resetPasswordExpires: userInfo.resetPasswordExpires, resetPasswordToken: userInfo.resetPasswordToken}, {
            where: {
              userId: dbUser.dataValues.userId,
            },
          });
          const message = { iForgot: true, error: 'Password reset email has been sent to ' + userInfo.emailAddress, layout: 'partials/prelogin'};
          return res.render('auth/auth', message);
        });
  });
}

exports.getResetPasswordPage = (req, res) => {
  db.User.findOne({
    where: {
      resetPasswordToken: req.params.token,
    },
  }).then((dbUser) => {
    if (dbUser === null) {
      const errors = { resetPassword: true, error: 'Invalid password reset token, please request another one.', layout: 'partials/prelogin' };
      return res.render('auth/auth', errors);
    }

    // Check if token matches
    if (!crypto.timingSafeEqual(Buffer.from(dbUser.dataValues.resetPasswordToken), Buffer.from(req.params.token))) {
      const hbsObject = { resetPassword: true, error: 'Invalid password reset token, please request another one.', layout: 'partials/prelogin' };
      return res.render('auth/auth', hbsObject);
    }
    // Check token expiration
    if ((dbUser.dataValues.resetPasswordExpires < Date.now())) {
      const hbsObject = { resetPassword: true, error: 'Your Password reset link has expired, please request another one.', layout: 'partials/prelogin' };
      return res.render('auth/auth', hbsObject);
    }

    const hbsObject = { resetPassword: true, token: req.params.token, layout: 'partials/prelogin' };
    return res.render('auth/auth', hbsObject);
  });
};

exports.resetPassword = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    errors.resetPassword = true,
    errors.token = req.params.token;
    errors.layout = 'partials/prelogin';
    return res.render('auth/auth', errors);
  } else if (req.body.newPassword !== req.body.confirmPassword) {
    const hbsObject = {
      resetPassword: true,
      token: req.params.token,
      error: 'Passwords dont match',
      layout: 'partials/prelogin',
    };
    return res.render('auth/auth', hbsObject);
  } else {
    db.User.findOne({
      where: {
        resetPasswordToken: req.params.token,
      },
    }).then((dbUser) => {
      if (dbUser === null) {
        const errors = { resetPassword: true, error: 'Email not found', layout: 'partials/prelogin' };
        return res.render('auth/auth', errors);
      }
      if ((dbUser.dataValues.resetPasswordExpires > Date.now()) && crypto.timingSafeEqual(Buffer.from(dbUser.dataValues.resetPasswordToken), Buffer.from(req.params.token))) {
        const userPassword = bCrypt.hashSync(req.body.newPassword, bCrypt.genSaltSync(8), null);
        db.User.update({resetPasswordExpires: null, resetPasswordToken: null, password: userPassword}, {
          where: {
            userId: dbUser.dataValues.userId,
          },
        });
        const shortName = dbUser.dataValues.shortName;
        const subject = 'Your Bloget Password has changed';
        const emailBody = `
            <p>Hello ${shortName},</p>
            <p style="color: black;">Your password has been successfully reset.</p>    
            <p>Click <a href="https://bloget.herokuapp.com/signin">here to Log In</a>.</p>
            <span style="font-size: 1rem;color: black;"><strong>Bloget Inc.</strong></span>`;
        return new Promise((resolve, reject) => {
          sendEmail(emailBody, subject, dbUser.dataValues.emailAddress);
          return res.redirect('/signin');
        });
      }
    });
  }
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
