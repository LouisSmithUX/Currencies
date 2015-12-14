var model = {
	init: function() {
		this.data = this.loadJSON();
	},

	loadJSON: function() {
        d3.json("data.json",function(jsonData){ 
        	model.generateData(jsonData);
        	model.ready();
        });
	},

	generateData: function(jsonData) {
		this.rates = []

		for (key in jsonData.rates)
		{
			if (jsonData.rates.hasOwnProperty(key))
			{
				var rateSeq = []
				var date = new Date(jsonData.timestamp*1000);
				var rate = jsonData.rates[key];

				rateSeq.push({'date':date,'rate':rate});

				for (var i=0; i<30; i++) {
					var rand = Math.random();
					var change = -Math.log(1-rand)/1000;
					var sign = 2*Math.round(Math.random())-1;
					date = new Date(date.valueOf());
					date.setDate(date.getDate()+1);
					rate = rate*(1+sign*change);

					rateSeq.push({'date':date,'rate':rate});
				}
				this.rates.push({'name':key,'points':rateSeq});
			}
		}
	},

	ready: function() {
		controller.start();
	}
}

var controller = {
	init: function() {
		model.init();
	},

	start: function() {
		view.init();
	},

	getData: function() {
		return model.rates;
	}
}

var view = {
	init: function() {
		this.chartContainer = d3.select(".chartContainer");

		if (window.matchMedia("(max-width : 480px)").matches) {
			var boxWidth= parseInt(this.chartContainer.style("width"));
		  /* La largeur minimum de l'affichage est 600 px inclus */
		} else {
			var boxWidth= parseInt(this.chartContainer.style("width"))/3;
		  /* L'affichage est inférieur à 600px de large */
		}

        this.margin = {top: 20, right: 20, bottom: 20, left: 20},

        this.width = boxWidth - this.margin.right - this.margin.left;
        this.height = boxWidth*2/3 - this.margin.top - this.margin.bottom;

        var euroRates = controller.getData();
        for (i in euroRates) {
        	var euroRate = euroRates[i];
        	var points = euroRate['points']
        	var name = euroRate['name']

			// Find range of date column
			var date_extent = d3.extent(points, function(d) {
			  return d['date'];
			});

	        this.xScale = d3.time.scale()
	                        .range([0,this.width])
	                        .domain(date_extent);

			// Find range of rates
			var rate_extent = d3.extent(points, function(d) {
			  return d['rate'];
			});
			var rate_extent_margin = Math.abs(rate_extent[0]-rate_extent[1])/3;

	        this.yScale = d3.scale.linear()
	                        .domain([rate_extent[0]-rate_extent_margin,rate_extent[1]+rate_extent_margin])
	                        .range([this.height,0]);

	        this.xAxis  = d3.svg.axis()
	        				.scale(this.xScale)
	        				.orient("bottom")
	   						.tickFormat(d3.time.format("%d"));

			this.yAxis  = d3.svg.axis()
	        				.scale(this.yScale)
	        				.orient("left");

			var line = d3.svg.line()
			    .x(function(d) { return view.xScale(d['date']); })
			    .y(function(d) { return view.yScale(d['rate']); });

			var box = this.chartContainer.append('div')
						.attr("class", 'box');

			svg = box.append("svg")
			    		.attr("width", this.width + this.margin.left + this.margin.right)
			    		.attr("height", this.height + this.margin.top + this.margin.bottom)
						.append("g")
			    		.attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

			svg.append("path")
			  .datum(points)
			  .attr("class", "chartLine")
			  .attr("d", line);

	        // place x axis
	        svg.append("g")
	            .attr("class", "x axis")
	            .attr("transform", "translate(0," + this.height + ")")
	            .call(this.xAxis);

	        // place y axis
			svg.append("g")
	            .attr("class", "y axis")
	            .call(this.yAxis);

	        // place label
	        box.append("text")
	        	.text(name)
	        	.attr({
	        		x: view.width + view.margin.right + view.margin.left,
	        		y: view.margin.top
	        	})
	            .style({
	                'font-size':view.margin.top.toString()+"px",
	                'text-anchor': "end",
	                'fill':'steelblue'
	            });
	    }
	}
}

window.onload = function(){
	controller.init();
}

// setTimeout(function next() {

// 	controller.update();
//     setTimeout(next, 5000);

// }, 5000);