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
google.load('search', '1');
google.maps.event.addDomListener(window, 'load', initialize);

function initialize() {
  var latitude, longitude;

  map = new google.maps.Map(document.getElementById('map_canvas'), {
    center: new google.maps.LatLng(39.813620, -98.554209),
    mapTypeControl: false,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    zoom: 5,
  });

  if (navigator.geolocation) {
    toggleStatusMessage("Gathering information on your location...");

    navigator.geolocation.getCurrentPosition(function(position) {
      latitude = position.coords.latitude;
      longitude = position.coords.longitude;
      addMarker("W3C Geolocation",
                  latitude,
                  longitude,
                  false,
                  true);

      fetchData(latitude, longitude, function(data) {
        $.each(data, function(index, location) {
          addMarker(location.name,
                    location.latitude,
                    location.longitude,
                    location.rating);
        });
        toggleStatusMessage();
      });
    }, function() {
      handleGeolocationError(err);
    });
  } else {
    handleGeolocationError(err);
  }
};

function handleGeolocationError(err) {
  switch (err.code) {
    case err.PERMISSION_DENIED:
      alert("Permission denied.");
      break;
    default:
      alert("Unknown error.");
      break;
  }
};
function addMarker(title, latitude, longitude, rating, center) {
  var icon, infowindow, marker, position, rating_hash;

  position = new google.maps.LatLng(latitude, longitude);
  marker = new google.maps.Marker({
    icon: '/images/' + Math.floor(rating) + '-dot.png',
    map: map,
    position: position,
    title: title,
  });

  if (center == true) {
    marker.setZIndex(999);
    marker.setClickable(false);
    map.setCenter(position);
    map.setZoom(16);
  }

  infowindow = new google.maps.InfoWindow({
    content: '<p>' + marker.title + '</p>',
    state: 0,
  });
  google.maps.event.addListener(marker, 'click', function() {
    if (infowindow.state) {
      infowindow.close(marker.map, marker);
      infowindow.state = 0;
    } else {
      infowindow.open(marker.map, marker);
      infowindow.state = 1;
    }
  });

  return marker, infowindow;
};
function toggleStatusMessage(message) {
  if (message) {
    $('#infomessage').text(message);
  }

  $('#infobox').slideToggle('slow');
};
