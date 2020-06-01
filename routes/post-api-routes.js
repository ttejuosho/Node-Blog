const db = require("../models");
const sequelize = require("sequelize");
const moment = require("moment");

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
              attributes: ["userId", "username", "name", "shortName"],
            },
          ],
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
        db.Reaction.create({ reaction: req.body.reactionBody })
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
                    "reaction",
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

  // post-like post-dislike // comment-like comment-dislike
  app.get("/api/react/:reactTo/:reaction/:reactToId", (req, res) => {
    if (
      (req.params.reaction.toLowerCase() === "like" ||
        req.params.reaction.toLowerCase() === "dislike") &&
      (req.params.reactTo.toLowerCase() === "post" ||
        req.params.reactTo.toLowerCase() === "comment")
    ) {
      // POST SECTION
      if (req.params.reactTo.toLowerCase() === "post") {
        db.Post.findByPk(req.params.reactToId)
          .then((dbPost) => {
            if (dbPost !== null) {
              var likesCount = dbPost.dataValues.likesCount;
              var dislikesCount = dbPost.dataValues.dislikesCount;

              db.Reaction.findOne({
                where: {
                  UserUserId: req.user.userId,
                  PostPostId: req.params.reactToId,
                },
              }).then((dbReaction) => {
                if (
                  dbReaction === null ||
                  dbReaction.dataValues.reaction !== req.params.reaction
                ) {
                  var updateObject = { dislikesCount: 1 };

                  if (req.params.reaction === "like") {
                    updateObject = { likesCount: 1 };
                  }

                  db.Post.increment(updateObject, {
                    where: { postId: req.params.reactToId },
                  });

                  if (dbReaction.dataValues.reaction) {
                    db.Reaction.update(
                      { reaction: req.params.reaction },
                      {
                        where: {
                          UserUserId: req.user.userId,
                          PostPostId: req.params.reactToId,
                        },
                      }
                    ).then((count) => {
                      if (req.params.reaction === "like") {
                        db.Post.decrement(["dislikesCount"], {
                          where: { postId: req.params.reactToId },
                        });
                        res.json({
                          likesCount: likesCount + 1,
                          dislikesCount: dislikesCount - 1,
                        });
                      } else {
                        db.Post.decrement(["likesCount"], {
                          where: { postId: req.params.reactToId },
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
                      UserUserId: req.user.userId,
                      PostPostId: req.params.reactToId,
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
      }
      // END POST SECTION

      // COMMENT SECTION
      if (req.params.reactTo.toLowerCase() === "comment") {
        db.Comment.findByPk(req.params.reactToId)
          .then((dbComment) => {
            if (dbComment !== null) {
              var likesCount = dbComment.dataValues.likesCount;
              var dislikesCount = dbComment.dataValues.dislikesCount;

              db.Reaction.findOne({
                where: {
                  UserUserId: req.user.userId,
                  CommentCommentId: req.params.reactToId,
                },
              }).then((dbReaction) => {
                if (
                  dbReaction === null ||
                  dbReaction.dataValues.reaction !== req.params.reaction
                ) {
                  var updateObject = { dislikesCount: 1 };

                  if (req.params.reaction === "like") {
                    updateObject = { likesCount: 1 };
                  }

                  db.Comment.increment(updateObject, {
                    where: { commentId: req.params.reactToId },
                  });

                  if (dbReaction !== null) {
                    db.Reaction.update(
                      { reaction: req.params.reaction },
                      {
                        where: {
                          UserUserId: req.user.userId,
                          CommentCommentId: req.params.reactToId,
                        },
                      }
                    ).then((count) => {
                      if (req.params.reaction === "like") {
                        db.Comment.decrement(["dislikesCount"], {
                          where: { commentId: req.params.reactToId },
                        });
                        res.json({
                          likesCount: likesCount + 1,
                          dislikesCount: dislikesCount - 1,
                        });
                      } else {
                        db.Comment.decrement(["likesCount"], {
                          where: { commentId: req.params.reactToId },
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
                      UserUserId: req.user.userId,
                      CommentCommentId: req.params.reactToId,
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
                  res.json({ response: "Action already taken on comment" });
                }
              });
            } else {
              res.json({ error: "Comment not found" });
            }
          })
          .catch((err) => {
            res.json(err);
          });
      }
      // END COMMENT SECTION
    } else {
      res.json({ error: "Wrong parameter passed" });
    }
  });

  app.post("/api/post/comment/:postId", (req, res) => {
    try {
      if (!req.user) {
        return res.json({ response: "Please sign in to post a comment" });
      } else {
        db.Post.findByPk(req.params.postId).then((dbPost) => {
          if (dbPost !== null && dbPost.dataValues.published === true) {
            db.Comment.create({
              commentBody: req.body.commentBody,
              PostPostId: req.params.postId,
              UserUserId: req.user.userId,
            }).then((dbComment) => {
              db.Comment.findByPk(dbComment.dataValues.commentId, {
                include: [{
                  model: db.User,
                  as: "User",
                  attributes: [ "profileImage", "userId", "name" ]
                }]
              })
              .then((data)=>{
                res.json(data);
              })
            });
          }
        });
      }
    } catch (err) {
      res.json(err);
    }
  });

  app.get("/api/post/byTime/:time", (req,res)=>{
    var startDate = new Date(req.params.time);
    //var endDate = new Date(req.params.time2);
    console.log(startDate);
    //console.log(endDate);

    db.Post.findAll({
      where: {
          createdAt: {
            $gt: startDate
          }
      },
      orderBy: [['createdAt', 'DESC']],
    }).then((dbPosts)=>{
      res.json(dbPosts);
    })
  });
};
