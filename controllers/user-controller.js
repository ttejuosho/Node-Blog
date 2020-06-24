const db = require("../models");
const { Result } = require("express-validator");

exports.getProfilePage = (req, res) => {
  db.Post.findAll({
    where: {
      UserUserId: req.user.userId,
      deleted: false,
    },
    order: [["createdAt", "DESC"]],
  })
    .then((dbPost) => {
      if (dbPost !== null) {
        var hbsObject = { isOwner: true, Posts: [], SavedPosts: [], Tags: [] };
        for (var i = 0; i < dbPost.length; i++) {
          hbsObject.Posts.push(dbPost[i].dataValues);
        }

        db.SavedPost.findAll({
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
                "postCategory",
                "postDescription",
                "isDraft",
                "published",
                "viewCount",
              ],
            },
          ],
        })
          .then((dbSavedPost) => {
            if (dbSavedPost !== null) {
              for (var i = 0; i < dbSavedPost.length; i++) {
                hbsObject.SavedPosts.push(
                  dbSavedPost[i].dataValues.Post.dataValues
                );
                hbsObject.SavedPosts[i].savedOn =
                  dbSavedPost[i].dataValues.createdAt;
              }

              //console.log(hbsObject);
              res.render("user/profile", hbsObject);
            }
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

exports.getReportedPosts = async (req,res) => {
  try{
    var hbsObject = { ReportedPosts: [] };
    var complaintsRes;
    await db.Complaint.findAll({ raw: true },
      ).then((dbComplaint)=>{
      if(dbComplaint !== null){
        complaints = dbComplaint;
        dbComplaint.forEach((complaint)=>{

          var tempObj = {
            complaintId: complaint.complaintId,
            reported: complaint.reported,
            reportedFor: complaint.reportedFor,
            reportedByUserId: complaint.reportedBy,
            reportedPostId: complaint.reportedPostId,
            reportedCommentId: complaint.reportedCommentId,
            reviewed: (complaint.reviewed === 0 ? false : true),
            reportedOn: complaint.createdAt
          };

          hbsObject.ReportedPosts.push(tempObj);

        });
      }
    });

    await hbsObject.ReportedPosts.forEach((complaint)=>{
      var userId = complaint.reportedBy;
      db.User.findByPk(userId).then((dbUser)=>{
        //console.log(dbUser);
        complaint.reportedByUsername = dbUser.dataValues.username;
        complaint.reportedByName = dbUser.dataValues.name;
      });
    });

    res.json(hbsObject.ReportedPosts);

  }
  catch(error){
    console.error(error);
  }

}