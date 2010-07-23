function initialize() {
  var latitude, longitude;

  map = new google.maps.Map(document.getElementById('map_canvas'), {
    // center on Lebanon, Kansas, the geographical center of the United States
    center: new google.maps.LatLng(39.813620, -98.554209),
    mapTypeControl: false,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    zoom: 5,
  });

  // try W3C Geolocation
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

      $.getJSON('/ajax/yelp/reviews', {
        latitude: latitude,
        longitude: longitude,
      }, function(data) {
        $.each(data.items, function(index, location) {
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
google.maps.event.addDomListener(window, 'load', initialize);

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

  // center marker if last parameter is true
  if (center !== undefined) {
    map.setCenter(position);
    map.setZoom(16);
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
};

function toggleStatusMessage(message) {
  if (message) {
    $('#infomessage').text(message);
  }

  $('#infobox').slideToggle('slow');
};
