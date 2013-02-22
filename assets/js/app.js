;(function ($, window, undefined) {
  'use strict';

  var $doc = $(document),
      Modernizr = window.Modernizr;

  $(document).ready(function() {
    $.fn.foundationAlerts           ? $doc.foundationAlerts() : null;
    $.fn.foundationButtons          ? $doc.foundationButtons() : null;
    $.fn.foundationAccordion        ? $doc.foundationAccordion() : null;
    $.fn.foundationNavigation       ? $doc.foundationNavigation() : null;
    $.fn.foundationTopBar           ? $doc.foundationTopBar() : null;
    $.fn.foundationCustomForms      ? $doc.foundationCustomForms() : null;
    $.fn.foundationMediaQueryViewer ? $doc.foundationMediaQueryViewer() : null;
    $.fn.foundationTabs             ? $doc.foundationTabs({callback : $.foundation.customForms.appendCustomMarkup}) : null;
    $.fn.foundationTooltips         ? $doc.foundationTooltips() : null;
    $.fn.foundationMagellan         ? $doc.foundationMagellan() : null;
    $.fn.foundationClearing         ? $doc.foundationClearing() : null;

    $.fn.placeholder                ? $('input, textarea').placeholder() : null;


    // Set this to true for more log messages
    greenlight.DEBUG = true;
    greenlight.update_services_list();

    /* Requests page */
    greenlight.update_requests_list(0,0);

    $('#servicesList').change(function() {
        greenlight.update_requests_list($(':selected', this).val(), 0);
    });

    $('#submitRequestId').click(function() {
        greenlight.update_requests_list(0, $('#requestId').val());
    });

    $('#use-my-location').change(function(){
        greenlight.refresh_geolocation_fields( ! $(this).is(':checked') );
    });

    /* Tabs */
    var tabHeader = $('nav .tab');
    var tabContent = $('#container');


    tabHeader.click(function() {
     
    if (!$(this).hasClass('active')) 
    {

        var current = $('#container > section:not(.active)');
        var currentActive = $('#container > section.active');
        currentActive.removeClass('active');
        current.addClass('active');
        currentActive.fadeOut('slow', function() {
            $(this).css('display','none');
            current.fadeIn();
            });

        var svg1 = $('nav > .active').find('img').attr('src').split('/');
        svg1 = getUrlSyntax(svg1,'inactif');
        
        $('nav > .active').find('img').attr('src',svg1);

        tabHeader.removeClass('active');
        $(this).addClass('active');

        var svg2 = $(this).find('img').attr('src').split('/');
        svg2 = getUrlSyntax(svg2,'actif');
        
        $(this).find('img').attr('src',svg2);
      }
    });

    function getUrlSyntax(url,etat)
    {
        url = url[url.length-1].split("-");
        url[1] = url[1].split('.');

        url[1][0] = etat;

        return "assets/img/"+url[0]+"-"+url[1][0]+"."+url[1][1];
    }

    $('#address_string').bind('keypress', function(e) {
        if(e.keyCode==13){
            PlaceAddressMarker();
        }
        // Enter pressed... do anything here...
    });


    /* Maps */
    initialize(quebec);
    PlaceCurrentLocationMarker();
    window.addEventListener('resize', ResizeMap, false);

  });

  // UNCOMMENT THE LINE YOU WANT BELOW IF YOU WANT IE8 SUPPORT AND ARE USING .block-grids
  // $('.block-grid.two-up>li:nth-child(2n+1)').css({clear: 'both'});
  // $('.block-grid.three-up>li:nth-child(3n+1)').css({clear: 'both'});
  // $('.block-grid.four-up>li:nth-child(4n+1)').css({clear: 'both'});
  // $('.block-grid.five-up>li:nth-child(5n+1)').css({clear: 'both'});

  // Hide address bar on mobile devices (except if #hash present, so we don't mess up deep linking).
  if (Modernizr.touch && !window.location.hash) {
    $(window).load(function () {
      setTimeout(function () {
        window.scrollTo(0, 1);
      }, 0);
    });
  }

})(jQuery, this);


