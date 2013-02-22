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



$(document).ready(function() {
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


            tabHeader.removeClass('active');
            $(this).addClass('active');
          }
    });

    

});
