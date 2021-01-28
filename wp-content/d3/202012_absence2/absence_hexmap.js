var hexJSON,
	phaseMap1 = "Secondary",
	dateMap1 = 20201210,
	phaseMap2 = "Secondary"

WebFontConfig = {
	custom: {
    	families: ['Avenir Next W01']
	},
	active: function() {
		loadHexJSON(drawMap1, drawMap2, "attendance_pct_20201210", "secondary_absence.json", "10 December 2020")		// XXX
	},
};

(function(d) {
	var wf = document.createElement('script'), s = d.scripts[0];
	wf.src = 'https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js';
	wf.async = true;
	s.parentNode.insertBefore(wf, s);
})(document);

function loadHexJSON(callback1, callback2, measureKey, dataFile, dateString) {
	d3.json("/wp-content/d3/202012_absence2/uk-upper-tier-local-authorities.hexjson", function(error, data) {
		hexJSON = data
		for (hex in hexJSON.hexes) {
			if (hexJSON.hexes[hex].r % 2 === 0) {
				hexJSON.hexes[hex].q = hexJSON.hexes[hex].q - 1		// fix to treat odd-r hexJSON as even-r and vice versa - handling a quirk of d3-hexjson
			}
		}
		callback1(measureKey, dataFile, dateString, hexJSON)
		callback2(dataFile, hexJSON)
	});
}

