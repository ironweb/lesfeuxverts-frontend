

var d = new Date();

console.log(d);
jQuery.ajax({
  url: 'http://api.lesfeuxverts.com/stats/states',
  type: 'GET',
  data: {'start_date': 'value1'},
  complete: function(xhr, textStatus) {
    //called when complete
  },
  success: function(data, textStatus, xhr) {
    //called when successful
  },
  error: function(xhr, textStatus, errorThrown) {
    //called when there is an error
  }
});


var amount = 87;


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

//make an arc at 50,50 with a radius of 30 that grows from 0 to 40 of 100 with a bounce
var my_arc = archtype.path().attr({
    "stroke": "#FFFFFF",
    "stroke-width": 50,
    arc: [110, 110, amount, 100, 80]
});
