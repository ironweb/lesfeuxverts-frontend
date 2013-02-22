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

    $('#submitRequestId').click(function() {
        greenlight.update_requests_list(0, $('#requestId').val(), 0, '', '');
    });

    $('#use-my-location').change(function(){
        greenlight.refresh_geolocation_fields( ! $(this).is(':checked') );
    });

    $('#submitAdvancedSearch').click(function() {
      greenlight.update_requests_list(
          $('#servicesList2 :selected').val(), 0, $('#statesList :selected').val(), $('#startDate').val(), $('#endDate').val()
      );
    });

    /* Tabs */
    var tabHeader = $('nav .tab');
    var tabContent = $('#container');

    tabHeader.click(function() {
     
    if (!$(this).hasClass('active')) {

        var current = $('#container > section:not(.active)');

        $('#Arrow').stop().animate({left: $(this).position().left+$(this).width()/2-$('#Arrow').width()/2});

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


var greenlight = {};
greenlight.BACKEND_URL = 'http://api.lesfeuxverts.com';
greenlight.DEBUG = false;
    
greenlight.update_services_list = function(){
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
            $('.servicesList').append('<option value="' + service.service_code + '">' + key + '</option>');
        });


    }).fail(function(response, textStatus, jqXHR) {
        // TODO : do something in case it fails
    });
};

greenlight.create_request = function(){
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

    if(!CheckPoint())
    {
        return;
    }

    var dataString = $('#creation').serialize();
    dataString += "&lat="+currentPos.lat+"&long="+currentPos.long;
    
    $.ajax({
        url: greenlight.BACKEND_URL + '/requests/',
        data:dataString,
        type: 'POST'
    }).done(function(response, textStatus, jqXHR) {
      
        // Request Create Success
    }).fail(function(response, textStatus, jqXHR) {
        // Request Create Fail
    });
    
};

greenlight.update_requests_list = function(service, id, state, startdate, enddate){
    $('#requestsList')
            .html('')
            .css({
                'background-image': 'url(assets/img/loading.gif)',
                'display': 'block'
            });

    $('#errorMsg')
            .html('')
            .css('display', 'none');

    $('#resultStats')
            .html('')
            .css('display', 'block');

    var requestData = {};
    var urlExt = '';
    var ajaxUrl = greenlight.BACKEND_URL + '/requests/' + urlExt;
    var start = new Date().getMilliseconds();

    if (service != 0) { requestData.service_code = service; }
    if (state != 0) { requestData.status = state; }
    if (id != 0) { urlExt = id; }

    if (startdate != '') {
        var tmpStartDate = new Date(startdate);
        requestData.start_date = tmpStartDate.toISOString();
    }
    if (enddate != '') {
        alert(enddate);
        var tmpEndDate = new Date(enddate);
        requestData.end_date = tmpEndDate.toISOString();
    }



    if (checkUrl(ajaxUrl)) {

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
            greenlight.generateRequestDetails(response, executionTime);

            // TODO : loop through "response.content" and to things
        }).fail(function(response, textStatus, jqXHR) {
            // TODO : do something in case it fails
        });
    } else {
        $('#resultStats')
                .css('display', 'none');

        $('#errorMsg')
                .html('Votre numéro de demande est invalide.<br />Veuillez essayer de nouveau.')
                .css('display', 'block');

        $('#requestsList')
                .css('display', 'none');
    }

};

greenlight.refresh_geolocation_fields = function(use_my_location){

    if(use_my_location){
        $('#address_string').removeAttr('disabled');

        PlaceCurrentLocationMarker();

    } else {
        $('#address_string').attr('disabled', 'disabled');

        address = $('#address_string').val();
        if(address)
            PlaceAddressMarker(address)

    }
};

greenlight.generateRequestDetails = function(response, delay){
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
        var colors = {};

        colors.red = (service.status == 'open' && (service.service_code == '' || service.service_code == null)) ? ' ok' : '';
        colors.orange = (service.status == 'open' && (service.service_code != '' && service.service_code != null)) ? ' ok' : '';
        colors.green = (service.status == 'closed' && (service.service_code != '' && service.service_code != null)) ? ' ok' : '';
        colors.x = (service.status == 'closed' && (service.service_code == '' || service.service_code == null)) ? ' ok' : '';

        var colorsSpan = '<span class="color red' + colors.red + '"></span>';
        colorsSpan += '<span class="color orange' + colors.orange + '"></span>';
        colorsSpan += '<span class="color green' + colors.green + '"></span>';
        colorsSpan += '<span class="color x' + colors.x + '"></span>';

        requestsHtml += '<header><h1>' + service.service_name + colorsSpan + '</h1></header>';
        requestsHtml += '<div class="details">';
        requestsHtml += '<div class="spacer">';

        requestsHtml += '<table border="0" cellpadding="0" cellspacing="0" width="100%">';

        for (var key in details) {
            var value = eval('service.' + key);

            switch (key) {
                case 'status':
                    value = (value == 'open') ? 'Ouvert' : 'Fermé';
                    break;
                case 'requested_datetime':
                    // Format date to YY/mm/dd
                    break;
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
};


// http://stackoverflow.com/questions/1591401/javascript-jquery-check-broken-links
function checkUrl(url) {
  var http = new XMLHttpRequest();
  http.open('HEAD', url, false);
  http.send();
  return http.status!=404;
}


/*
 * General purpose stuff
 */

// http://stackoverflow.com/questions/2573521/how-do-i-output-an-iso-8601-formatted-string-in-javascript
if (!Date.prototype.toISOString) {
    Date.prototype.toISOString = function() {
        function pad(n) { return n < 10 ? '0' + n : n }
        return this.getUTCFullYear() + '-'
            + pad(this.getUTCMonth() + 1) + '-'
            + pad(this.getUTCDate()) + 'T'
            + pad(this.getUTCHours()) + ':'
            + pad(this.getUTCMinutes()) + ':'
            + pad(this.getUTCSeconds()) + 'Z';
    };
}
