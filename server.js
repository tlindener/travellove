// server.js

// BASE SETUP
// =============================================================================

// call the packages we need
var express    = require('express');        // call express
var app        = express();                 // define our app using express
var bodyParser = require('body-parser');
// Load Chance
var Chance = require('chance');

// Instantiate Chance so it can be used
var chance = new Chance();
// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8080;        // set our port

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
var recommendations = require('./data/recommendations');

router.get('/recommendations/fb', function(req, res) {
    var recommendations_new = []
    for(var i; i<= 5;i++){
      recommendations.forEach(function item){
        item['month'] = chance.integer({min: 1, max: 12});
        recommendations_new.append(item)
      }
    }
    res.json(recommendations_new);
});

var airports = require('./data/airports');
router.get('/airports', function(req, res) {
    res.json(airports);
});
// more routes for our API will happen here

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);
app.use(express.static('images'));

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);
