const db = require("../models");

exports.getProfilePage = (req, res) => {
    db.User.findByPk(req.session.passport.user, {
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
            res.render("user/profile", hbsObject)
        }
    }).catch((err)=>{
        res.render("error", { error: err });
    });
  };