function drawMap1(measureKey, dataFile, dateString, hexdata) {
	d3.json("/wp-content/d3/202012_absence2/" + dataFile, function(error, absenceJSON) {

		// Merge data
		for (hex in hexdata.hexes) {
		    var map1Data = absenceJSON.filter(function(absenceLA) {
		        return absenceLA.la_code === hex;
		    });
			if (map1Data[0] == undefined ) {		// LA not in the absence data
				hexdata.hexes[hex][measureKey] = null
			}
			else if (map1Data[0][measureKey] == null) {		// missing value
				hexdata.hexes[hex][measureKey] = null
			}
			else {
				hexdata.hexes[hex][measureKey] = map1Data[0][measureKey] / 100.0		// done to ease formatting of the legend
			}
		}

		// Set the size and margins of the svg
		var margin = {top: 60, right: 10, bottom: 40, left: 10},
			width = 700 - margin.left - margin.right,
			height = 780 - margin.top - margin.bottom;

		d3.selectAll("#map1 > *").remove();

		// Create the svg element
		var svg = d3
			.select("#map1")
			.append("svg")
			.attr("width", width + margin.left + margin.right)
			.attr("height", height + margin.top + margin.bottom)
			.append("g")
			.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

		// Render the hexes
		var hexes = d3.renderHexJSON(hexdata, width, height);

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
			.domain([0.5,1])
			.range(d3.quantize(d3.interpolate("rgb(230,0,126)", "rgb(45,170,225)"), 5));

		// Draw the polygons around each hex's centre
		hexmap
			.append("polygon")
			.attr("points", function(hex) {return hex.points;})
			.attr("stroke", "white")
			.attr("stroke-width", "2")
			.style("fill", function (d) {
				if (d[measureKey] == null) {		// flag missing LAs
					return "#535353";
				}
				else {
					return quantize(d[measureKey]);
				}
			})
			.on("click", function (d) {
				if (d[measureKey] == null) {
					svg.select(".results-panel")
						.style("fill", "#535353")
					svg.select(".results-panel-text")
						.text(d.name + ": No data available")
				}
				else {
					svg.select(".results-panel")
						.style("fill", quantize(d[measureKey]))
					svg.select(".results-panel-text")
						.text(d.name + ": " + Math.round(d[measureKey] * 100) + "%")
				}
			});

		// Add a title
		svg.append("text")
			.attr("class", "title header")
			.attr("text-anchor", "middle")
			.attr("x", width / 2)
			.attr("y", -35)
			.text(phaseMap1 + " school attendance rate by local authority");

		svg.append("text")
			.attr("class", "title")
			.attr("text-anchor", "middle")
			.attr("x", width / 2)
			.attr("y", -15)
			.text("Pupils in state-funded " + phaseMap1.toLowerCase() + " schools in England, " + dateString);

		// Add a legend
		svg.append("g")
			.attr("class", "legendQuant")

		var legend = d3.legendColor()
			.shapeWidth(30)
			.orient("vertical")
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
			.text(function(d) {
				if (phaseMap1 == "Primary") {
					return "No data is available for the Isles of Scilly or the City of London.";
				}
				else if (phaseMap1 == "Secondary") {
					return "No data is available for the Isles of Scilly. The City of London has no state secondary schools.";
				}
			});

		svg.append("text")
			.attr("class", "notes")
			.attr("y", height + margin.bottom - 50)
			.text("Source: Department for Education school attendance during coronavirus statistics.");

		// Add logo
		svg.append("a")
			.attr("href", "https://ffteducationdatalab.org.uk")
			.append("image")
			.attr("href", "/wp-content/d3/fft_education_datalab_logo_lo.png")
			.attr("x", width + margin.right - 180 - 10)
			.attr("y", height + margin.bottom - 100)
			.attr("height", "45px")
			.attr("width", "180px");

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
};

function updateMap1(phase, date) {
	if (phase == "Primary") {
		dataFileMap1 = "primary_absence.json"
	}
	else if (phase == "Secondary") {
		dataFileMap1 = "secondary_absence.json"
	}
	if (date == 20201015) {
		measureKeyMap1 = "attendance_pct_20201015"
		dateStringMap1 = "15 October 2020"
	}
	else if (date == 20201210) {
		measureKeyMap1 = "attendance_pct_20201210"
		dateStringMap1 = "10 December 2020"
	}
	drawMap1(measureKeyMap1, dataFileMap1, dateStringMap1, hexJSON)
}

function updateMap1PhaseSelector(value) {
	phaseMap1 = value
	updateMap1(phaseMap1, dateMap1)
}

function updateMap1DateSelector(value) {
	dateMap1 = value
	updateMap1(phaseMap1, dateMap1)
}

function drawMap2(dataFile, hexdata) {
	d3.json("/wp-content/d3/202012_absence2/" + dataFile, function(error, absenceJSON) {

		// Merge data
		for (hex in hexdata.hexes) {
		    var map2Data = absenceJSON.filter(function(absenceLA) {
		        return absenceLA.la_code === hex;
		    });
			if (map2Data[0] == undefined ) {		// LA not in the absence data
				hexdata.hexes[hex]["attendance_pct_20201015"] = null
				hexdata.hexes[hex]["attendance_pct_20201210"] = null
				hexdata.hexes[hex]["attendance_change_pp"] = null
			}
			else if (map2Data[0]["attendance_change_pp"] == null) {		// missing value
				hexdata.hexes[hex]["attendance_pct_20201015"] = null
				hexdata.hexes[hex]["attendance_pct_20201210"] = null
				hexdata.hexes[hex]["attendance_change_pp"] = null
			}
			else {
			    hexdata.hexes[hex]["attendance_pct_20201015"] = (map2Data[0] !== undefined) ? map2Data[0].attendance_pct_20201015 / 100.0 : null;		// done to ease formatting of the legend
			    hexdata.hexes[hex]["attendance_pct_20201210"] = (map2Data[0] !== undefined) ? map2Data[0].attendance_pct_20201210 / 100.0 : null;		// done to ease formatting of the legend
			    hexdata.hexes[hex]["attendance_change_pp"] = (map2Data[0] !== undefined) ? map2Data[0].attendance_change_pp : null;
			}
		}

		// Set the size and margins of the svg
		var margin = {top: 60, right: 10, bottom: 40, left: 10},
			width = 700 - margin.left - margin.right,
			height = 780 - margin.top - margin.bottom;

		d3.selectAll("#map2 > *").remove();

		// Create the svg element
		var svg = d3
			.select("#map2")
			.append("svg")
			.attr("width", width + margin.left + margin.right)
			.attr("height", height + margin.top + margin.bottom)
			.append("g")
			.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

		// Render the hexes
		var hexes = d3.renderHexJSON(hexdata, width, height);

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
			.domain([-50,50])
			.range(["#c11f96", "#C372AD", "#C4C4C4", "#ADC372", "#96c11f"], 5);		//  complementary colour to FFT green + interpolated colour + + 0.5(FFT mid grey + FFT light grey) + interpolated colour + FFT green

		// Draw the polygons around each hexs centre
		hexmap
			.append("polygon")
			.attr("points", function(hex) {return hex.points;})
			.attr("stroke", "white")
			.attr("stroke-width", "2")
			.style("fill", function (d) {
				if (d.attendance_change_pp == null) {		// flag missing LAs
					return "#535353";
				}
				else {
					return quantize(d.attendance_change_pp);
				}
			})
			.on("click", function (d) {
				if (d.attendance_change_pp == null) {
					svg.select(".results-panel")
						.style("fill", "#535353")
					svg.select(".results-panel-text")
						.text(d.name + ": Data is missing for one or both dates")
				}
				else {
					svg.select(".results-panel")
						.style("fill", quantize(d.attendance_change_pp))
					svg.select(".results-panel-text")
						.text(d.name + ": " + d.attendance_change_pp + " percentage points (" + Math.round(d.attendance_pct_20201015 * 100) + "%, " + Math.round(d.attendance_pct_20201210 * 100) + "%)")
				}
			});

		// Add a title
		svg.append("text")
			.attr("class", "title header")
			.attr("text-anchor", "middle")
			.attr("x", width / 2)
			.attr("y", -35)
			.text("Change in " + phaseMap2.toLowerCase() + " school attendance rate, 15 Oct-10 Dec 2020");

		svg.append("text")
			.attr("class", "title")
			.attr("text-anchor", "middle")
			.attr("x", width / 2)
			.attr("y", -15)
			.text("Pupils in state-funded " + phaseMap2.toLowerCase() + " schools in England");

		// Add a legend
		svg.append("g")
			.attr("class", "legendQuant")

		var legend = d3.legendColor()
			.shapeWidth(30)
			.orient("vertical")
			.scale(quantize)
			.labelFormat(d3.format("+1"));

		svg.select(".legendQuant")
			.call(legend);

		svg.select(".label")
			.text(function(d) {
				return d + " percentage points";
			});

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
			.text(function(d) {
				if (phaseMap2 == "Primary") {
					return "No data is available for the Isles of Scilly or the City of London.";
				}
				else if (phaseMap2 == "Secondary") {
					return "No data is available for the Isles of Scilly. The City of London has no state secondary schools.";
				}
			});

		svg.append("text")
			.attr("class", "notes")
			.attr("y", height + margin.bottom - 50)
			.text("Source: Department for Education school attendance during coronavirus statistics.");

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
};

function updateMap2(phase) {
	if (phase == "Primary") {
		dataFileMap2 = "primary_absence.json"
	}
	else if (phase == "Secondary") {
		dataFileMap2 = "secondary_absence.json"
	}
	drawMap2(dataFileMap2, hexJSON)
}

function updateMap2PhaseSelector(value) {
	phaseMap2 = value
	updateMap2(phaseMap2)
}
