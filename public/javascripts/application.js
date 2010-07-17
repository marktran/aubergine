function initialize() {
    var browserSupportFlag, initialLocation, map, marker;

    map = new google.maps.Map(document.getElementById("map_canvas"), {
        mapTypeControl: false,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        zoom: 15
    });
    
    // try W3C Geolocation
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            initialLocation = new google.maps.LatLng(position.coords.latitude,
                                                     position.coords.longitude);
            map.setCenter(initialLocation);

            marker = new google.maps.Marker({
                position: initialLocation, 
                map: map, 
                title: "W3C Geolocation",
            });
            attachInfoWindow(marker, marker.title);
        }, function() {
            handleNoGeolocation();
        });
    } else {
        handleNoGeolocation();
    }
}

function attachInfoWindow(marker, contentString) {
    var infowindow = new google.maps.InfoWindow({
        content: "<p>" + marker.title + "</p>"
    });

    google.maps.event.addListener(marker, 'click', function() {
        infowindow.open(marker.map, marker);
    });
}

function handleNoGeolocation() {
    // default to San Francisco
    initialLocation = new google.maps.LatLng(37, 122);
    map.setCenter(initialLocation);
    infowindow.setContent("Error: The Geolocation service failed.");
    infowindow.setPosition(initialLocation);
    infowindow.open(map);
}
