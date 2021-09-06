const db = require("../models");
const sequelize = require("sequelize");

// Render home page
exports.getHomePage = async (req, res) => {
  // Get latest Post
  // Get Most Viewed/Read Posts/ Featured Posts
  await db.Post.findOne({
    attributes: [sequelize.fn("MAX", sequelize.literal("viewCount"))],
    //order: [['groupId', 'DESC'], ['value', 'DESC']]
  }).then((dbPost) => {
    return res.render("index");
  });
};

exports.getPostsByCategory = (req, res) => {
  db.Post.findAll({
    where: {
      postCategory: req.params.category,
    },
    attributes: [
      "postId",
      "postTitle",
      "postImage",
      "postDescription",
      "postCategory",
      "viewCount",
    ],
    order: [["viewCount", "DESC"]],
    include: [
      {
        model: db.User,
        as: "User",
        attributes: ["name", "username"],
      },
    ],
  }).then((dbPost) => {
    if (dbPost !== null) {
      var hbsObject = { categoryView: true, Posts: [] };
      dbPost.forEach((post) => {
        var tempObj = {
          postAuthorName: post.dataValues.User.dataValues.name,
          postAuthorUsername: post.dataValues.User.dataValues.username,
          postId: post.dataValues.postId,
          postTitle: post.dataValues.postTitle,
          postDescription: post.dataValues.postDescription,
          postImage: post.dataValues.postImage,
          postCategory: post.dataValues.postCategory,
          viewCount: post.dataValues.viewCount,
        };
        hbsObject.Posts.push(tempObj);
      });
      res.render("index", hbsObject);
    }
  });
};
