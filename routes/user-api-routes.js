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
  app.get("/api/follow/:userId", (req, res) => {
    if (!req.user.userId) {
      return res.redirect("/signin");
    } else {
      db.User.findByPk(req.params.userId)
        .then((dbUser) => {
          if (dbUser !== null) {
            db.Follower.create({
              followedUserId: req.params.userId,
              UserUserId: req.user.userId,
            })
              .then((dbFollower) => {
                db.User.increment(
                  { followerCount: 1 },
                  { where: { userId: req.params.userId } }
                );
                res.json(dbFollower);
              })
              .catch((err) => {
                res.json(err);
              });
          } else {
            res.json({ error: 'User not found' });
          }
        })
        .catch((err) => {
          res.json(err);
        });
    }
  });

  // Get all followers for a user
  app.get("/api/getFollowers/:userId", (req, res) => {
    db.User.findByPk(req.params.userId).then((dbUser)=>{
      if(dbUser !== null){
        db.Follower.findAll({
          where: {
            followedUserId: req.params.userId,
          },
        })
          .then((dbFollower) => {
            res.json(dbFollower);
          })
          .catch((err) => {
            res.json(err);
          });
      } else {
        res.json('User not found');
      }
    })
    .catch((err) => {
      res.json(err);
    });
  });

  // Get Users that a user is following
  app.get("/api/getFollowing/:userId", (req, res) => {
    db.User.findByPk(req.params.userId).then((dbUser)=>{
      if(dbUser !== null){
        db.Follower.findAll({
          where: {
            UserUserId: req.params.userId,
          },
          include: [{
            model: db.User,
            as: 'User',
            attributes: [ 'name', 'shortName', 'emailAdress', 'username' ]
          }]
        })
          .then((dbFollower) => {
            res.json(dbFollower);
          })
          .catch((err) => {
            res.json(err);
          });
      } else {
        res.json({ error: 'User not found' });
      }
    })
    .catch((err) => {
      res.json(err);
    });
  });

};
