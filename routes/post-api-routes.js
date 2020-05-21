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
    db.Post.findByPk(req.params.postId, {
      include: [
        {
          model: db.User,
          as: "User",
          attributes: [
            "userId",
            "username",
            "name",
            "shortName",
            "profileImage",
            "about",
            "linkedIn",
            "facebook",
            "twitter",
            "github",
          ],
        },
        {
          model: db.Comment,
          as: "Comments",
          attributes: [
            "commentId",
            "commentBody",
            "likesCount",
            "dislikesCount",
            "UserUserId",
            "PostPostId",
            "createdAt",
          ],
          include: [
            {
              model: db.User,
              as: "User",
              attributes: [
                "userId",
                "username",
                "name",
                "shortName",
              ]
            }
          ]
        },
      ],
    }).then((dbPost) => {
      if (dbPost !== null) {
        res.json(dbPost);
      } else {
        res.json({ error: "PostId: " + req.params.postId + " not found" });
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

  // Creation a new reaction to a post , increments reactionCount for the post
  app.post("/api/newReaction/:postId", (req, res) => {
    db.Post.findByPk(req.params.postId).then((dbPost) => {
      if (dbPost !== null) {
        db.Reaction.create({ reactionBody: req.body.reactionBody })
          .then((dbReaction) => {
            db.Post.increment(
              { reactionCount: 1 },
              { where: { postId: req.params.postId } }
            );
            db.Post.findByPk(req.params.postId, {
              include: [
                {
                  model: db.Reaction,
                  limit: 10,
                  as: "Reaction",
                  attributes: [
                    "reactionId",
                    "reactionBody",
                    "likesCount",
                    "dislikesCount",
                  ],
                },
              ],
            })
              .then((dbPost) => {
                res.json(dbPost);
              })
              .catch((err) => {
                res.json(err);
              });
          })
          .catch((err) => {
            res.json(err);
          });
      }
    });
  });

  // Get all reactions to a post
  app.get("/api/getReactions/:postId", (req, res) => {
    db.Reaction.findAll({
      where: {
        PostPostId: req.params.postId,
      },
    })
      .then((dbReaction) => {
        res.json(dbReaction);
      })
      .catch((err) => {
        res.json(err);
      });
  });

  app.get("/api/react/:reaction/:postId", (req, res) => {
    if (
      req.params.reaction.toLowerCase() === "like" ||
      req.params.reaction.toLowerCase() === "dislike"
    ) {
      db.Post.findByPk(req.params.postId)
        .then((dbPost) => {
          if (dbPost !== null) {
            var likesCount = dbPost.dataValues.likesCount;
            var dislikesCount = dbPost.dataValues.dislikesCount;

            db.Reaction.findOne({
              where: {
                userId: req.user.userId,
                postId: req.params.postId,
              },
            }).then((dbReaction) => {

              if (
                dbReaction === null ||
                dbReaction.dataValues.reaction !== req.params.reaction
              ) {
                if (req.params.reaction === "like") {
                  var changeThis = { likesCount: 1 };
                } else {
                  changeThis = { dislikesCount: 1 };
                }

                db.Post.increment(changeThis, {
                  where: { postId: req.params.postId },
                });

                if (dbReaction.dataValues.reaction) {
                  db.Reaction.update(
                    { reaction: req.params.reaction },
                    {
                      where: {
                        userId: req.user.userId,
                        postId: req.params.postId,
                      },
                    }
                  ).then((count) => {
                    if (req.params.reaction === "like") {
                      db.Post.decrement(["dislikesCount"], {
                        where: { postId: req.params.postId },
                      });
                      res.json({
                        likesCount: likesCount + 1,
                        dislikesCount: dislikesCount - 1,
                      });
                    } else {
                      db.Post.decrement(["likesCount"], {
                        where: { postId: req.params.postId },
                      });
                      res.json({
                        likesCount: likesCount - 1,
                        dislikesCount: dislikesCount + 1,
                      });
                    }
                  });
                }

                if (dbReaction === null) {
                  db.Reaction.create({
                    userId: req.user.userId,
                    postId: req.params.postId,
                    reaction: req.params.reaction,
                  }).then((count) => {
                    if (req.params.reaction === "like") {
                      res.json({ count: likesCount + 1 });
                    } else {
                      res.json({ count: dislikesCount + 1 });
                    }
                  });
                }
              } else {
                res.json({ response: "Action already taken on post" });
              }
            });
          } else {
            res.json({ error: "Post not found" });
          }
        })
        .catch((err) => {
          res.json(err);
        });
    } else {
      res.json({ error: "Wrong parameter passed" });
    }
  });

  app.post('/api/comment/:postId', (req,res)=>{
    if(!req.user){
      return res.json({ response: "Please sign in to post a comment"});
    } else {
          db.Post.findByPk(req.params.postId).then((dbPost)=>{
      if (dbPost !== null && dbPost.dataValues.published === true){
        db.Comment.create({ commentBody: req.body.commentBody, PostPostId: req.params.postId, UserUserId: req.user.userId }).then((dbComment)=>{
          res.json(dbComment);
        })
      }
    }).catch((err)=>{
      res.json(err);
    });
    }

  });
};
