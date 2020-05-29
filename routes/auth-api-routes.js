const db = require("../models");
module.exports = (app) => {
  // Get a User by ID
  app.get("/api/users/id/:userId", (req, res) => {
    db.User.findByPk(req.params.userId, {
      attributes: {
        exclude: ["password"],
      },
    }).then(function (dbUser) {
      res.json(dbUser);
    });
  });

  // Get a User by username
  app.get("/api/users/username/:username", (req, res) => {
    db.User.findOne({
      where: {
        username: req.params.username,
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
    db.User.findOne({
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

  // Get a User Profile by username (UserInfo + Posts)
  app.get("/api/profile/:username", (req, res) => {
    db.User.findOne({
      where: {
        username: req.params.username,
      },
      attributes: {
        exclude: ["password"],
      },
      include: [
        {
          model: db.Post,
          as: "Posts",
          where: {
            deleted: false,
            published: true,
          },
          attributes: [
            "postId",
            "postTitle",
            "postBody",
            "postImage",
            "postDescription",
            "published",
            "isDraft",
            "viewCount",
            "createdAt",
          ],
        },
      ],
    }).then(function (dbUser) {
      res.json(dbUser);
    });
  });
};