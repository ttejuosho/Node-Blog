const db = require("../models");

exports.getProfilePagee = (req, res) => {
  db.User.findByPk(req.user.userId, {
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
        const hbsObject = dbUser.toJSON();
        hbsObject.title = "@" + hbsObject.username;
        res.render("user/profile", hbsObject);
      }
    })
    .catch((err) => {
      res.render("error", { error: err });
    });
};

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
        const hbsObject = dbUser.toJSON();
        hbsObject.title = "@" + hbsObject.username;
        res.render("user/profile", hbsObject);
      }
    })
    .catch((err) => {
      res.render("error", { error: err });
    });
};

exports.follow = (req,res) => {
    db.User.findByPk(req.params.userId).then((dbUser)=>{
        if(dbUser !== null){
            db.Follower.create({ followedUserId: req.params.userId }).then((dbFollower)=>{
                db.User.increment({ followerCount: 1 }, { where: { userId: req.params.userId }});
                res.redirect('/profile');
            }).catch((err)=>{
                res.render("error", { error: 'Couldnt complete the follow operation' });
            });
        } else {
            res.redirect('/profile');
        }
    }).catch((err)=>{
        res.render("error", { error: 'Error getting user info' });
    });
};
