// import * as $ from 'jquery';
var $ = require('jquery');
var d3 = require('d3');
var debounce = require('lodash/debounce');

function isThereAPlotImage(d){
		// Takes a data element. Tests if it is defined. 
		// If it is, then return true. 
		// Otherwise return false.
		 return typeof(d) !== 'undefined';
}

class TribScatterplot{
	constructor(options){
		var app = this;
		app.options = options;
		app.data = options.data;

		// Debounce!!!
		d3.select(window).on('resize',debounce(function(){
			app.drawCharts();
		}, 300));

		app.drawCharts();

		if ($(window).width() > app.options.mobileBreakpoint){
			app.hideShowProfileByIndex(`profile${app.options.indexOfProfileToShowFirst}`);
		}
		

	}

	hideShowProfileByIndex(profile){
		// Takes the ID of a profile and displays it. It also toggles the active state of the plotted point
		d3.select('.profile__plot.active').classed('active', false);
		d3.select(`.profile__plot[data-profile='${profile}']`).classed('active', true);

		d3.selectAll('.profile.active').classed('active', false);
		d3.select('#' + profile).classed('active', true);
	}

	drawBigChart(){

		// This is the DESKTOP/TABLET version. The mobile layout uses a small-multiple technique

		var app = this;

		var chartContainer = d3.select(app.options.desktopContainer);
		
		// Start with a clean slate for debounced redraw
		chartContainer.selectAll('*').remove();
		
		var margin = { top:'15px', right:'15px', bottom:'15px', left:'15px'},
			height = d3.select(app.options.desktopContainer).node().offsetWidth,
			width = height;
		var scatterPlot = chartContainer
			.append('div')
				.classed('scatterPlotInner', true)
				.style('position', 'relative')
				.style('border', '1px solid black')
				.style('height', height + 'px')
				.style('width', width)
				.style('margin', margin.top);


		// This is the fancy ranking
		var x = d3.scaleLinear()
			.domain([0,10])
			.range([0,100]);

		// This is the overall score/result
		var y = d3.scaleLinear()
			.domain([0,10])
			.range([100,0]);

		// Draw the grid lines, both x and y.
		for (var i = 0.25; i < 10; i+=.25){
			
			let isBaseline = i == 5 ? true : false;
			let isInteger = false;
			
			if(!isBaseline && Number.isInteger(i)) {
				isInteger = true;
			}
		
			d3.select('.scatterPlotInner')
				.append('div')
				.classed('rule--x', true)
				.classed('rule--baseline', isBaseline)
				.classed('rule--midweight', isInteger)
				.style('top', `${y(i)}%`)
				.style('left', `0`);

			d3.select('.scatterPlotInner')
				.append('div')
				.classed('rule--y', true)
				.classed('rule--baseline', isBaseline)
				.classed('rule--midweight', isInteger)
				.style('top', `0`)
				.style('left', `${x(i)}%`);
		}

		// Add the four axis labels
		d3.select('.scatterPlotInner')
			.append('small')
			.classed('axis-label', true)
			.style('top', `${x(5)}%`)
			.style('right', '0')
			.html(app.options.xAxisLabels.right);

		d3.select('.scatterPlotInner')
			.append('small')
			.classed('axis-label', true)
			.style('top', `${x(5)}%`)
			.style('left', '0')
			.html(app.options.xAxisLabels.left);
		
		d3.select('.scatterPlotInner')
			.append('small')
			.classed('axis-label', true)
			.classed('axis-label--y', true)
			.style('left', `${y(5)}%`)
			.style('top', '0')
			.html(app.options.yAxisLabels.top);

		d3.select('.scatterPlotInner')
			.append('small')
			.classed('axis-label', true)
			.classed('axis-label--y', true)
			.style('left', `${y(5)}%`)
			.style('bottom', '0')
			.html(app.options.yAxisLabels.bottom);

		scatterPlot.selectAll('.profile__plot')
				.data(app.data)
			.enter()
				.append('div')
				.classed('profile__plot', true)
				.style('left', d => `${x(d.xAxis)}%`)
				.style('top', d => `${y(d.yAxis)}%`)
				.attr('data-profile', d => d.id)
				.attr('data-tooltip', d => d.name)
				.classed('profile__plot', true)
				.classed('profile__plot--with-img', d => isThereAPlotImage(d.imgPlot))
				.style('background-image', d => `url('${d.imgPlot}')`)
				.on('click', function(){
					var profileToShow = d3.select(this).attr('data-profile');
					app.hideShowProfileByIndex(profileToShow);
				});
	}

