const express = require('express');
const cors = require('cors');
const app = express();
const db = require('./models');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const exphbs = require('express-handlebars');
const helmet = require('helmet');
require('dotenv').config();

// cors setup
app.use(cors());
app.use(helmet());
app.options('*', cors());

app.use(express.static(__dirname + '/public'));

app.use(methodOverride('_method'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.text());
app.use(bodyParser.json({type: 'application/vnd.api+json'}));

//app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');

// listen on port 3000
const port = process.env.PORT || 3000;
db.sequelize.sync().then(function() {
  http.listen(port);
}).catch(function(err) {
  console.log(err, 'Oh no !! Something went wrong with the Database!');
});