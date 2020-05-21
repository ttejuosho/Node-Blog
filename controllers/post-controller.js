const db = require("../models");
const upload = require("../services/Utils/upload.js");
const sequelize = require("sequelize");

// Render new home page
exports.getHomePage = (req, res) => {
  return res.render("index", {
    title: "TaiBlog",
  });
};

exports.newPostPage = (req, res) => {
  return res.render("post/newPost", {
    title: "New Post",
  });
};

exports.createNewPost = (req, res) => {
  const singleUpload = upload.single("postImage");
  singleUpload(req, res, (err) => {
    if (err) {
      return res.status(422).send({
        errors: [{ title: "Image Upload Error", detail: err.message }],
      });
    }

    const postData = {
      postTitle: req.body.postTitle,
      postDescription: req.body.postDescription,
      postBody: req.body.postBody,
      postCategory: req.body.postCategory,
      postImage: req.file.location,
      UserUserId: req.session.passport.user,
      isDraft: req.body.action === "Save Draft" ? true : false,
      published: req.body.action === "Save Draft" ? false : true,
    };

    db.Post.create(postData)
      .then((dbPost) => {
        res.redirect("/profile");
      })
      .catch((err) => {
        res.render("error", { error: err });
      });

    console.log(`File uploaded successfully. || ${req.file.location}`);
  });
};

exports.getPost = (req, res) => {
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
        limit: 10,
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
            attributes: ["userId","username", "name", "shortName"],
          },
        ],
      },
    ],
  })
    .then((dbPost) => {
      if (dbPost !== null) {
        if(dbPost.dataValues.deleted === true){
          return res.render("post/viewPost", { message: "This post has been removed." });
        }
        var hbsObject = {
          postId: dbPost.dataValues.postId,
          postTitle: dbPost.dataValues.postTitle,
          postBody: dbPost.dataValues.postBody,
          postCategory: dbPost.dataValues.postCategory,
          postDescription: dbPost.dataValues.postDescription,
          postImage: dbPost.dataValues.postImage,
          isDraft: dbPost.dataValues.isDraft,
          published: dbPost.dataValues.published,
          viewCount: dbPost.dataValues.viewCount,
          likesCount: dbPost.dataValues.likesCount,
          dislikesCount: dbPost.dataValues.dislikesCount,
          userId: dbPost.dataValues.UserUserId,
          createdAt: dbPost.dataValues.createdAt,
          postAuthorUsername: dbPost.User.dataValues.username,
          postAuthorName: dbPost.User.dataValues.name,
          postAuthorShortName: dbPost.User.dataValues.shortName,
          postAuthorAbout: dbPost.User.dataValues.about,
          postAuthorLinkedIn: dbPost.User.dataValues.linkedIn,
          postAuthorFacebook: dbPost.User.dataValues.facebook,
          postAuthorTwitter: dbPost.User.dataValues.twitter,
          postAuthorGithub: dbPost.User.dataValues.github,
          Comments: [],
        };

        for (var i = 0; i < dbPost.dataValues.Comments.length; i++) {
          hbsObject.Comments.push(dbPost.dataValues.Comments[i].dataValues);
          hbsObject.Comments[i].commentBy = dbPost.dataValues.Comments[i].User.dataValues.name;
          hbsObject.Comments[i].commentByUserId = dbPost.dataValues.Comments[i].User.dataValues.userId;
        }

        //When not signed in or another user is viewing post, ViewCount increment
        if (
          !req.isAuthenticated ||
          res.locals.userId !== dbPost.dataValues.UserUserId
        ) {
          db.Post.increment(
            { viewCount: 1 },
            { where: { postId: req.params.postId } }
          );
        }

        return res.render("post/viewPost", hbsObject);
      } else {
        return res.render("post/viewPost", { message: "Post not found" });
      }
    })
    .catch((err) => {
      res.render("error", { error: err });
    });
};

exports.getEditPost = (req, res) => {
  db.Post.findOne({
    where: {
      postId: req.params.postId,
      UserUserId: res.locals.userId,
    },
  })
    .then((dbPost) => {
      if (dbPost !== null) {
        var hbsObject = {
          postId: dbPost.dataValues.postId,
          postTitle: dbPost.dataValues.postTitle,
          postBody: dbPost.dataValues.postBody,
          postCategory: dbPost.dataValues.postCategory,
          postDescription: dbPost.dataValues.postDescription,
          postImage: dbPost.dataValues.postImage,
          isDraft: dbPost.dataValues.isDraft,
          published: dbPost.dataValues.published,
          viewCount: dbPost.dataValues.viewCount,
          editMode: true,
        };
        //console.log(hbsObject);
        return res.render("post/newPost", hbsObject);
      }
    })
    .catch((err) => {
      res.render("error", { error: err });
    });
};

