function makePie(element, dataset, w, h) {
  var outerRadius = w / 2;
  var innerRadius = w / 3;
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
      	return color(i);
      })
      .attr("d", arc);

  //Labels
  var labelgroups = svg.selectAll("g.label")
  	  .data(pie(dataset))
  	  .enter()
  	  .append("g")
  	  .attr("class", "label")
  	  .attr("transform", "translate(" + outerRadius + "," + outerRadius + ")");

  labelgroups.append("text")
            .attr("transform", function(d) {
              return "translate(" + arc.centroid(d) + ")";
            })
            .attr("dx", "0.5em")
            .attr("text-anchor", "middle")
            .text(function(d) {
              return d.data.value + " hours";
            });
            
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