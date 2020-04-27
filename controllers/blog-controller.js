const db = require('../models');

// Render new home page
exports.getHomePage = (req, res) => {
    return res.render('index', {
      title: "TaiBlog",
      layout: "partials/prelogin",
    });
  };

  exports.getProfilePage = (req, res) => {
    return res.render('profile', {
      title: "Profile"
    });
  };