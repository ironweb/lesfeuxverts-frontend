/* Greenlight Google Maps */

var map;
var directionsDisplay;
var directionsService;
var stepDisplay;
var markerArray = [];
var geocoder;
var AllArrond = [];

// Starting Position (Maybe change)
var quebec = new google.maps.LatLng(46.810811, -71.215439);
latlng = quebec;

var styles = 
[ 
    { "stylers": 
        [ 
            { "hue": "#00ff91" } 
        ] 
    },
    { "featureType": "road", "elementType": "geometry", "stylers": 
        [ 
            { "visibility": "simplified" }, 
            { "hue": "#ff8800" }, { "lightness": 25 } 
        ] 
    },
    { "featureType": "road", "elementType": "labels", "stylers": 
        [ 
            { "visibility": "off" } 
        ] 
    } 
];

var styledMap = new google.maps.StyledMapType(styles,{name: "Styled Map"});
function initialize(pos) 
{
        // Instantiate a directions service.
        directionsService = new google.maps.DirectionsService();
        geocoder = new google.maps.Geocoder();
        // Create a map and center it on Manhattan.
        
       var mapOptions = {
                zoom:11,
                mapTypeId: google.maps.MapTypeId.ROADMAP,
                center:pos,
                scrollwheel: false,
                mapTypeControl:false,
                streetViewControl: false,
                panControl: true,
        }

        if(Modernizr.touch)
        {
                mapOptions.draggable = false;
        }
        map = new google.maps.Map(document.getElementById('map_canvas'), mapOptions);
        // Create a renderer for directions and bind it to the map.
        var rendererOptions = {
                map: map
        }
        directionsDisplay = new google.maps.DirectionsRenderer(rendererOptions)
        // Instantiate an info window to hold step text.
        stepDisplay = new google.maps.InfoWindow();

        map.mapTypes.set('map_style', styledMap);
        map.setMapTypeId('map_style');



        TraceArrondissements();
}

var ArrondissementData = [];
function TraceArrondissements()
{
    jQuery.ajax({
          url: 'assets/qcdata/ARROND.JSON',
          type: 'GET',
          dataType: 'json',
          complete: function(xhr, textStatus) {
            //called when complete
          },
          success: function(data, textStatus, xhr) {
        $.each(data.Arrondissements.Arrondissement, function(key,value){

            ArrondissementData[key] = {};
            ArrondissementData[key].Nom = value.Nom;
            ArrondissementData[key].Abreviation = value.Abreviation;

            var polydata = value.Geometrie.split('((');
                polydata = polydata[1].split('))');
                polydata = polydata[0];
                polydata = polydata.split(',');
            
            for(var u = 0;u<polydata.length;u++)
            {
                polydata[u] = polydata[u].split(' ');

                polydata[u] = new google.maps.LatLng(polydata[u][1], polydata[u][0]);
            }
            
                    var shape = new google.maps.Polygon({
                        paths: polydata,
                        strokeColor: '#717070',
                        strokeOpacity: 0.3,
                        strokeWeight: 2,
                        fillColor: '#4B84FD',
                        fillOpacity: 0.1
                      });

                    AllArrond.push(polydata);
                    shape.setMap(map);

        });

      },
      error: function(xhr, textStatus, errorThrown) {

      }
    });
}

function CheckPoint()
{
    var test = false;
    for(var u=0;u<AllArrond.length;u++)
    {
        var polygon = new google.maps.Polygon({path:AllArrond[u]});

        if (polygon.Contains(latlng)) {
            test = true;
            break;
        }
    }

    if(!test) {
        alert('La localisation n\'est pas dans la zone couverte par la ville');
    }

    return test;
}

function GetArrondissement(object)
{
    var Gpoint;

    if(typeof object == "object")
    {
        Gpoint = new google.maps.LatLng(point.lat, point.lon);
    }
    else
    {
        geocoder.geocode( { 'address': object}, function(results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                Gpoint = new google.maps.LatLng(results[0].geometry.location.hb, results[0].geometry.location.ib);
            }    
        });
    }
    
    for(var u=0;u<AllArrond.length;u++)
    {
        var polygon = new google.maps.Polygon({path:AllArrond[u]});

        if (polygon.Contains(Gpoint)) {
            return ArrondissementData[u];
            break;
        }
    }
}

function debugMsgNoGeoloc(){
    if(greenlight.DEBUG){
        console.log('Your device does not support geolocation');
    }
}

function PlaceCurrentLocationMarker(){
    /* Depending on available features, gets location
       directly from device, or uses google API to 
       get latitude & longitude coordinates.

       Stores it in the "latlng" global as a
       google.maps.LatLng instance.
     */

    clearOverlays();

    // Is the current location event relevant ?
    // The user decides.
    if(! $('#chk-use-my-location').is(':checked') ){
        debugMsgNoGeoloc();
        return;
    }

    // Not touch screen means not mobile, in 99% cases
    if(!Modernizr.touch){
        debugMsgNoGeoloc();
        return;
    }

    // No geolocation available
    if(!Modernizr.geolocation){
        debugMsgNoGeoloc();
        return;
    }

    if(!navigator.geolocation)
    {
        debugMsgNoGeoloc();
        return;
    }

    navigator.geolocation.getCurrentPosition(function(position) {
        latlng = new google.maps.LatLng(
            position.coords.latitude, position.coords.longitude
        );
        setMarker(latlng);
    });

}

