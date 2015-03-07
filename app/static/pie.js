function makePie(element, dataset, w, h) {
  var outerRadius = w / 2;
  var innerRadius = w / 3;
  var labelRadius = (outerRadius + innerRadius) / 2;
  var arc = d3.svg.arc()
  				.innerRadius(innerRadius)
  				.outerRadius(outerRadius);

  var pie = d3.layout.pie()
              .value(function(d) { return d.value; })
              .padAngle(0.5*Math.PI/180);

  //Easy colors accessible via a 10-step ordinal scale
  //var color = d3.scale.category10();
  var color = d3.scale.ordinal()
                .domain(["Downtime", "Config Changes", "Delivered"])
                .range(["#fc8d59", "#fee090", "#91bfdb"])
  //Create SVG element
  var svg = d3.select(element)
  			.append("svg")
  			.attr("width", w)
  			.attr("height", h);

  //Set up groups
  var arcs = svg.selectAll("g.arc")
  			  .data(pie(dataset))
  			  .enter()
  			  .append("g")
  			  .attr("class", "arc")
  			  .attr("transform", "translate(" + outerRadius + "," + outerRadius + ")");

  //Draw arc paths
  arcs.append("path")
      .attr("fill", function(d, i) {
      	return color(d.data.title);
      })
      .attr("d", arc);

  //Labels
  var labelgroups = svg.selectAll("g.label")
  	  .data(pie(dataset))
  	  .enter()
  	  .append("g")
  	  .attr("class", "label")
  	  .attr("transform", "translate(" + outerRadius + "," + outerRadius + ")");

  var textLabels = labelgroups.append("text")
            .attr("transform", function(d) {
              return "translate(" + arc.centroid(d) + ")";
            })
            .attr("dx", "0.5em")
            .attr("text-anchor", function (d, i) {
              centroid = arc.centroid(d);
              midAngle = Math.atan2(centroid[1], centroid[0]);
              x = Math.cos(midAngle) * labelRadius;
              return (x > 0) ? "start" : "end";
            })
            .text(function(d) {
              return d.data.value + " hrs";
            });
  //Space the labels out.  Fancy!
  alpha = 3;
  spacing = 8;

  function relax() {
      again = false;
      textLabels.each(function (d, i) {
          a = this;
          da = d3.select(a);
          y1 = da.attr("y");
          textLabels.each(function (d, j) {
              b = this;
              // a & b are the same element and don't collide.
              if (a == b) return;
              db = d3.select(b);
              // a & b are on opposite sides of the chart and
              // don't collide
              if (da.attr("text-anchor") != db.attr("text-anchor")) return;
              // Now let's calculate the distance between
              // these elements. 
              y2 = db.attr("y");
              deltaY = y1 - y2;
              // Our spacing is greater than our specified spacing,
              // so they don't collide.
              if (Math.abs(deltaY) > spacing) return;
  
              // If the labels collide, we'll push each 
              // of the two labels up and down a little bit.
              again = true;
              sign = deltaY > 0 ? 1 : -1;
              adjust = sign * alpha;
              da.attr("y",+y1 + adjust + 3);
              db.attr("y",+y2 - adjust + 3);
          });
      });
      
      if(again) {
        setTimeout(relax,20)
      }
  }

  relax();
            
            
  var legendRectSize = 12;
  var legendSpacing = 4;
  var legend = svg.selectAll('.legend')
                  .data(["Downtime", "Config Changes", "Delivered"])
                  .enter()
                  .append('g')
                  .attr('class','legend')
                  .attr('transform', function(d,i) {
                    var height = legendRectSize + legendSpacing;
                    var offset = height * 3 / 2;
                    var horz = -4.5 * legendRectSize;
                    var vert = i * height - offset;
                    return 'translate(' + (horz + outerRadius) + ',' + (vert + outerRadius) + ')';
                  });
  
  legend.append('rect')
        .attr('width', legendRectSize)
        .attr('height', legendRectSize)
        .style('fill', color)
        .style('stroke', color);
  
  legend.append('text')
        .attr('x', legendRectSize + legendSpacing)
        .attr('y', legendRectSize)
        .text(function(d) { return d; });
}