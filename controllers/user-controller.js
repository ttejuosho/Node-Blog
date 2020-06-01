const db = require("../models");

exports.getProfilePage = (req, res) => {
  db.Post.findAll({
    where: {
      UserUserId: req.user.userId,
      deleted: false,
    },
    order: [["createdAt", "DESC"]],
  })
    .then((dbPost) => {
      var hbsObject = { Posts: [] };
      if (dbPost !== null) {
        for (var i = 0; i < dbPost.length; i++) {
          hbsObject.Posts.push(dbPost[i].dataValues);
        }
        hbsObject.isOwner = true;
        res.render("user/profile", hbsObject);
      }
    })
    .catch((err) => {
      res.render("error", { error: err });
    });
};

exports.getPublicProfilePage = (req, res) => {
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
          "published",
          "isDraft",
          "viewCount",
          "createdAt",
        ],
      },
    ],
  })
    .then((dbUser) => {
      if (dbUser !== null) {
        var hbsObject = dbUser.toJSON();
        hbsObject.title = "@" + hbsObject.username;
        hbsObject.isOwner = false;
        hbsObject.following = false;
      } else {
        return res.render("error", { error: "User not found" });
      }

      // Check if whos following who
      if (req.user) {
        db.Follower.findOne({
          where: {
            followedUserUsername: req.params.username,
            UserUserId: req.user.userId,
          },
        }).then((dbFollower) => {
          if (dbFollower !== null) {
            hbsObject.following = true;
          }
          return res.render("user/profile", hbsObject);
        });
      } else {
        return res.render("user/profile", hbsObject);
      }
      
      //console.log(hbsObject);

    })
    .catch((err) => {
      res.render("error", { error: err });
    });
};

exports.follow = (req, res) => {
  if (req.params.userId) {
    db.User.findByPk(req.params.userId)
      .then((dbUser) => {
        if (dbUser !== null) {
          db.Follower.findOne({
            where: {
              followedUserUsername: req.params.username,
              UserUserId: req.user.userId,
            },
          }).then((dbFollower) => {
            if (dbFollower === null) {
              db.Follower.create({
                followedUserUsername: req.params.username,
                UserUserId: req.user.userId,
              })
                .then((dbFollower) => {
                  db.User.increment(
                    { followerCount: 1 },
                    { where: { username: req.params.username } }
                  );
                  res.redirect("/profile");
                })
                .catch((err) => {
                  res.render("error", {
                    error: "Couldnt complete the follow operation",
                  });
                });
            } else {
              res.json({ response: "Youre already following this user." });
            }
          });
        } else {
          res.redirect("/profile");
        }
      })
      .catch((err) => {
        res.render("error", { error: "Error getting user info" });
      });
  } else {
    res.redirect("/signin");
  }
};