	drawSmallCharts(){
		var app = this;

		// These are the mobile charts. Each div gets an identical chart 
		// and css is used to make the highlghted item
		var chartContainer = d3.selectAll(app.options.mobileContainer);
		
		// Start with a clean slate
		chartContainer.selectAll('*').remove();
		
		// TODO -- Make this a dynamic detection
		var outerHeight = 150,
			outerWidth = 150,
			labelPadding = 20,
			innerHeight = outerHeight - labelPadding,
			innerWidth = outerWidth - labelPadding;

		var scatterPlot = chartContainer
			.append('div')
			.classed('scatterPlotInner', true)
			.style('position', 'relative')
			// .style('border', '1px solid black')
			.style('height', innerHeight + 'px')
			.style('width', innerWidth + 'px')
			.style('margin', `${labelPadding}px 0 0 ${labelPadding}px`);


		// This is the horiz ranking
		var x = d3.scaleLinear()
			.domain([0,10])
			.range([0,100]);

		// This is the vert ranking
		var y = d3.scaleLinear()
			.domain([0,10])
			.range([100,0]);


		// Add bold baselines (intersecting at 5,5)
		d3.selectAll('.scatterPlotInner')
			.append('div')
			.classed('rule--x', true)
			.classed('rule--baseline', true)
			.style('top', `${y(5)}%`)
			.style('left', `0`);

		d3.selectAll('.scatterPlotInner')
			.append('div')
			.classed('rule--y', true)
			.classed('rule--baseline', true)
			.style('top', `0`)
			.style('left', `${x(5)}%`);
		
		// Add the axis labels
		// TODO: Fine tune placement and how I use JS + SASS to do the positioning
		d3.selectAll(app.options.mobileContainer)
			.append('small')
			.classed('axis-label', true)
			.style('top', `0`)
			.style('width', `${innerWidth}px`)
			.style('margin', `0 0 0 ${labelPadding}px`)
			// .style('right', '0')
			.html(`&#9664; ${app.options.xAxisLabels.mobile} &#9654;`);
		
		d3.selectAll(app.options.mobileContainer)
			.append('small')
			.classed('axis-label', true)
			.classed('axis-label--y', true)
			.style('left', `${labelPadding/2}px`)
			.style('top', '50%')
			.style('left',`-55px`)
			.style('width', `${innerWidth}px`)
			.style('margin', `0 0 0 0`)
			.style('transform', `rotate(-90deg)`)
			.html(`&#9664; ${app.options.yAxisLabels.mobile} &#9654;`);

		// Add all the plot dots. CSS will be used to add the highlight
		scatterPlot.selectAll('.profile__plot')
				.data(app.data)
			.enter()
				.append('div')
				.classed('profile__plot', true)
				.attr('data-profile', d => {
					return d.id;
				})
				.style('position', 'absolute')
				.style('left', d => `${x(d.xAxis)}%`)
				.style('top', d => `${y(d.yAxis)}%`)
	}

	drawCharts(){
		var app = this;
		// This is the function being debounced
		if ($(window).width() > app.options.mobileBreakpoint){
			app.drawBigChart();
		} else {
			app.drawSmallCharts();
		}
	}
}


module.exports = TribScatterplot;