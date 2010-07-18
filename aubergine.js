// aubergine.js : Mark Tran <mark@nirv.net>
var express = require('express'),
    fs = require('fs');
    connect = require('connect'),
    http = require('http');
    sys = require('sys');

var app = express.createServer(
  connect.logger()
);

// configuration
app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('api_key', fs.readFileSync(__dirname + '/private/yelp.key',
                                     'utf8').replace('\n', ''));
  app.use('/', connect.bodyDecoder());
  app.use('/', connect.methodOverride());
  app.use('/', connect.compiler({ src: __dirname + '/public',
                                  enable: ['sass'] }));
  app.use('/', connect.staticProvider(__dirname + '/public'));
});

app.configure('development', function(){
  app.set('reload views', 1000);
  app.use('/', connect.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use('/', connect.errorHandler());
});

// routes
app.get('/', function(req, res) {
  res.render('index.haml', {
    locals: {
      title: 'aubergine'
    }
  });
});

function getYelpData(latitude, longitude, fn) {
  var client = http.createClient(80, 'api.yelp.com'),
      req = client.request('GET',
                           '/business_review_search?term=restaurants&lat=' +
                           latitude +
                           '&long=' +
                           longitude +
                           '&radius=0.5&limit=20&ywsid=' +
                           app.set('api_key'),
                           { host: 'api.yelp.com' });
  req.addListener('response', function(res) {
    res.body = '';
    res.addListener('data', function(chunk) {
      res.body += chunk;
    });
    res.addListener('end', function(){
      try {
        fn(JSON.parse(res.body));
      } catch (err) {
        fn(err);
      }
    });
  });
  req.end();
}

function getLocalYelpData(latitude, longitude, fn) {
  var data = JSON.parse(fs.readFileSync(__dirname + '/private/yelp.json',
                                        'utf8'));
  fn(data);
}

app.get('/ajax/yelp/locations', function(req, res) {
  var latitude, longitude, locations = [];

  latitude = req.params.get.latitude;
  longitude = req.params.get.longitude;

  getYelpData(latitude, longitude, function(data) {
    for (item in data.businesses) {
      business = data.businesses[item];
      locations.push({
        name: business.name,
        latitude: business.latitude,
        longitude: business.longitude,
        rating: business.avg_rating,
      });
    }
    res.send({ items: locations });
  });
});

app.listen(3000);
