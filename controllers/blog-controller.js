const db = require('../models');
const upload = require('../services/Utils/localUpload.js');

// Render new home page
exports.getHomePage = (req, res) => {
    return res.render('index', {
      title: "TaiBlog",
      //layout: false,
    });
  };

  exports.getProfilePage = (req, res) => {
    return res.render('profile', {
      title: "Profile"
    });
  };

  exports.newPostPage = (req, res) => {
    return res.render('post/newPost', {
      title: "New Post"
    });
  };

  exports.createNewPost = (req,res) => {
    upload(req, res, (err) => {
      const postData = {
        postTitle: req.body.postTitle,
        postDescription: req.body.postDescription,
        postBody: req.body.postBody,
        postImage: req.files.postImage[0].filename,
        UserUserId: req.session.passport.user,
        isDraft: (req.body.action === 'Save Draft' ? true : false),
        published: (req.body.action === 'Save Draft' ? false : true)
      }

      db.Post.create(postData).then((dbPost)=>{
        console.log(dbPost.dataValues);
        res.render('post/viewPost', dbPost.dataValues);
      });
    });
  };

  exports.getPost = (req, res) =>{
    // db.Post.findByPk(req.params.postId).then((dbPost) => {
    //   if (dbPost !== null) {
    //     console.log(dbPost.dataValues);
    //     return res.render('post/viewPost', dbPost.dataValues );
    //   } else {
    //     return res.render('post/viewPost', { message: 'Not Found'});
    //   }
    // });
    db.Post.findOne({
      where: {
        postId: req.params.postId
      },
      include: [{model: db.User, as: 'User', attributes: ['userId', 'username', 'name', 'profileImage'] }]
    }).then((dbPost)=>{
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
          name: dbPost.User.dataValues.name
        }
        console.log(hbsObject);
        return res.render('post/viewPost', hbsObject );
      } else {
        return res.render('post/viewPost', { message: 'Not Found'});
      }
    });

  }