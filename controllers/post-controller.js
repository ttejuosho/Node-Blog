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
    
    db.Post.create(postData).then((dbPost) => {
      res.render("post/viewPost", dbPost.dataValues);
    }).catch((err)=>{
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
        attributes: ["userId", "username", "name", "shortName", "profileImage", "about", "linkedIn", "facebook", "twitter", "github"],
      },
    ]
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
        userId: dbPost.dataValues.UserUserId,
        createdAt: dbPost.dataValues.createdAt,
        username: dbPost.User.dataValues.username,
        name: dbPost.User.dataValues.name,
        shortName: dbPost.User.dataValues.shortName,
        about: dbPost.User.dataValues.about,
        linkedIn: dbPost.User.dataValues.linkedIn,
        facebook: dbPost.User.dataValues.facebook,
        twitter: dbPost.User.dataValues.twitter,
        github: dbPost.User.dataValues.github,
      };

      //When not signed in or another user is viewing post, ViewCount increment
      if (!req.isAuthenticated || (res.locals.userId !== dbPost.dataValues.UserUserId)){
          db.Post.increment({ viewCount: 1 }, { where: { postId: req.params.postId }});
      }

      //console.log(hbsObject);
      return res.render("post/viewPost", hbsObject);
    } else {
      return res.render('post/viewPost', { message: 'Not Found'});
    }
  }).catch((err)=>{
    res.render("error", { error: err });
});
};

exports.getEditPost = (req, res) => {
  db.Post.findOne({
    where: {
      postId: req.params.postId,
      UserUserId: res.locals.userId,
    }
  }).then((dbPost)=> {
    if(dbPost !== null){
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
  }).catch((err)=>{
    res.render("error", { error: err });
});
}

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
    }
  }).then((dbPost)=> {
    if(dbPost !== null){
      const postData = {
        postTitle: req.body.postTitle,
        postDescription: req.body.postDescription,
        postBody: req.body.postBody,
        postCategory: req.body.postCategory,
        postImage: (req.file ? req.file.location : dbPost.dataValues.postImage),      
        isDraft: req.body.action === "Save Draft" ? true : false,
        published: req.body.action === "Save Draft" ? false : true,
      };

      //console.log(req.file);

      db.Post.update(postData, {
        where: {
          postId: req.params.postId,
        }
      }).then((dbPost)=>{
        res.redirect('/profile');
      }).catch((err) => {
        res.render('error', err);
      });
    }

  }).catch((err) => {
    res.render('error', err);
  });
});
}

exports.publishPost = (req,res) => {
  db.Post.findOne({
    where: {
      postId: req.params.postId,
      UserUserId: res.locals.userId,
    }
  }).then((dbPost)=>{
    if (dbPost !== null){
      db.Post.update({ published: true, isDraft: false }, {
        where: {
          postId: req.params.postId,
        }
      }).then((dbPost)=>{
        res.redirect('/profile');
      }).catch((err) => {
        res.render('error', err);
      });
    }
  }).catch((err) => {
    res.render('error', err);
  });
}

exports.unpublishPost = (req,res) => {
  db.Post.findOne({
    where: {
      postId: req.params.postId,
      UserUserId: res.locals.userId,
    }
  }).then((dbPost)=>{
    if (dbPost !== null){
      db.Post.update({ published: false, isDraft: true }, {
        where: {
          postId: req.params.postId,
        }
      }).then((dbPost)=>{
        res.redirect('/profile');
      }).catch((err) => {
        res.render('error', err);
      });
    }
  }).catch((err) => {
    res.render('error', err);
  });
}

exports.deletePost = (req,res) => {
  db.Post.findOne({
    where: {
      postId: req.params.postId,
      UserUserId: res.locals.userId,
    }
  }).then((dbPost)=>{
    if (dbPost !== null){
      db.Post.update({ deleted: true }, {
        where: {
          postId: req.params.postId,
        }
      }).then((dbPost)=>{
        res.redirect('/profile');
      }).catch((err) => {
        res.render('error', err);
      });
    }
  }).catch((err) => {
    res.render('error', err);
  });
}