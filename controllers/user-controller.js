const db = require("../models");

exports.getProfilePagee = (req, res) => {
    db.User.findByPk(req.user.userId, {
        include: [
            { model: db.Post, as: 'Posts', attributes: ['postId', 'postTitle', 'postBody', 'postImage', 'postDescription', 'published', 'isDraft', 'viewCount', 'createdAt'] }
        ]
    }).then((dbUser)=>{
        if (dbUser !== null){
            const hbsObject = dbUser.toJSON();
            hbsObject.title = "@" + hbsObject.username;
            res.render("user/profile", hbsObject)
        }
    }).catch((err)=>{
        res.render("error", { error: err });
    });
  };

  exports.getProfilePage = (req, res) => {
    db.Post.findAll({
        where: {
            UserUserId: req.user.userId
        },
        order: [
            ['createdAt', 'DESC'],
          ],
    }).then((dbPost)=>{
        var hbsObject = { Posts: [] };
        if (dbPost !== null){
            for (var i = 0; i < dbPost.length; i++){
                hbsObject.Posts.push(dbPost[i].dataValues);
            }
            console.log(hbsObject);
            res.render("user/profile", hbsObject);
        }
    }).catch((err)=>{
        res.render("error", { error: err });
    });
  };


  exports.getPublicProfilePage = (req, res) => {
    db.User.findOne({
        where: {
            username: req.params.username
        },
        include: [
            { model: db.Post, as: 'Posts', attributes: ['postId', 'postTitle', 'postBody', 'postImage', 'postDescription', 'published', 'isDraft', 'viewCount', 'createdAt'] }
        ]
    }).then((dbUser)=>{    
        if (dbUser !== null){
            const hbsObject = dbUser.toJSON();
            hbsObject.title = "@" + hbsObject.username;
            console.log(hbsObject);
            res.render("user/profile", hbsObject)
        }
    }).catch((err)=>{
        res.render("error", { error: err });
    });
  };