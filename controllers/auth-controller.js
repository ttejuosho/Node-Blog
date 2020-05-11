const db = require("../models");
const passport = require("passport");
const upload = require("../services/Utils/upload.js");
const fs = require("fs");
const AWS = require("aws-sdk");

// Render Signin page
exports.getSigninPage = (req, res) => {
  return res.render("auth/signin", {
    title: "Sign In",
    layout: "partials/prelogin",
  });
};

exports.getRegisterPage = (req, res) => {
  return res.render("auth/getemail", {
    title: "Register",
    layout: "partials/prelogin",
  });
}

exports.getUserInfoPage = (req, res) => {
  return res.render("auth/getUserInfo", {
    title: "Sign Up",
    layout: "partials/prelogin",
  });
};

exports.join = (req, res) => {
  db.User.findOne({
    where: {
      emailAddress: req.body.emailAddress
    }
  }).then((dbUser)=>{
    if (dbUser === null){
      res.render("auth/getUserInfo", { emailAddress: req.body.emailAddress, layout: "partials/prelogin" })
    } else {
      res.render("auth/signin", { error: "Email already exists" });
    }
  })
}

exports.saveUserInfo = (req, res, next) => {
  db.User.findOne({
    where: {
      emailAddress: req.body.emailAddress
    }
  }).then((dbUser)=>{
    if (dbUser === null){
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
    
          res.render("auth/getMoreInfo", {
            layout: "partials/prelogin",
            userId: user.userId,
            name: user.name,
            username: user.username,
            emailAddress: user.emailAddress
          });
        });
      })(req, res, next);
    } else {
      res.render("auth/signin", { error: "Email already exists" });
    }
  })
}

exports.saveMoreInfo = (req, res) => {
  const singleUpload = upload.single('profileImage');
  singleUpload(req, res, (err) => {
    if (err) {
      return res.status(422).send({errors: [{title: 'Image Upload Error', detail: err.message}]});
    }
    db.User.findOne({
      where: {
        emailAddress: req.body.emailAddress,
        username: req.body.username
      }
    }).then((dbUser)=>{ 
      if (dbUser === null){
        res.render("auth/signin", { error: "User not found" });
      } else {
        db.User.update({
          tagline: req.body.tagline,
          about: req.body.about,
          profileImage: req.file.location
        }, {
          where: {
            emailAddress: req.body.emailAddress
          }
        }).then((dbUser) => {
          res.render("user/profile", dbUser.dataValues);
        }).catch((err)=>{
          res.render("error", { error: err });
        })
      }
    });
    //console.log(`File uploaded successfully. ${req.file.location}`);

  });
}

// Render Signup page
exports.getSignupPage = (req, res) => {
  return res.render("auth/signup", {
    title: "Sign Up",
    layout: "partials/prelogin",
  });
};

exports.signup = (req, res, next) => {
  const singleUpload = upload.single('profileImage');
  singleUpload(req, res, (err) => {
    if (err) {
      return res.status(422).send({errors: [{title: 'Image Upload Error', detail: err.message}]});
    }

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
        req.session.globalUser["username"] = user.username;
        req.session.globalUser["emailAddress"] = user.emailAddress;
        req.session.globalUser["phoneNumber"] = user.phoneNumber;
        req.session.globalUser["profileImage"] = req.file.location;
        res.redirect("/newPost");
      });
    })(req, res, next);

    //console.log(`File uploaded successfully. ${req.file.location}`);
  });
};

exports.signupp = (req, res, next) => {
  upload(req, res, (err) => {
    console.log(req.files.profileImage);
    if (req.files === undefined) {
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

exports.signout = function (req, res) {
  req.session.destroy(function (err) {
    res.redirect("/signin");
  });
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
