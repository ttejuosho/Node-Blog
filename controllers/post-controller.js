const db = require("../models");
const upload = require("../services/Utils/upload.js");

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
      postImage: req.file.location,
      UserUserId: req.session.passport.user,
      isDraft: req.body.action === "Save Draft" ? true : false,
      published: req.body.action === "Save Draft" ? false : true,
    };

    db.Post.create(postData).then((dbPost) => {
      console.log(dbPost.dataValues);
      res.render("post/viewPost", dbPost.dataValues);
    }).catch((err)=>{
      res.render("error", { error: err });
  });

    console.log(`File uploaded successfully. || ${req.file}`);
  });
};

exports.getPost = (req, res) => {
  db.Post.findByPk(req.params.postId, {
    include: [
      {
        model: db.User,
        as: "User",
        attributes: ["userId", "username", "name", "profileImage"],
      },
    ]
  }).then((dbPost) => {
    if (dbPost !== null) {
      var hbsObject = {
        postId: dbPost.dataValues.postId,
        postTitle: dbPost.dataValues.postTitle,
        postBody: dbPost.dataValues.postBody,
        postDescription: dbPost.dataValues.postDescription,
        postImage: dbPost.dataValues.postImage,
        isDraft: dbPost.dataValues.isDraft,
        published: dbPost.dataValues.published,
        viewCount: dbPost.dataValues.viewCount,
        userId: dbPost.dataValues.UserUserId,
        createdAt: dbPost.dataValues.createdAt,
        username: dbPost.User.dataValues.username,
        name: dbPost.User.dataValues.name,
      };
      console.log(hbsObject);
      return res.render("post/viewPost", hbsObject);
    } else {
      return res.render('post/viewPost', { message: 'Not Found'});
    }
  }).catch((err)=>{
    res.render("error", { error: err });
});
};
