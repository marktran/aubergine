google.load('search', '1');
google.maps.event.addDomListener(window, 'load', initialize);

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
