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
