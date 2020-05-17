const db = require("../models");

module.exports = (app) => {
  app.get("/api/profile", (req,res)=>{
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
      ]
    }).then((dbUser)=>{
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

  app.get('/api/user/:userId/posts', (req,res)=>{
    db.Post.findAll({
      where: {
          UserUserId: req.params.userId
      }
  }).then((dbPost)=>{
    res.json(dbPost);
  }).catch((err)=>{
    res.json(err);
  });
  });
  
  app.get('/api/user/:userId/posts/:category', (req,res)=>{
    db.Post.findAll({
      where: {
          UserUserId: req.params.userId,
          postCategory: req.params.category,
      }
  }).then((dbPost)=>{
    res.json(dbPost);
  }).catch((err)=>{
    res.json(err);
  });
  });

};