var greenlight = {

    BACKEND_URL: 'http://api.lesfeuxverts.com',
    DEBUG: false,
    
    update_services_list: function(){
        /*
         * Populates the services list in the form.
         */
        $.ajax({
            url: greenlight.BACKEND_URL + '/services/',
            dataType: 'json',
            type: 'GET'
        }).done(function(response, textStatus, jqXHR) {
            if(greenlight.DEBUG){
            }

            var l = [];
            var d = {};
            $(response.content).each( function(i, service){
                key = service.group + ' - ' + service.service_name;
                l.push(key);
                d[key] = service;
            });

            l.sort();

            $(l).each( function(i, key){
                service = d[key];
                $('#servicesList').append('<option value="' + service.service_code + '">' + key + '</option>');
            });


        }).fail(function(response, textStatus, jqXHR) {
            // TODO : do something in case it fails
        });
    },

    create_request: function(){
        /*
         * Creates a new service request using
         * data in the form
         * */
          /*address_string
            email
            first_name
            last_name
            phone
            description
            media_url*/

        var dataString = $('#creation').serialize();

        // Try to use GPS coordinates.
        // No need to check if they're empty; they're optional.
        if( userAllowsGeolocation() ){
            if(greenlight.DEBUG){
                console.log('User chose not to use geolocation.');
            }
            dataString += "&lat="+currentPos.lat+"&long="+currentPos.long;
        }
        
        $.ajax({
            url: greenlight.BACKEND_URL + '/requests/',
            data:dataString,
            type: 'POST'
        }).done(function(response, textStatus, jqXHR) {
          
            // Request Create Success
        }).fail(function(response, textStatus, jqXHR) {
            // Request Create Fail
        });
        
    },

    update_requests_list: function(service, id){
        $('#requestsList')
                .html('')
                .css('background-image', 'url(assets/img/loading.gif)');

        var requestData = {};
        var urlExt = '';
        var start = new Date().getMilliseconds();

        if (service != 0) {
            requestData = { service_code: service }
        }

        if (id != 0) {
            urlExt = id;
        }

        /*
     * Populates the list of requests
     * based on a bunch of search criteria
     * */
        $.ajax({
            url: greenlight.BACKEND_URL + '/requests/' + urlExt,
            dataType: 'json',
            type: 'GET',
            data: requestData
        }).done(function(response, textStatus, jqXHR) {
            if(greenlight.DEBUG){
                console.log('requests', response.content);
            }

            var stop = new Date().getMilliseconds();
            var executionTime = stop - start;
            executionTime = (executionTime < 0) ? executionTime * -1 : executionTime;
            generateRequestDetails(response, executionTime);

            // TODO : loop through "response.content" and to things
        }).fail(function(response, textStatus, jqXHR) {
            // TODO : do something in case it fails
        });

    },

    refresh_geolocation_fields : function(use_my_location){

        if(use_my_location){
            $('#address_string').removeAttr('disabled');

            PlaceCurrentLocationMarker();

        } else {
            $('#address_string').attr('disabled', 'disabled');

            address = $('#address_string').val();
            if(address)
                PlaceAddressMarker(address)

        }
    }

};

