function initialize() {
  var latitude, longitude;

  map = new google.maps.Map(document.getElementById('map_canvas'), {
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

      $.getJSON('/ajax/yelp/locations', {
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
      handleGeolocationError(error);
    });
  } else {
    handleGeolocationError(error);
  }
}

function setupMarker(title, latitude, longitude, rating, center) {
  var icon, infowindow, marker, position, rating_hash;

  position = new google.maps.LatLng(latitude, longitude);
  marker = new google.maps.Marker({
    icon: '/images/' + Math.floor(rating) + '-dot.png',
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
}

function handleGeolocationError(error) {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      alert("Permission denied.");
      break;
    default:
      alert("Unknown error.");
      break;
  }
}