function setMarker(latlng){
    /*
     * This function places a marker on the map
     * with a funny bouncy animation.
     * latlng must be a google.maps.LatLng instance
     * */

    $('#AddressError').fadeOut();
    map.setCenter(latlng);

    var image = 'assets/img/map-pointer.png';

    var marker = new google.maps.Marker({
        map: map,
        position: latlng,
        icon: image,
    });

    marker.setAnimation(google.maps.Animation.BOUNCE);

    $(marker).delay(2000).queue(function( nxt ) {
        marker.setAnimation(null);
    });

    markerArray.push(marker);

}

function PlaceAddressMarker(address) {

    clearOverlays();

    if(!address)
        address = $('#address_string').val();

    geocoder.geocode( { 'address': address}, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
            var loc = results[0].geometry.location;
            latlng = new google.maps.LatLng( loc.lat(), loc.lng() );
            setMarker(latlng);
        } else {
            $('#AddressError').fadeIn();
            if(greenlight.DEBUG){
                console.log('Google Maps API could not geolocate this address');
            }
        }
    });
} 

function clearOverlays() {
    if (markerArray) {
        for (i in markerArray) {
            markerArray[i].setMap(null);
        }
    }
}

function ResizeMap() {
    initialize(latlng);
    setMarker(latlng);
}

$(document).ready(function() {

    /*********** Google Map autocomplete */
    var input = document.getElementById('address_string');
    var autocomplete = new google.maps.places.Autocomplete(input);
    
    var infowindow = new google.maps.InfoWindow();
    

    google.maps.event.addListener(autocomplete, 'place_changed', function() {
        infowindow.close();
        input.className = '';
        var place = autocomplete.getPlace();
        if (!place.geometry) {
            // Inform the user that the place was not found and return.
            input.className = 'notfound';
            return;
        }
        // If the place has a geometry, then present it on a map.
        if (place.geometry.viewport) {
            map.fitBounds(place.geometry.viewport);
        } else {
            map.setCenter(place.geometry.location);
            map.setZoom(13); // Why 13? Because it looks good.
        }
        var image = {
            url: place.icon,
            size: new google.maps.Size(71, 71),
            origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(17, 34),
            scaledSize: new google.maps.Size(35, 35)
        };
        var address = '';
        PlaceAddressMarker();
        if (place.address_components) {
            address = [
                (place.address_components[0] && place.address_components[0].short_name || ''),
                (place.address_components[1] && place.address_components[1].short_name || ''),
                (place.address_components[2] && place.address_components[2].short_name || '')
            ].join(' ');
        }
        infowindow.setContent('<div><strong>' + place.name + '</strong><br>' + address);
    }); 

    /*********** Google Map autocomplete */

    google.maps.Polygon.prototype.Contains = function(point) {
        // ray casting alogrithm http://rosettacode.org/wiki/Ray-casting_algorithm
        var crossings = 0,
            path = this.getPath();

        // for each edge
        for (var i=0; i < path.getLength(); i++) {
            var a = path.getAt(i),
                j = i + 1;
            if (j >= path.getLength()) {
                j = 0;
            }
            var b = path.getAt(j);
            if (rayCrossesSegment(point, a, b)) {
                crossings++;
            }
        }

        // odd number of crossings?
        return (crossings % 2 == 1);

        function rayCrossesSegment(point, a, b) {
            var px = point.lng(),
                py = point.lat(),
                ax = a.lng(),
                ay = a.lat(),
                bx = b.lng(),
                by = b.lat();
            if (ay > by) {
                ax = b.lng();
                ay = b.lat();
                bx = a.lng();
                by = a.lat();
            }
            // alter longitude to cater for 180 degree crossings
            if (px < 0) { px += 360 };
            if (ax < 0) { ax += 360 };
            if (bx < 0) { bx += 360 };

            if (py == ay || py == by) py += 0.00000001;
            if ((py > by || py < ay) || (px > Math.max(ax, bx))) return false;
            if (px < Math.min(ax, bx)) return true;

            var red = (ax != bx) ? ((by - ay) / (bx - ax)) : Infinity;
            var blue = (ax != px) ? ((py - ay) / (px - ax)) : Infinity;
            return (blue >= red);

        }

     };

    $('#address_string').on('input', function() {
        PlaceAddressMarker();
    });

    $('#address_string').bind('keypress', function(e) {
        if(e.keyCode==13){
           PlaceAddressMarker();
        }
        // Enter pressed... do anything here...
    });


    initialize(quebec);
    PlaceCurrentLocationMarker();
    window.addEventListener('resize', ResizeMap, false);


});
