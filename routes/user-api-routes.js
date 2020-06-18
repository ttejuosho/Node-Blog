const db = require("../models");
const {check} = require('express-validator');

module.exports = (app) => {

  app.get("/api/profile", (req, res) => {
    db.User.findByPk(req.user.userId, {
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
        {
          model: db.SavedPost,
          as: "SavedPosts",
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
    if (!req.isAuthenticated()) {
      return res.status(401).json({ response: "Please sign in to follow a user" });
    } else {
      db.User.findOne({
        where: {
          username: req.params.username,
        },
      })
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
                      //console.log(dbFollower);
                      res.status(200).json({ response: "Following" });
                    })
                    .catch((err) => {
                      res.json(err);
                    });
                } else {
                  res.status(200).json({ response: "Youre already following this user." });
                }
              })
              .catch((err) => {
                res.status(500).json(err);
              });
          } else {
            res.status(200).json({ response: "User not found" });
          }
        })
        .catch((err) => {
          res.json(err);
        });
    }
  });

  // Check if following using Ids
  app.get("/api/isuser/:userId/following/:followedUserUsername", (req, res) => {
    db.User.findByPk(req.params.userId).then((dbUser) => {
      if (dbUser !== null) {
        db.User.findOne({
          where: {
            username: req.params.followedUserUsername,
          },
        }).then((dbFollowedUser) => {
          if (dbFollowedUser !== null) {
            db.Follower.findOne({
              where: {
                followedUserUsername: req.params.followedUserUsername,
                UserUserId: req.params.userId,
              },
            }).then((dbFollower) => {
              if (dbFollower !== null) {
                return res.json(true);
              } else {
                return res.json(false);
              }
            });
          } else {
            return res.json(req.params.followedUserUsername + " not found");
          }
        });
      } else {
        return res.json("User Id " + req.params.userId + " not found");
      }
    });
  });

  // Get all followers for a user
  app.get("/api/getFollowers/:username", (req, res) => {
    db.User.findOne({
      where: {
        username: req.params.username,
      },
    })
      .then((dbUser) => {
        if (dbUser !== null) {
          db.Follower.findOne({
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

  app.post("/api/subscribe/:subscribeTo/:subscribeToId", 
  [
    check('subscriberEmail').not().isEmpty().escape().withMessage('Email is required'),
  ]
  ,(req, res) => {
    if (
      req.params.subscribeTo === "user" ||
      req.params.subscribeTo === "post"
    ) {
      
      if(req.body.subscriberEmail === ""){
        return res.json({ subscriberEmailError: "Please enter an email." });
      }

      var updateObj = {
        subscriberEmail: req.body.subscriberEmail,
      };

      if (req.params.subscribeTo === "user") {
        updateObj.UserUserId = req.params.subscribeToId;
      } else {
        updateObj.PostPostId = req.params.subscribeToId;
      }

      if (req.params.subscribeTo === "user") {
        db.User.findByPk(req.params.subscribeToId).then((dbUser) => {
          if (dbUser === null) {
            return res.json({ response: "User not found." });
          }
        });
      }

      if (req.params.subscribeTo === "post") {
        db.Post.findByPk(req.params.subscribeToId).then((dbPost) => {
          if (dbPost === null) {
            return res.json({ response: "Post not found." });
          }
        });
      }

      db.Subscriber.findOne({
        where: updateObj,
      }).then((dbSubscriber) => {
        if (dbSubscriber === null) {
          db.Subscriber.create(updateObj)
            .then((dbSubscriber) => {
              res.json({ response: "You have successfully subscribed."});
            })
            .catch((error) => {
              console.error(error);
            });
        } else {
          res.json({
            response:
              "Youre already subscribed to this " + req.params.subscribeTo,
          });
        }
      });
    } else {
      return res.json({ response: "Wrong parameters received." });
    }
  });

};
