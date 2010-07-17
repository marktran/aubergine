function initialize() {
  var latitude, longitude;

  map = new google.maps.Map(document.getElementById("map_canvas"), {
    mapTypeControl: false,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    zoom: 16,
  });

  // try W3C Geolocation
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      latitude = position.coords.latitude;
      longitude = position.coords.longitude;
      setupMarker("W3C Geolocation",
                  latitude,
                  longitude,
                  false,
                  true);

      $.getJSON("/ajax/yelp/locations", {
        latitude: latitude,
        longitude: longitude,
      }, function(data) {
        $.each(data.items, function(index, location) {
          setupMarker(location.name,
                      location.latitude,
                      location.longitude,
                      location.rating);
        });
      });
    }, function() {
      handleNoGeolocation();
    });
  } else {
    handleNoGeolocation();
  }
}

function setupMarker(title, latitude, longitude, rating, center) {
  var infowindow, marker, position, rating_hash;

  rating_hash = {
    0: 'green',
    1: 'blue',
    2: 'purple',
    3: 'orange',
    4: 'yellow',
    5: 'red',
  }

  position = new google.maps.LatLng(latitude, longitude);
  marker = new google.maps.Marker({
    icon: 'http://maps.google.com/mapfiles/ms/icons/' +
          rating_hash[Math.floor(rating)] +
          '-dot.png',
    map: map,
    position: position,
    title: title,
  });

  // center marker if last parameter is true
  if (center !== undefined) {
    map.setCenter(position);
  }

  // add listener for InfoWindow
  infowindow = new google.maps.InfoWindow({
    content: "<p>" + marker.title + "</p>",
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
}

function handleNoGeolocation() {
  var marker, infowindow;

  // default to San Francisco
  marker, infowindow = setupMarker("San Franciso", 37, -122, false, true);
  infowindow.setContent("Error: The Geolocation service failed.");
  infowindow.open(marker.map);
}
