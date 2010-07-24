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
  if (center == true) {
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
