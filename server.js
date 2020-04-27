const express = require('express');
const cors = require('cors');
const app = express();
const http = require('http').createServer(app);
const db = require('./models');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const exphbs = require('express-handlebars');
const helmet = require('helmet');
const cookieParser = require(`cookie-parser`);
const passport = require('passport');
const session = require('express-session');
require('dotenv').config();

// cors setup
app.use(cors());
app.use(helmet());
app.options('*', cors());

app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/uploads'));

app.use(methodOverride('_method'));
app.use(cookieParser());

// For Passport
app.use(session({secret: 'alakori somebodi', resave: true, saveUninitialized: false, cookie: {}})); // session secret
app.use(passport.initialize());
//passport.use(strategy);
app.use(passport.session()); // persistent login sessions

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.text());
app.use(bodyParser.json({type: 'application/vnd.api+json'}));

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set('view engine', 'handlebars');


require('./routes/blog-routes')(app);
require('./routes/auth-routes')(app);

// load passport strategies
require('./services/passport/passport.js')(passport, db.User);

// listen on port 3000
const port = process.env.PORT || 3000;
db.sequelize.sync().then(function() {
  http.listen(port);
}).catch(function(err) {
  console.log(err, 'Oh no !! Something went wrong with the Database!');
});