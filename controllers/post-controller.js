const db = require("../models");
const upload = require("../services/Utils/upload.js");
const sequelize = require("sequelize");

// Get the new post page
exports.newPostPage = (req, res) => {
  return res.render("post/newPost", {
    title: "New Post",
  });
};

// Create new post
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

// Get a Post
exports.getPost = (req, res) => {
  var hbsObject = {};
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
        limit: 5,
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
              "profileImage",
            ],
          },
        ],
        order: [["createdAt", "DESC"]],
      },
    ],
  })
    .then((dbPost) => {
      if (dbPost !== null) {
        if (dbPost.dataValues.deleted === true) {
          return res.render("post/viewPost", {
            message: "This post has been removed.",
          });
        }
        hbsObject = {
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
          postAuthorUserId: dbPost.dataValues.UserUserId,
          createdAt: dbPost.dataValues.createdAt,
          postAuthorUsername: dbPost.User.dataValues.username,
          postAuthorName: dbPost.User.dataValues.name,
          postAuthorShortName: dbPost.User.dataValues.shortName,
          postAuthorAbout: dbPost.User.dataValues.about,
          postAuthorLinkedIn: dbPost.User.dataValues.linkedIn,
          postAuthorFacebook: dbPost.User.dataValues.facebook,
          postAuthorTwitter: dbPost.User.dataValues.twitter,
          postAuthorGithub: dbPost.User.dataValues.github,
          following: false,
          Comments: [],
        };

        for (var i = 0; i < dbPost.dataValues.Comments.length; i++) {
          hbsObject.Comments.push(dbPost.dataValues.Comments[i].dataValues);
          hbsObject.Comments[i].commentBy =
            dbPost.dataValues.Comments[i].User.dataValues.name;
          hbsObject.Comments[i].commentByUserId =
            dbPost.dataValues.Comments[i].User.dataValues.userId;
          hbsObject.Comments[i].commentByUserProfileImage =
            dbPost.dataValues.Comments[i].User.dataValues.profileImage;
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

        if (req.user) {
          db.Follower.findOne({
            where: {
              followedUserUsername: hbsObject.postAuthorUsername,
              UserUserId: req.user.userId,
            },
          }).then((dbFollower) => {
            if (dbFollower !== null) {
              hbsObject.following = true;
            }
            //console.log(hbsObject);
            return res.render("post/viewPost", hbsObject);
          });

          if (res.locals.userId !== dbPost.dataValues.UserUserId) {
            // If signed in user isnt the post creator, Add to recentlyViewed table
            db.RecentlyViewed.findOrCreate({
              where: {
                PostPostId: req.params.postId,
                UserUserId: req.user.userId,
              },
            });
          }
        } else {
          return res.render("post/viewPost", hbsObject);
        }
      } else {
        return res.render("post/viewPost", { message: "Post not found" });
      }
    })
    .catch((err) => {
      res.render("error", { error: err });
    });
};

// Get Post data to be editted
exports.getEditPost = async (req, res, next) => {
  try {
    db.Post.findOne({
      where: {
        postId: req.params.postId,
        UserUserId: res.locals.userId,
      },
    }).then((dbPost) => {
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

        return res.render("post/newPost", hbsObject);
      }
    });
  } catch (error) {
    res.render("error", error);
  }
};

// Update a post
exports.updatePost = async (req, res, next) => {
  try {
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
      }).then((dbPost) => {
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
      });
    });
  } catch (error) {
    res.render("error", error);
  }
};

// Publish a post
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

// Unpublish a post
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

// Delete a post
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
                attributes: ["reactionId", "reaction"],
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

// [Post] new Comment
exports.commentOnPost = (req, res) => {
  db.Post.findByPk(req.params.postId)
    .then((dbPost) => {
      if (dbPost !== null && dbPost.dataValues.published === true) {
        db.Comment.create({
          commentBody: req.body.commentBody,
          PostPostId: req.params.postId,
          UserUserId: req.user.userId,
        })
          .then((dbComment) => {
            return res.redirect("/post/" + req.params.postId);
          })
          .catch((err) => {
            res.render("error", { error: err });
          });
      }
    })
    .catch((err) => {
      res.render("error", { error: err });
    });
};

// [Get] all recently viewed posts
exports.recentlyViewed = (req, res) => {
  db.RecentlyViewed.findAll({
    where: {
      UserUserId: req.user.userId,
    },
    include: [
      {
        model: db.Post,
        as: "Post",
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
  }).then((dbPost) => {
    var hbsObject = { recentlyViewedPosts: [] };
    dbPost.forEach((post, i) => {
      var viewedPost = {
        postId: post.Post.postId,
        postTitle: post.Post.postTitle,
        postBody: post.Post.postBody,
        postImage: post.Post.postImage,
        postDescription: post.Post.postDescription,
        viewCount: post.Post.viewCount,
        viewedOn: post.createdAt,
        published: post.Post.published,
        recentlyViewedId: post.recentlyViewedId,
      };

      hbsObject.recentlyViewedPosts.push(viewedPost);
    });
    //console.log(hbsObject);
    res.render("post/recentlyViewed", hbsObject);
  });
};

// Render page to view all comments for a post
exports.getCommentsPage = (req, res) => {
  db.Comment.findAll({
    where: {
      PostPostId: req.params.postId,
    },
    include: [
      {
        model: db.User,
        as: "User",
        attributes: ["userId", "username", "name", "shortName", "profileImage"],
      },
      {
        model: db.Post,
        as: "Post",
        attributes: ["postId", "postTitle"],
      },
    ],
    order: [["createdAt", "DESC"]],
  })
    .then((dbComment) => {
      var hbsObject = {
        postId: dbComment[0].dataValues.PostPostId,
        postTitle: dbComment[0].dataValues.Post.dataValues.postTitle,
        Comments: [],
      };
      dbComment.forEach((comment, i) => {
        var commentObject = {
          commentId: comment.dataValues.commentId,
          commentBody: comment.dataValues.commentBody,
          likesCount: comment.dataValues.likesCount,
          dislikesCount: comment.dataValues.dislikesCount,
          createdAt: comment.dataValues.createdAt,
          commentByUserId: comment.dataValues.UserUserId,
          commentByUsername: comment.dataValues.User.dataValues.username,
          commentByName: comment.dataValues.User.dataValues.name,
          commentByProfileImage:
            comment.dataValues.User.dataValues.profileImage,
        };

        hbsObject.Comments.push(commentObject);
      });

      res.render("post/viewComments", hbsObject);
    })
    .catch((err) => {
      res.render("error", { error: err });
    });
};

// Mark post as saved
exports.savePost = (req,res) => {
  db.Post.findByPk(req.param.postId).then((dbPost)=>{
    if(dbPost !== null){
      if (res.locals.userId !== dbPost.dataValues.UserUserId) {
        // If signed in user isnt the post creator, Add to Saved Post table
        db.SavedPost.findOrCreate({
          where: {
            PostPostId: req.params.postId,
            UserUserId: req.user.userId,
          },
        }).then((dbSavedPost)=>{
          res.json(dbSavedPost);
        }).catch((err)=>{
          res.render("error", { error: err });
        });
      }
    } else {
      res.json({ response: "Post not found." });
    }
  }).catch((err)=>{
    res.render("error", { error: err });
  });
};
