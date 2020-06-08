const db = require("../models");

// Render home page
exports.getHomePage = (req, res) => {
    return res.render("index", {
      title: "TaiBlog",
    });
  };