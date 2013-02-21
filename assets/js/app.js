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


    greenlight.DEBUG = true;
    greenlight.update_services_list();

    // work in progress
    greenlight.update_requests_list();

var multipleToggle = false; // True if multiple toggle boxes can be opened at the same time
    var toggleSpeed = 250; // Speed of toggle animation
    var toggleBox = $('.toggleBox');

    $('.details', toggleBox).each(function() {
        $(this)
            .attr('data-height', $(this).innerHeight())
            .css({
                'height': 0,
                'display': 'block'
            });
    });

    toggleBox.click(function() {
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



    /* Tabs */
    var tabHeader = $('#tabHeaderContainer .tab');
    var tabContent = $('#tabContentContainer');
    var tabSpeed = 250;

    $('> section', tabContent).each(function() {
      $(this).attr('data-height', $(this).innerHeight());
    });

    $('section:eq(1)', tabContent).css({
      'position': 'relative',
      'visibility': 'visible',
      'display': 'none'
    });

    tabHeader.click(function() {
      var tabEq = tabHeader.index($(this));
      var invTabEq = (tabEq == 1) ? 0 : 1;

      if (!$(this).hasClass('active')) {
          tabHeader.removeClass('active');
          $(this).addClass('active');

          $('#tabContentContainer section:eq(' + invTabEq + ')')
                  .animate({
                      opacity: 0
                  },
                  tabSpeed,
                  function() {
                      $(this).css('display', 'none');

                      $('#tabContentContainer section:eq(' + tabEq + ')')
                              .css('display', 'block')
                              .animate({
                                  opacity: 1
                              })
                  });
      }
    });


    /* Maps */


    initialize(quebec);
    getLocation();
    window.addEventListener('resize', ResizeMap, false);



    $('body').pageScroller({
            navigation: '#nav'
    });


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

    BACKEND_URL: 'http://ironweb-greenlight.herokuapp.com',
    //BACKEND_URL: 'http://localhost:8000',
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
                console.log('services', response.content);
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
        // TODO : program this function
        /*
        $.ajax({
            url: greenlight.BACKEND_URL + '/services/',
            dataType: 'json',
            type: 'POST'
        }).done(function(response, textStatus, jqXHR) {
            var l = [];
            $(response.content).each( function(i, service){
                l.push(service.group + ' - ' + service.service_name);
            });

            l.sort();

            // TODO : use "l" 
            //console.log(l);

        }).fail(function(response, textStatus, jqXHR) {
            // TODO : do something in case it fails
        });
        */
    },

    update_requests_list: function(){
        /*
         * Populates the list of requests
         * based on a bunch of search criteria
         * */
        $.ajax({
            url: greenlight.BACKEND_URL + '/requests/',
            dataType: 'json',
            type: 'GET'
        }).done(function(response, textStatus, jqXHR) {
            if(greenlight.DEBUG){
                console.log('requests', response.content);
            }

            // TODO : loop through "response.content" and to things
        }).fail(function(response, textStatus, jqXHR) {
            // TODO : do something in case it fails
        });

    }

};

/* Maps */
// TODO : Migrate in greenlight namespace
var map;
var directionsDisplay;
var directionsService;
var stepDisplay;
var markerArray = [];
var geocoder;
var currentPos = {};

// Starting Position (Maybe change)
var quebec = new google.maps.LatLng(46.810811, -71.215439);

var styles = [
    {
      stylers: [
        { hue: "#37af78" },
        { saturation: 0 }
      ]
    },{
      featureType: "road",
      elementType: "geometry",
      stylers: [
        { lightness: 100 },
        { visibility: "simplified" }
      ]
    },{
      featureType: "road",
      elementType: "labels",
      stylers: [
        { visibility: "off" }
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
                scrollwheel: false
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

function getLocation(){
    /* Depending on available features, gets location
       directly from device, or uses google API to 
       get latitude & longitude coordinates.
     */

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

    // Seems like device can geolocate; does the user want it that way ?
    if(! $('#chk-use-my-location').is(':checked') ){
        debugMsgNoGeoloc();
        return;
    }
    
    if(!navigator.geolocation)
    {
        debugMsgNoGeoloc();
        return;
    }

    navigator.geolocation.getCurrentPosition(function(position) {
        currentPos.lat = position.coords.latitude;
        currentPos.lon = position.coords.longitude;
    });

}

function getAddress() {
    var address = $('#address').val();
    clearOverlays();
    geocoder.geocode( { 'address': address}, function(results, status) {
    if (status == google.maps.GeocoderStatus.OK) {
        map.setCenter(results[0].geometry.location);
        var marker = new google.maps.Marker({
            map: map,
            position: results[0].geometry.location
        });

        markerArray.push(marker);

        currentPos.lat = results[0].geometry.location.hb;
        currentPos.lon = results[0].geometry.location.ib;

    } 
    else 
    {
        if(greenlight.DEBUG){
            console.log('Google Maps API could not geolocate this address');
        }
    }
    });
} 

function clearOverlays() 
{
    if (markerArray) 
    {
        for (i in markerArray) 
        {
            markerArray[i].setMap(null);
        }
    }
}

function ResizeMap()
{
    var newPos = new google.maps.LatLng(currentPos.lat, currentPos.lon);
    initialize(newPos);
    var marker = new google.maps.Marker({
            map: map,
            position: newPos
    });
}

