const express = require("express");
const cors = require("cors");
const app = express();
const http = require("http").createServer(app);
const db = require("./models");
const bodyParser = require("body-parser");
const methodOverride = require("method-override");
const exphbs = require("express-handlebars");
const helmet = require("helmet");
const cookieParser = require(`cookie-parser`);
const passport = require("passport");
const session = require("express-session");
const morgan = require("morgan");
const moment = require("moment");
const fs = require("fs")
const aws = require("aws-sdk");
require("dotenv").config();

// cors setup
app.use(cors());
app.use(helmet());
app.options("*", cors());

app.use(express.static(__dirname + "/public"));
app.use(express.static(__dirname + "/uploads"));

app.use(morgan("dev"));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.text());
app.use(bodyParser.json({ type: "application/vnd.api+json" }));

app.use(methodOverride("_method"));
app.use(cookieParser());

// For Passport
app.use(
  session({
    secret: "alakori somebodi",
    resave: true,
    saveUninitialized: false,
    cookie: {},
  })
); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions

const hbs = exphbs.create({
  helpers: {
    ifEquals: function (arg1, arg2, options) {
      return arg1 == arg2 ? options.fn(this) : options.inverse(this);
    },
    ifIncludes: function (arg1, arg2, options) {
      return arg1.includes(arg2) ? options.fn(this) : options.inverse(this);
    },
    counter: function (value, options) {
      return parseInt(value) + 1;
    },
    getLength: function (obj) {
      return obj.length;
    },
    increment: function (value, options) {
      let c = 0;
      return (c += 1);
    },
    formatDate: function (value) {
      if (value && moment(value).isValid()) {
        var f = "MMM Do, YYYY";
        return moment(value).format(f);
      } else {
        return value; // moment plugin is not available, value does not have a truthy value, or value is not a valid date
      }
    },
  },
  defaultLayout: "mainn",
});

//app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.engine('handlebars', hbs.engine);
app.set("view engine", "handlebars");

require("./routes/auth-api-routes")(app);
require("./routes/blog-api-routes")(app);

require("./routes/blog-routes")(app);
require("./routes/auth-routes")(app);

// load passport strategies
require("./services/passport/passport.js")(passport, db.User);

// listen on port 3000
const port = process.env.PORT || 3000;
db.sequelize
  .sync()
  .then(function () {
    http.listen(port);
  })
  .catch(function (err) {
    console.log(err, "Oh no !! Something went wrong with the Database!");
  });
