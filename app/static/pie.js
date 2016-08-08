function makePie(element, dataset, w, h) {
  var margin = 10;
  var radius = Math.min(w, h) / 2;
  var arc = d3.arc()
  				.innerRadius(radius * 0.8)
  				.outerRadius(radius * 0.4);
  var outerArc = d3.arc()
          .innerRadius(radius * 0.9)
          .outerRadius(radius * 0.9);
          
  var pie = d3.pie()
              .sort(null)
              .value(function(d) { return d.value; })
              .padAngle(0.5*Math.PI/180);
  //Easy colors accessible via a 10-step ordinal scale
  //var color = d3.scale.category10();
  var color = d3.scaleOrdinal()
                .domain(["Downtime", "Config Changes", "Delivered", "Tuning"])
                .range(["#d95f02", "#7570b3", "#1b9e77", "#e7298a"])
  //Create SVG element
  var svg = d3.select(element)
  			.append("svg")
        .attr("width", w)
        .attr("height", h)
        .append("g");
  svg.attr("transform", "translate(" + w/2 +  "," + (h+margin)/2 + ")");
  svg.append("g").attr("class", "slices");
  svg.append("g").attr("class", "labels");
  svg.append("g").attr("class", "lines");
  
  var key = function(d){ return d.data.title; };
  
  function mergeWithFirstEqualZero(first, second) {
    var secondSet = d3.set();
    second.forEach(function(d) { secondSet.add(d.title); });
    var onlyFirst = first
      .filter(function(d){ return !secondSet.has(d.title) })
      .map(function(d){ return {title: d.title, value: 0}; });
    return d3.merge([second, onlyFirst])
      .sort(function(a,b) { return d3.ascending(a.title, b.title); });
  }
  
  change(dataset);
  
  function change(data) {
    var duration = 0;
    var data0 = svg.select(".slices").selectAll("path.slice")
      .data().map(function(d) { return d.data });
    if (data0.length == 0) { data0 = data; }
    var was = mergeWithFirstEqualZero(data, data0);
    var is = mergeWithFirstEqualZero(data0, data);
    var slice = svg.select(".slices").selectAll("path.slice").data(pie(was), key);
    slice.enter()
      .insert("path")
      .attr("class", "slice")
      .style("fill", function(d) { return color(d.data.title); })
      .each(function(d) {
        this._current = d;
      });
    slice = svg.select(".slices").selectAll("path.slice").data(pie(is), key);
    slice.transition().duration(duration).attrTween("d", function(d) {
      var interpolate = d3.interpolate(this._current, d);
      var _this = this;
      return function(t) {
        _this._current = interpolate(t);
        return arc(_this._current);
      };
    });
    slice = svg.select(".slices").selectAll("path.slice").data(pie(data), key);
    slice.exit().transition().delay(duration).duration(0).remove();
    
    var text = svg.select(".labels").selectAll("text").data(pie(was), key);
    text.enter()
      .append("text")
      .attr("dy", "0.35em")
      .style("opacity", 0)
      .text(function(d) {
        return d.data.title;
      })
      .each(function(d) {
        this._current = d;
      });
    function midAngle(d) {
      return d.startAngle + (d.endAngle - d.startAngle)/2;
    }
    text = svg.select(".labels").selectAll("text").data(pie(is), key);
    text.transition()
      .duration(duration)
      .style("opacity", function(d) {
        return d.data.value == 0 ? 0 : 1;
      })
      .attrTween("x", function(d) {
        var interpolate = d3.interpolate(this._current, d);
        var _this = this;
        return function(t) {
          var d2 = interpolate(t);
          _this._current = d2;
          return radius * (midAngle(d2) < Math.PI ? 1 : -1);
        }
      })
      .attrTween("y", function(d) {
        var interpolate = d3.interpolate(this._current, d);
        var _this = this;
        return function(t) {
          var d2 = interpolate(t);
          _this._current = d2;
          return outerArc.centroid(d2)[1];
        }
      })
      .styleTween("text-anchor", function(d) {
        var interpolate = d3.interpolate(this._current, d);
        return function(t) {
          var d2 = interpolate(t);
          return midAngle(d2) < Math.PI ? "start":"end";
        };
      });
      text = svg.select(".labels").selectAll("text").data(pie(data), key);
      text.exit().transition().delay(duration).remove();
      
      var polyline = svg.select(".lines").selectAll("polyline").data(pie(was), key);
      polyline.enter()
        .append("polyline")
        .style("opacity", 0)
        .each(function(d) {
          this._current = d;
        });
      polyline = svg.select(".lines").selectAll("polyline").data(pie(is), key);
      polyline.transition()
        .duration(duration)
        .style("opacity", function(d) {
          return d.data.value == 0 ? 0 : 0.5;
        })
        .attrTween("points", function(d) {
          this._current = this._current;
          var interpolate = d3.interpolate(this._current, d);
          var _this = this;
          return function(t) {
            var d2 = interpolate(t);
            _this._current = d2;
            var pos = outerArc.centroid(d2);
            pos[0] = radius * 0.95 * (midAngle(d2) < Math.PI ? 1 : -1);
            return [arc.centroid(d2), outerArc.centroid(d2), pos];
          };
        });
      polyline = svg.select(".lines").selectAll("polyline").data(pie(data), key);
      polyline.exit().transition().delay(duration).remove();
      
      var alpha = 0.5;
      var spacing = 20;

      function relax() {
          var again = false;
          text.each(function (d, i) {
              var a = this;
              var da = d3.select(a);
              var y1 = da.attr("y");
              text.each(function (d, j) {
                  var b = this;
                  // a & b are the same element and don't collide.
                  if (a == b) { return; }
                  var db = d3.select(b);
                  // a & b are on opposite sides of the chart and
                  // don't collide
                  if (da.attr("text-anchor") != db.attr("text-anchor")) return;
                  // Now let's calculate the distance between
                  // these elements. 
                  var y2 = db.attr("y");
                  var deltaY = y1 - y2;
            
                  // Our spacing is greater than our specified spacing,
                  // so they don't collide.
                  if (Math.abs(deltaY) > spacing) return;
            
                  // If the labels collide, we'll push each 
                  // of the two labels up and down a little bit.
                  again = true;
                  var sign = deltaY > 0 ? 1 : -1;
                  var adjust = sign * alpha;
                  da.attr("y",+y1 + adjust);
                  db.attr("y",+y2 - adjust);
              });
          });
          
          // Adjust our line leaders here
          // so that they follow the labels. 
          if(again) {
              polyline.attr("points", function(d, i) {
                var label = text.filter(function(d2, j) { return i === j; });
                var points = [arc.centroid(d), outerArc.centroid(d)];
                var y = label.attr("y");
                var x = label.attr("x");
                if ((x !== null) && (y !== null)) {
                  points.push([x,y]);
                }
                return points;
              })
              /*
              labelElements = textLabels[0];
              textLines.attr("y2",function(d,i) {
                  labelForLine = d3.select(labelElements[i]);
                  return labelForLine.attr("y");
              });*/
              setTimeout(relax,20)
          } else {
            
          }
      }
      relax();
  };
}