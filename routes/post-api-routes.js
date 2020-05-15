const db = require("../models");

module.exports = (app) => {
  // Get all Posts by a User
  app.get("/api/getUserPosts/:userId", (req, res) => {
    db.Post.findAll({
      where: {
        UserUserId: req.params.userId,
      },
    })
      .then(function (dbPost) {
        res.json(dbPost);
      })
      .catch((err) => {
        res.json(err);
      });
  });

  //Create a post
  app.post("/api/createPost", (req, res) => {
    db.Post.create({
      postTitle: req.body.postTitle,
      postDescription: req.body.postDescription,
      postBody: req.body.postBody,
      isDraft: req.body.isDraft,
      UserUserId: req.body.userId,
    })
      .then((dbPost) => {
        res.json(dbPost);
      })
      .catch((err) => {
        res.json(err);
      });
  });

  //Get a post
  app.get("/api/getpost/:postId", (req, res) => {
    db.Post.findByPk(req.params.postId).then((dbPost) => {
      if (dbPost !== null) {
        res.json(dbPost);
      } else {
        res.json("PostId " + req.params.postId + " not found");
      }
    });
  });
  
  //Edit a post
  app.post("/api/editPost/:postId", (req, res) => {
    db.Post.findByPk(req.params.postId).then((dbPost) => {
      if (dbPost !== null) {
        db.Post.update(req.body, {
          where: {
            postId: req.params.postId,
          },
        })
          .then((dbPost) => {
            res.json(dbPost);
          })
          .catch((err) => {
            res.json(err);
          });
      } else {
        return res.json("PostId " + req.params.postId + " not found");
      }
    });
  });
};
