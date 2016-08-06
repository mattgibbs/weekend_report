function makePie(element, dataset, w, h) {
  var margin = 30;
  var radius = Math.min(w, h) / 2;
  var arc = d3.svg.arc()
  				.innerRadius(radius * 0.8)
  				.outerRadius(radius * 0.4);
  var outerArc = d3.swg.arc()
          .innerRadius(radius * 0.9)
          .outerRadius(radius * 0.9);
          
  var pie = d3.layout.pie()
              .sort(null)
              .value(function(d) { return d.value; })
              .padAngle(0.5*Math.PI/180);
  
  
  
  //Easy colors accessible via a 10-step ordinal scale
  //var color = d3.scale.category10();
  var color = d3.scale.ordinal()
                .domain(["Downtime", "Config Changes", "Delivered", "Tuning"])
                .range(["#d95f02", "#7570b3", "#1b9e77", "#e7298a"])
  //Create SVG element
  var svg = d3.select(element)
  			.append("svg")
        .append("g");
  svg.append("g").attr("class", "slices");
  svg.append("g").attr("class", "labels");
  svg.append("g").attr("class", "lines");
  svg.attr("transform", "translate(" + w/2 +  "," + h/2 + ")");
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
  
  function change(data) {
    var duration = 250;
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
      .attrTween("transform", function(d) {
        var interpolate = d3.interpolate(this._current, d);
        var _this = this;
        return function(t) {
          var d2 = interpolate(t);
          _this._current = d2;
          var pos = outerArc.centroid(d2);
          pos[0] = radius * (midAngle(d2) < Math.PI ? 1 : -1);
          return "translate(" + pos + ")";
        };
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
          //this._current = this._current;
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
  };
}