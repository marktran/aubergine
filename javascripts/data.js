function googleLocalSearch(latitude, longitude, callback) {
  var search = new google.search.LocalSearch(),
      data = [];

  search.setCenterPoint(new google.maps.LatLng(latitude, longitude));
  search.setResultSetSize(google.search.Search.LARGE_RESULTSET);
  search.setSearchCompleteCallback(this, function() {
    if (search.results && search.results.length > 0) {
      data = data.concat(search.results);
    }

    if (search.cursor &&
        search.cursor.pages.length > search.cursor.currentPageIndex + 1) {
      search.gotoPage(search.cursor.currentPageIndex + 1);
    } else {
      callback(data);
    }
  });
  search.execute('restaurants');
};

function yelpReviewSearch(latitude, longitude, parameters, callback) {
  var params, url;

  if (arguments.length == 3) {
    if (Object.prototype.toString.call(parameters) == '[object Function]') {
      callback = parameters;
    }
  }

  params = {
    term: parameters.term || 'restaurants',
    lat: latitude,
    long: longitude,
    radius: 1,
    limit: parameters.limit || 20,
    ywsid: 'EMw_RSq5r6UAYlAGfFYu7Q',
  };
  url = 'http://api.yelp.com/business_review_search?' +
    $.param(params) +
    '&category=restaurants+bars+food' +
    '&callback=?';

  $.getJSON(url, function(data) {
    callback(data);
  });
};

// This function is pretty retarded, but we make a massive amount of API calls
// because:
//
// 1) The Google Local API only returns 32 results (8 per page). These results
//    don't have ratings so we look up each individual result with a Yelp
//    Review Search call (32 times). Each of those 32 calls gives us 20 Yelp
//    results. Many of them are duplicates, but it fills the map out nicely.
//    I could probably just not use the Google Local API and call the Yelp
//    API against its own results, but Google is pretty lax about their API,
//    so fuck it.
//
//    Adam: "whereas google is just like 'fuck it. go nuts. just put ads on it.'"
//
// 2) The Yelp API really sucks. No really, I hope the Yelp API people die in a
//    fire. We make an extra individual Yelp call with the location centered on
//    our HTML5 Geolocation for the hell of it. It returns a couple extra
//    results. TODO: call the Yelp API against its own results for shits and
//    giggles.
//
//    Ian MacBean, Yelp PR: "Thanks Mark, we've kicked you up to 1000 calls.
//    We tend not to be huge fans of these map-based sites that make calls
//    based strictly on location with no search input, as they burn through
//    calls with vigor."
function fetchData(latitude, longitude, callback) {
  var locations = {};

  googleLocalSearch(latitude, longitude, function(data) {
    $.each(data, function(index, location) {
      var name = location.titleNoFormatting,
          phone =  location.phoneNumbers[0].number.replace(/[^0-9]/g, '');

      locations[phone] = {
        name: name,
        latitude: location.lat,
        longitude: location.lng,
        rating: 1,
      };

      yelpReviewSearch(latitude, longitude, { term: name }, function(data) {
        $.each(data.businesses, function(index, rated) {
          locations[rated.phone] = {
            name: rated.name,
            latitude: rated.latitude,
            longitude: rated.longitude,
            rating: rated.avg_rating,
          };
        });
      });
    });

    yelpReviewSearch(latitude, longitude, function(data) {
      $.each(data.businesses, function(index, location) {
        locations[location.phone] = {
          name: location.name,
          latitude: location.latitude,
          longitude: location.longitude,
          rating: location.avg_rating,
        };
      });
      callback(locations);
    });
  });
};
