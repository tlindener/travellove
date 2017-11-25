// server.js

// BASE SETUP
// =============================================================================

// call the packages we need
var express = require('express'); // call express
var app = express(); // define our app using express
var bodyParser = require('body-parser');
// Load Chance
var Chance = require('chance');

// Instantiate Chance so it can be used
var chance = new Chance();
var _ = require('lodash');
// var NodeGeocoder = require('node-geocoder');
// var options = {
//   provider: 'google',
//
//   // Optional depending on the providers
//   httpAdapter: 'https', // Default
//   apiKey: 'YOUR_API_KEY', // for Mapquest, OpenCage, Google Premier
//   formatter: null         // 'gpx', 'string', ...
// };
//
// var geocoder = NodeGeocoder(options);
// configure app to use bodyParser()
// this will let us get the data from a POST
// app.use(bodyParser.urlencoded({
//   extended: true
// }));
app.use(bodyParser.json());

var port = process.env.VCAP_APP_PORT || 8080; // set our port

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router(); // get an instance of the express Router

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
var recommendations = require('./data/recommendations');

router.get('/recommendations/fb', function(req, res) {
  console.log("/recommendations/fb");
  var recommendations_new = []

  recommendations.forEach(function(item) {
    item['month'] = chance.integer({
      min: 1,
      max: 12
    });
    recommendations_new.push(item)
  });
  res.json(recommendations_new);
});

var airports = require('./data/airports');
router.get('/airports', function(req, res) {
  res.json(airports);
});
var category_map = require('./data/category_map')
router.post('/recommendations/grid', function(req, res) {
  var recommendations = []
  var categories = req.body.categories
  console.log(req.body);
    recommendation_city_sample = _.sampleSize(airports, 40);
  recommendation_city_sample.forEach(function(item) {

    var category = _.sample(categories)
    new_rec = {
      location: item.city + ", " + item.country,
      type: category_map[category],
      activity: category,
      categories: [category],
      month: chance.integer({
        min: 1,
        max: 12
      })

    }

    recommendations.push(new_rec)
  })

  res.json(recommendations);
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
