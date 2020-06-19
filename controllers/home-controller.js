const db = require("../models");
const sequelize = require("sequelize");

// Render home page
exports.getHomePage = async (req, res) => {
  // Get latest Post
  // Get Most Viewed/Read Posts/ Featured Posts
  await db.Post.findOne({
    attributes: [sequelize.fn('MAX', sequelize.literal('viewCount'))],
    //order: [['groupId', 'DESC'], ['value', 'DESC']] 
  }).then((dbPost)=>{
    console.log(dbPost.dataValues);
  })
    // return res.render("index", {
    //   title: "TaiBlog",
    // });
  };

exports.getPostsByCategory = (req, res) => {
  db.Post.findAll({
    where: {
      postCategory: req.params.category
    },
    order: [["viewCount", "DESC"]],
  }).then((dbPost)=>{
    if (dbPost !== null){
      var hbsObject = { categoryView: true, posts: [] };
      dbPost.forEach((post)=>{
        hbsObject.posts.push(post.dataValues);
      })
      res.render("index", hbsObject);
    }
  })
}