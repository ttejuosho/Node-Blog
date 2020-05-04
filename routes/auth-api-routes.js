const db = require("../models");
module.exports = (app) => {
  // Get a User
  app.get("/api/users/:userId", (req, res) => {
    db.User.findAll({
      where: {
        userId: req.params.userId,
      },
      attributes: {
        exclude: ["password"],
      },
    }).then(function (dbUser) {
      res.json(dbUser);
    });
  });

  // Find a User by Email Address
  app.get("/api/users/email/:emailAddress", (req, res) => {
    db.User.findAll({
      where: {
        emailAddress: req.params.emailAddress,
      },
      attributes: {
        exclude: ["password"],
      },
    }).then(function (dbUser) {
      res.json(dbUser);
    });
  });

  // Get all Users
  app.get("/api/users", (req, res) => {
    db.User.findAll({
      attributes: {
        exclude: ["password"],
      },
    }).then(function (dbUser) {
      res.json(dbUser);
    });
  });
};
