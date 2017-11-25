// server.js

// BASE SETUP
// =============================================================================

// call the packages we need
var express = require('express'); // call express
var app = express(); // define our app using express
var bodyParser = require('body-parser');
// Load Chance
var Chance = require('chance');
var async = require('async')
var path = require('path')
var request = require("request");
// Instantiate Chance so it can be used
var chance = new Chance();
var _ = require('lodash');

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
    item['id'] = chance.guid({version: 4})
    item['month'] = chance.integer({
      min: 1,
      max: 12
    });
    item['price'] = chance.integer({
      min: 200,
      max: 1000
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

  async.forEach(recommendation_city_sample, function(item, callback) {
    console.log(item); // print the key
    var category = _.sample(categories)
    var new_rec = {
      id: chance.guid({version: 4}),
      location: item.city + ", " + item.country,
      lat: item.lat,
      lon: item.lon,
      images: [iata + ".jpg"],
      iata: locationCode,
      type: category_map[category],
      activity: category,
      categories: [category],
      month: chance.integer({
        min: 1,
        max: 12
      })

    }
    var options = {
      method: 'GET',
      url: 'https://instantsearch-junction.ecom.finnair.com/api/instantsearch/pricesforperiod/fixeddeparture',
      qs: {
        departureLocationCode: 'HEL',
        destinationLocationCode: item.locationCode,
        departureDate: '2018-' + minTwoDigits(new_rec.month) + '-01',
        numberOfDays: chance.integer({
          min: 3,
          max: 21
        })
      },
      headers: {}
    };

    request(options, function(error, response, body) {
      if (error) throw new Error(error);

      var result = JSON.parse(body)
      var price = _.find(result.prices, function(o) {
        return o.noFlight === false;
      });
      console.log(body);
      if (price != undefined) {
        new_rec['price'] = price.price
        console.log(price);
        recommendations.push(new_rec)
        callback();
      } else {
        callback();
      }


    });



  }, function(err) {
    console.log("Iteration done");
    res.json(recommendations);
  });



});

function minTwoDigits(n) {
  return (n < 10 ? '0' : '') + n;
}




// more routes for our API will happen here

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
});
app.use('/api', router);
console.log(__dirname);
app.use('/images', express.static(path.join(__dirname, 'images')));

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);
