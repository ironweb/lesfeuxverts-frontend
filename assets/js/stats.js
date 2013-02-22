
var date = new Date();
var day = date.getDate();
var month = date.getUTCMonth();
var year = date.getFullYear();

var firstStat = 100;

var lastMonth = year+"-"+(date.getMonth())+"-"+day;

$(document).ready(function(){

    var archtype = Raphael("stats1", 0, 0);
    archtype.customAttributes.arc = function (xloc, yloc, value, total, R) {
        var alpha = 360 / total * value,
            a = (90 - alpha) * Math.PI / 180,
            x = xloc + R * Math.cos(a),
            y = yloc - R * Math.sin(a),
            path;
        if (total == value) {
            path = [
                ["M", xloc, yloc - R],
                ["A", R, R, 0, 1, 1, xloc - 0.01, yloc - R]
            ];
        } else {
            path = [
                ["M", xloc, yloc - R],
                ["A", R, R, 0, +(alpha > 180), 1, x, y]
            ];
        }
        return {
            path: path
        };
    };


    jQuery.ajax({
      url: 'http://api.lesfeuxverts.com/stats/states',
      type: 'GET',
      data: {'start_date': lastMonth},
      complete: function(xhr, textStatus) {
        //called when complete
      },
      success: function(data, textStatus, xhr) {
        var obj = jQuery.parseJSON(data);
        firstStat = Math.round(obj.content.open_count/obj.content.total*100);

        //make an arc at 50,50 with a radius of 30 that grows from 0 to 40 of 100 with a bounce
        var my_arc = archtype.path().attr({
            "stroke": "#FFFFFF",
            "stroke-width": 50,
            arc: [110, 110, firstStat, 100, 80]
        });

        $('#stats1').css('margin-left',40).after(firstStat+"% demandes résolues le mois dernier");
      },
      error: function(xhr, textStatus, errorThrown) {
        //called when there is an error
      }
    });

    

    
});







