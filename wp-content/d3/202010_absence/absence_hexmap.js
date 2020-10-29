d3.json("/wp-content/d3/202010_absence/secondary_absence.json", function(error, absenceJSON) {

	d3.json("/wp-content/d3/202010_absence/uk-upper-tier-local-authorities.hexjson", function(error, hexJSON) {

		// Merge data
		for (hex in hexJSON.hexes) {
		    var result = absenceJSON.filter(function(absenceLA) {
		        return absenceLA.la_code === hex;
		    });
		    hexJSON.hexes[hex].attendance_pct = (result[0] !== undefined) ? result[0].attendance_pct / 100.0 : null;		// done to ease formatting of the legend
			if (hexJSON.hexes[hex].r % 2 === 0) {
				hexJSON.hexes[hex].q = hexJSON.hexes[hex].q - 1		// hotfix to make hexes line up as intended
			}
		}

		// Set the size and margins of the svg
		var margin = {top: 60, right: 10, bottom: 40, left: 10},
			width = 700 - margin.left - margin.right,
			height = 780 - margin.top - margin.bottom;

		// Create the svg element
		var svg = d3
			.select("#map1")
			.append("svg")
			.attr("width", width + margin.left + margin.right)
			.attr("height", height + margin.top + margin.bottom)
			.append("g")
			.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

		// Render the hexes
		var hexes = d3.renderHexJSON(hexJSON, width, height);

		// Bind the hexes to g elements of the svg and position them
		var hexmap = svg
			.selectAll("g")
			.data(hexes)
			.enter()
			.append("g")
			.attr("transform", function(hex) {
				return "translate(" + hex.x + "," + hex.y + ")";
			});

		// Set the colour scale
		var quantize = d3.scaleQuantize();		// domain and range are set as part of loading dataset

		quantize
			.domain([0.6,1])
			.range(d3.quantize(d3.interpolate("rgb(230,0,126)", "rgb(45,170,225)"), 4));

		// Draw the polygons around each hexs centre
		hexmap
			.append("polygon")
			.attr("points", function(hex) {return hex.points;})
			.attr("stroke", "white")
			.attr("stroke-width", "2")
			.style("fill", function (d) {
				if (d.attendance_pct == null) {		// flag missing LAs
					return "#535353";
				}
				else {
					return quantize(d.attendance_pct);
				}
			})
			.on("click", function (d) {
				if (d.attendance_pct == null) {
					svg.select(".results-panel")
						.style("fill", "#535353")
					svg.select(".results-panel-text")
						.text(d.name + ": No data is available")
				}
				else {
					svg.select(".results-panel")
						.style("fill", quantize(d.attendance_pct))
					svg.select(".results-panel-text")
						.text(d.name + ": " + d.attendance_pct * 100 + "%")
				}
			});

		// Add a title
		svg.append("text")
			.attr("class", "title header")
			.attr("text-anchor", "middle")
			.attr("x", width / 2)
			.attr("y", -35)
			.text("Secondary school attendance rate by local authority");

		svg.append("text")
			.attr("class", "title")
			.attr("text-anchor", "middle")
			.attr("x", width / 2)
			.attr("y", -15)
			.text("Pupils in state-funded secondary schools in England, 15 October 2020");

		// Add a legend
		svg.append("g")
			.attr("class", "legendQuant")

		var legend = d3.legendColor()
			.shapeWidth(30)
			.orient("vertical")
			.shapePadding(2)
			.scale(quantize)
			.labelFormat(d3.format(".0%"));

		svg.select(".legendQuant")
			.call(legend);

		// Add explanatory notes
		svg.append("text")
			.attr("class", "notes header")
			.attr("y", height + margin.bottom - 80)
			.text("Notes");

		svg.append("text")
			.attr("class", "notes")
			.attr("y", height + margin.bottom - 70)
			.text("Local authorities show in their approximate location.");

		svg.append("text")
			.attr("class", "notes")
			.attr("y", height + margin.bottom - 60)
			.text("No data is available for Worcestershire or the Isles of Scilly. The City of London has no state secondary schools.");

		svg.append("text")
			.attr("class", "notes")
			.attr("y", height + margin.bottom - 50)
			.text("Source: Department for Education response to a parliamentary question.");

		// Add logo
		svg.append('a')
			.attr('href', 'https://ffteducationdatalab.org.uk')
			.append('image')
			.attr('href', '/wp-content/d3/fft_education_datalab_logo_lo.png')
			.attr('x', width + margin.right - 180 - 10)
			.attr('y', height + margin.bottom - 100)
			.attr('height', '45px')
			.attr('width', '180px');

		// Add a panel in which to show results
		var rect = svg
			.append("rect")
			.attr("class", "results-panel")
			.attr("width", 700)
			.attr("height", 40)
			.attr("transform", "translate(" + -10 + "," + 680 + ")")
			.style("fill", "#f3f3f3");

		svg.append("text")
			.attr("class", "results-panel-text")
			.attr("text-anchor", "middle")
			.attr("x", width / 2)
			.attr("y", 705);

	});

});