function generateRequestDetails(response, delay) {
    var nbrResults = (typeof response.content.length == "undefined") ? '1' : response.content.length;
    $('#resultStats').html('<strong>' + nbrResults + ' résultat(s) trouvé(s)</strong> en ' + (delay / 1000).toFixed(2) + ' secondes');
    $('#requestsList')
            .css('background-image', 'none');

    var requestsHtml = '';
    var details = new Object();
    details['description'] = 'Description';
    details['address'] = 'Adresse';
    details['zipcode'] = 'Code postal';
    details['lat'] = 'Latitude';
    details['long'] = 'Longitude';
    details['requested_datetime'] = 'Ouverture'; // /Date(1361304360960-0500)/
    details['service_code'] = 'Numéro';
    details['service_name'] = 'Service';
    details['status'] = 'Statut';
    details['status_notes'] = 'Notes';
    details['service_request_id'] = 'ID';

    $(response.content).each( function(i, service){
        requestsHtml += '<article class="toggleBox">';
        var bottomLinks = '';
        var addBottomLinks = false;

        requestsHtml += '<header><h1>' + service.service_code + '<span></span></h1></header>';
        requestsHtml += '<div class="details">';
        requestsHtml += '<div class="spacer">';

        requestsHtml += '<table border="0" cellpadding="0" cellspacing="0" width="100%">';

        for (var key in details) {
            var value = eval('service.' + key);

            if (key == 'status') {
                value = (value == 'open') ? 'Ouvert' : 'Fermé';
            }

            if (value != null && value != 'null' && value != '') {
                requestsHtml += '<tr>';
                requestsHtml += '<td width="90"><strong>' + details[key] + ' :</strong></td>';
                requestsHtml += '<td>' + value + '</td>';
                requestsHtml += '</tr>';
            }
        }

        bottomLinks += '<tr>';
        bottomLinks += '<td colspan="2">';

        if (service.media_url != '') {
            addBottomLinks = true;
            bottomLinks += '<a href="' + service.media_url + '" target="_blank">Image</a>';
        }

        if (service.address != '' && service.address != 'null' && service.address != null) {
            addBottomLinks = true;
            bottomLinks += '<a href="http://maps.google.com/maps?q=' + service.address + '&num=1&t=h&vpsrc=0&ie=UTF8&z=4&iwloc=A" target="_blank">Localisation</a>';
        } else {
            if (service.lat != 0 && service.long != 0) {
                addBottomLinks = true;
                bottomLinks += '<a href="http://maps.google.com/maps?q=' + service.lat + ',' + service.long + '&num=1&t=h&vpsrc=0&ie=UTF8&z=4&iwloc=A" target="_blank">Localisation</a>';
            }
        }

        bottomLinks += '</td>';
        bottomLinks += '</tr>';

        if (addBottomLinks) { requestsHtml += bottomLinks; }

        requestsHtml += '</table>';

        requestsHtml += '</div>';
        requestsHtml += '</div>';
        requestsHtml += '</article>';
    });

    $('#requestsList').append(requestsHtml);
    generateToggleClick();
}

/* Toggles */
var multipleToggle = false; // True if multiple toggle boxes can be opened at the same time
var toggleSpeed = 250; // Speed of toggle animation

function generateToggleClick() {
    toggleBox = $('.toggleBox');
    $('div').undelegate('article[class^=toggleBox]', 'click');

    $('.toggleBox div[class^=details]').each(function() {
        $(this)
        .attr('data-height', $(this).innerHeight())
        .css({
            'height': 0,
            'display': 'block'
        });
    });

    $('div').delegate('article[class^=toggleBox]', 'click', function(event) {
        event.stopPropagation();
        var detailsElement = $('.details', this);
        var detailsHeight = detailsElement.data('height');
        var openedEq = toggleBox.index($('.opened'));
        var clickedEq = toggleBox.index($(this));

        if (!multipleToggle) {
            if (openedEq != -1 && openedEq != clickedEq) {
                var openedToggleBox = $('.toggleBox:eq(' + openedEq + ')');
                openedToggleBox.removeClass('opened');

                $('.details', openedToggleBox)
                    .clearQueue()
                    .animate({
                        height: 0
                }, toggleSpeed);
            }
        }

        if ($(this).hasClass('opened')) {
            $(this).removeClass('opened');
            detailsHeight = 0;
        } else {
            $(this).addClass('opened');
        }

        detailsElement
                .clearQueue()
                .animate({
                    height: detailsHeight
                }, toggleSpeed);
    });
}


/* Maps */
// TODO : Migrate in greenlight namespace
var map;
var directionsDisplay;
var directionsService;
var stepDisplay;
var markerArray = [];
var geocoder;

// Starting Position (Maybe change)
var quebec = new google.maps.LatLng(46.810811, -71.215439);
var latlng = quebec;

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
            zoom: 13,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            center:pos,
            scrollwheel: false,
            mapTypeControl:false,
            streetViewControl: false,
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
    var marker = new google.maps.Marker({
        map: map,
        position: latlng
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
    var marker = new google.maps.Marker({
        map: map,
        position: latlng
    });
}

