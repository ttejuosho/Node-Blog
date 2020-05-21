const db = require("../models");

module.exports = (app) => {
  app.get("/api/profile", (req, res) => {
    db.User.findByPk(req.session.passport.user, {
      attributes: {
        exclude: ["password"],
      },
      include: [
        {
          model: db.Post,
          as: "Posts",
          attributes: [
            "postId",
            "postTitle",
            "postBody",
            "postImage",
            "postDescription",
            "isDraft",
            "published",
            "viewCount",
          ],
        },
      ],
    }).then((dbUser) => {
      res.json(dbUser);
    });
  });

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
          attributes: [
            "postId",
            "postTitle",
            "postBody",
            "postImage",
            "postDescription",
            "isDraft",
            "published",
            "viewCount",
          ],
        },
      ],
    })
      .then((dbUser) => {
        res.json(dbUser);
      })
      .catch((err) => {
        res.json(err);
      });
  });

  app.get("/api/user/:userId/posts", (req, res) => {
    db.Post.findAll({
      where: {
        UserUserId: req.params.userId,
      },
    })
      .then((dbPost) => {
        res.json(dbPost);
      })
      .catch((err) => {
        res.json(err);
      });
  });

  app.get("/api/user/:userId/posts/:category", (req, res) => {
    db.Post.findAll({
      where: {
        UserUserId: req.params.userId,
        postCategory: req.params.category,
      },
    })
      .then((dbPost) => {
        res.json(dbPost);
      })
      .catch((err) => {
        res.json(err);
      });
  });

  // Follow a User
  app.get("/api/follow/:username", (req, res) => {
    if (!req.user.userId) {
      return res.redirect("/signin");
    } else {
      db.User.findByPk(req.params.username)
        .then((dbUser) => {
          if (dbUser !== null) {
            db.Follower.findOne({
              where: {
                followedUserUsername: req.params.username,
                UserUserId: req.user.userId,
              },
            })
              .then((dbFollower) => {
                if (dbFollower === null) {
                  db.Follower.create({
                    followedUserUsername: req.params.username,
                    UserUserId: req.user.userId,
                  })
                    .then((dbFollower) => {
                      db.User.increment(
                        { followerCount: 1 },
                        { where: { userId: req.params.username } }
                      );
                      res.json(dbFollower);
                    })
                    .catch((err) => {
                      res.json(err);
                    });
                } else {
                  res.json({ response: "Youre already following this user." });
                }
              })
              .catch((err) => {
                res.json(err);
              });
          } else {
            res.json({ error: "User not found" });
          }
        })
        .catch((err) => {
          res.json(err);
        });
    }
  });

  // Get all followers for a user
  app.get("/api/getFollowers/:username", (req, res) => {
    db.User.findByPk(req.params.username)
      .then((dbUser) => {
        if (dbUser !== null) {
          db.Follower.findAll({
            where: {
              followedUserUsername: req.params.username,
            },
          })
            .then((dbFollower) => {
              res.json(dbFollower);
            })
            .catch((err) => {
              res.json(err);
            });
        } else {
          res.json("User not found");
        }
      })
      .catch((err) => {
        res.json(err);
      });
  });

  // Get Users that a user is following
  app.get("/api/getFollowing/:userid", (req, res) => {
    db.User.findByPk(req.params.userId)
      .then((dbUser) => {
        if (dbUser !== null) {
          db.Follower.findAll({
            where: {
              UserUserId: req.params.userId,
            },
            include: [
              {
                model: db.User,
                as: "User",
                attributes: ["name", "shortName", "emailAdress", "username"],
              },
            ],
          })
            .then((dbFollower) => {
              res.json(dbFollower);
            })
            .catch((err) => {
              res.json(err);
            });
        } else {
          res.json({ error: "User not found" });
        }
      })
      .catch((err) => {
        res.json(err);
      });
  });
};