exports.updatePost = (req, res) => {
  const singleUpload = upload.single("postImage");
  singleUpload(req, res, (err) => {
    if (err) {
      return res.status(422).send({
        errors: [{ title: "Image Upload Error", detail: err.message }],
      });
    }

    db.Post.findOne({
      where: {
        postId: req.params.postId,
        UserUserId: res.locals.userId,
      },
    })
      .then((dbPost) => {
        if (dbPost !== null) {
          const postData = {
            postTitle: req.body.postTitle,
            postDescription: req.body.postDescription,
            postBody: req.body.postBody,
            postCategory: req.body.postCategory,
            postImage: req.file
              ? req.file.location
              : dbPost.dataValues.postImage,
            isDraft: req.body.action === "Save Draft" ? true : false,
            published: req.body.action === "Save Draft" ? false : true,
          };

          //console.log(req.file);

          db.Post.update(postData, {
            where: {
              postId: req.params.postId,
            },
          })
            .then((dbPost) => {
              res.redirect("/profile");
            })
            .catch((err) => {
              res.render("error", err);
            });
        }
      })
      .catch((err) => {
        res.render("error", err);
      });
  });
};

exports.publishPost = (req, res) => {
  db.Post.findOne({
    where: {
      postId: req.params.postId,
      UserUserId: res.locals.userId,
    },
  })
    .then((dbPost) => {
      if (dbPost !== null) {
        db.Post.update(
          { published: true, isDraft: false },
          {
            where: {
              postId: req.params.postId,
            },
          }
        )
          .then((dbPost) => {
            res.redirect("/profile");
          })
          .catch((err) => {
            res.render("error", err);
          });
      }
    })
    .catch((err) => {
      res.render("error", err);
    });
};

exports.unpublishPost = (req, res) => {
  db.Post.findOne({
    where: {
      postId: req.params.postId,
      UserUserId: res.locals.userId,
    },
  })
    .then((dbPost) => {
      if (dbPost !== null) {
        db.Post.update(
          { published: false, isDraft: true },
          {
            where: {
              postId: req.params.postId,
            },
          }
        )
          .then((dbPost) => {
            res.redirect("/profile");
          })
          .catch((err) => {
            res.render("error", err);
          });
      }
    })
    .catch((err) => {
      res.render("error", err);
    });
};

exports.deletePost = (req, res) => {
  db.Post.findOne({
    where: {
      postId: req.params.postId,
      UserUserId: res.locals.userId,
    },
  })
    .then((dbPost) => {
      if (dbPost !== null) {
        db.Post.update(
          { deleted: true },
          {
            where: {
              postId: req.params.postId,
            },
          }
        )
          .then((dbPost) => {
            res.redirect("/profile");
          })
          .catch((err) => {
            res.render("error", err);
          });
      }
    })
    .catch((err) => {
      res.render("error", err);
    });
};

exports.newReaction = (req, res) => {
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
              var hbsObject = {
                postId: dbPost.dataValues.postId,
                postTitle: dbPost.dataValues.postTitle,
                postBody: dbPost.dataValues.postBody,
                postCategory: dbPost.dataValues.postCategory,
                postDescription: dbPost.dataValues.postDescription,
                postImage: dbPost.dataValues.postImage,
                isDraft: dbPost.dataValues.isDraft,
                published: dbPost.dataValues.published,
                viewCount: dbPost.dataValues.viewCount,
                reactionCount: dbPost.dataValues.reactionCount,
                createdAt: dbPost.dataValues.createdAt,
              };
              res.render("post/viewPost", hbsObject);
            })
            .catch((err) => {
              res.render("error", { error: err });
            });
        })
        .catch((err) => {
          res.render("error", { error: err });
        });
    }
  });
};

exports.getReactions = (req, res) => {
  db.Reaction.findAll({
    where: {
      PostPostId: req.params.postId,
    },
  })
    .then((dbReaction) => {
      res.render("post/reactions", dbReaction.dataValues);
    })
    .catch((err) => {
      res.render("error", { error: err });
    });
};
