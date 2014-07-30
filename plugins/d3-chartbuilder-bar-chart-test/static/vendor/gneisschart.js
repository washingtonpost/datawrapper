var DEFAULT_WIDTH = 400;
var DEFAULT_HEIGHT = 280;

var BAR_MARGIN_PER_CHAR = 8
var BAR_HEIGHT = 26;

// Default configuration 
var defaultGneissChartConfig = {
	container: '#chartContainer',
    width: DEFAULT_WIDTH,
    height: DEFAULT_HEIGHT,
	title: '',
	colors: [], 
    type: 'line',
	basePadding : {
		top: 0,
		bottom: 40,
		left: 0,
		right: 10
	},
    padding: {
    },
	xAxis: {
		domain: [null, null]
	},
	yAxis: {
        domain: [null, null],
        extremes: [null, null],
        tickValues: null,
        tickInterval: null,
        prefix: '',
        suffix: '', 
        formatter: null,
        precision: null,
        max: null,
        min: null
    },
	series: [
		/*{
			name: 'Apples',
			data: [5.5,10.2,6.1,3.8],
			color: null
		},
		{
			name: 'Oranges',
			data: [23,10,13,7],
			color: null
		}*/
	],
	xAxisRef: []
}

var Gneiss = {
	setup: function(config) {
		/*
			Initializes the chart from a config object
		*/
		var g = config
		this.g = config 

		g.$container = $(g.container);
		g.all = this;

		g.chart = d3.select(g.container).append('svg')
			.attr('id','chart')
            .attr('width','100%') //set width to 100%
            .attr('height','100%') //set height to 100%
		
        g.chart.append('rect')
			.attr('id', 'ground')

        this.resize(g.width, g.height);

        g.chart.append('g')
			.attr('class','axis')
			.attr('id','xAxis')

        g.chart.append('g')
            .attr('class', 'axis')
            .attr('id', 'yAxis')

		g.titleLine = g.chart.append('text')
			.attr('id','titleLine')
			.attr('transform','translate(' + g.basePadding.left + ',25)')
			.text(g.title);

        g.seriesContainer = g.chart.append('g')
            .attr('id','seriesContainer');

        g.chart.append('g')
            .attr('id','baseline');
            
        g.legendItemContainer = g.chart.append('g')
            .attr('id','legendItemContainer');

        g.yAxis.scale = d3.scale.linear();
        g.xAxis.scale = d3.scale.ordinal();
        g.yAxis.axis = d3.svg.axis();
        g.xAxis.axis = d3.svg.axis();
        g.yAxis.line = d3.svg.line();

		this.g = g;

        return this;
	},
	resize: function(width, height) {
		/*
			Adjusts the size dependent stored variables
		*/
		var g = this.g

        g.width = width 
		g.height = height

        g.$container.width(g.width);
        g.$container.height(g.height);

		d3.select('rect#ground')
			.attr('width', g.width)
			.attr('height', g.height)

		this.g = g;
	},
    inlineStyles: function() {
        /*
         * Inline all css styles onto SVG elements so they render correctly for export.
         */
        var chartStyle, selector, cssText;
		
		for (var i = 0; i < document.styleSheets.length; i++) {
			if (document.styleSheets[i].href && document.styleSheets[i].href.indexOf('gneisschart.css') != -1) {
				if (document.styleSheets[i].rules != undefined) {
					chartStyle = document.styleSheets[i].rules;
				}
				else {
					chartStyle = document.styleSheets[i].cssRules;
				}
			}
		}

		if (chartStyle != null && chartStyle != undefined) {
			for (var i = 0; i < chartStyle.length; i++) {
				if(chartStyle[i].type == 1) {
					selector = chartStyle[i].selectorText;
					cssText = chartStyle[i].style.cssText;
					d3.selectAll(selector).attr('style', cssText);
				}
			};
		}
    },
    calculateChartOffset: function() {
        /*
         * Calculate the left offset for a chart based on y-axis label width.
         */
        var g = this.g;

        var width = 0;

        var labels = g.chart.selectAll('#yAxis text')
            .each(function() { width = Math.max(width, this.getComputedTextLength()); });

        g.chartOffset = width + 10;

        this.g = g;
    },
    calculateBarOffset: function() {
        /*
         * Calculate the left offset of the bar chart based on endcap label width.
         */
        var g = this.g;

        var width = 0;

        var labels = g.chart.selectAll('#xAxis text')
            .each(function() { width = Math.max(width, this.getComputedTextLength()); });

        g.barOffset = width + 10;

        this.g = g;
    },
	calculatePadding: function() {
        /*
         * Calculate appropriate border padding.
         */
		var g = this.g;

        g.padding.top = g.basePadding.top + (g.title == '' ? 0 : 40) + g.legendHeight;
        g.padding.bottom = g.basePadding.bottom;
        g.padding.left = g.basePadding.left;
        g.padding.right = g.basePadding.right;
			
		this.g = g
	},
	setLineMakers: function() {
		var g = this.g;

        g.yAxis.line.y(function(d, j) {
            return d || d === 0 ? g.yAxis.scale(d) : null;
        });

        g.yAxis.line.x(function(d, j) {
            return d || d === 0 ? g.xAxis.scale(g.xAxisRef[j]) : null;
        });

		this.g = g;
	},
    exactTicks: function(domain, tickInterval) {
        /*
         * Precise tick generation. Will always include a 0-line
         * if data crosses 0.
         */
        var ticks = [];
        var i = 0;
        
        // Handle all-positive domain        
        if (domain[0] >= 0){
            i = parseInt(domain[0]/tickInterval) * tickInterval;
            while(i < domain[1]){
                ticks.push(i);
                i += tickInterval;
            }

            ticks.push(i);
        } else {
            i = 0;

            // Handle all-negative domain
            if (domain[1] <= 0){
                i = parseInt(domain[1]/tickInterval) * tickInterval;
                while(i > domain[0]){
                    ticks.push(i);
                    i -= tickInterval;
                }

                ticks.push(i);

            // Handle zero-crossing domain
            } else {
                i = 0;
                while (i < domain[1]){
                    ticks.push(i);
                    i += tickInterval;
                }

                ticks.push(i);

                i = -tickInterval;
                while (i > domain[0]){
                    ticks.push(i);
                    i -= tickInterval;
                }

                ticks.push(i);
            }
        }

        return ticks;
    },
    makeTickFormatters: function() {
        /*
         * Generator D3 formatter functions for ticks.
         */
        var g = this.g;

        if (g.yAxis.precision != null && g.yAxis.precision >= 0) {
            var decimalPlaces = g.yAxis.precision;
        } else {
            var decimalPlaces = 0;

            for (i = 0; i < g.yAxis.ticks.length; i++) {
                if ((Math.round(g.yAxis.ticks[i] * 100) / 10) % 1 !== 0) {
                    decimalPlaces = Math.max(decimalPlaces, 2);
                } else if (g.yAxis.ticks[i] % 1 !== 0) {
                    decimalPlaces = Math.max(decimalPlaces, 1);
                }
            }
        }

        if (decimalPlaces > 0) {
            g.yAxis.formatter = d3.format(',.' + decimalPlaces + 'f'); 
        } else {
            g.yAxis.formatter = d3.format(',.0f');
        }

        this.g = g;
    },
    calculateYDomain: function() {
        /*
         * Calculate y-axis domain.
         */
		var g = this.g

		var extremes = [];

		for (var i = g.series.length - 1; i >= 0; i--){
			e = d3.extent(g.series[i].data)
			extremes.push(e[0])
			extremes.push(e[1])
		};

        g.yAxis.extremes = d3.extent(extremes);

        g.yAxis.domain[0] = g.yAxis.extremes[0];
        g.yAxis.domain[1] = g.yAxis.extremes[1];

        if (g.yAxis.min !== null) {
            g.yAxis.domain[0] = g.yAxis.min;
        }
        
        if (g.yAxis.max !== null) {
            g.yAxis.domain[1] = g.yAxis.max;
        }

        // Column & bar charts must cross 0!
        if (g.type == 'column' || g.type == 'bar') {
            if (g.yAxis.domain[0] > 0) {
                g.yAxis.domain[0] = 0;
            } else if (g.yAxis.domain[1] < 0) {
                g.yAxis.domain[1] = 0;
            }
        }

        // Generate ticks
        var tickInterval = g.yAxis.tickInterval;

        if (g.yAxis.tickInterval === null){
            tickInterval = (g.yAxis.domain[1] - g.yAxis.domain[0])/5;
        }
        g.yAxis.ticks = this.exactTicks(g.yAxis.domain, tickInterval);

        // Create formatting functions for new ticks
        this.makeTickFormatters();

        // Ensure domain includes all ticks
        ex = d3.extent(g.yAxis.ticks);
        g.yAxis.domain[0] = Math.min(g.yAxis.domain[0], ex[0]);
        g.yAxis.domain[1] = Math.max(g.yAxis.domain[1], ex[1]);

        g.yAxis.scale.domain(g.yAxis.domain)

        this.g = g;
    },
	calculateYRange: function() {
		/*
         * Calculate y-axis range.
		 */
		var g = this.g

        if (g.type == 'bar') {
            var leftOffset = 5;
            var rightOffset = (g.yAxis.prefix + g.yAxis.extremes[1] + g.yAxis.suffix).length * BAR_MARGIN_PER_CHAR;

            if (g.yAxis.domain[0] < 0) {
                leftOffset += (g.yAxis.prefix + g.yAxis.extremes[0] + g.yAxis.suffix).length * BAR_MARGIN_PER_CHAR;
            }

            this.calculateBarOffset();

            g.yAxis.scale.range([
                g.padding.left + g.barOffset + leftOffset,
                g.width - (rightOffset)
            ]).nice();
        } else {
            g.yAxis.scale.range([
                g.height - g.padding.bottom,
                g.padding.top + 10
            ]).nice();
        }

		this.g = g;
	},
    calculateXDomain: function() {
        /*
         * Calculate x-axis domain.
         */
		var g = this.g

        g.xAxis.scale.domain(g.xAxisRef)

        // Calculate extremes of axis
        g.maxLength = 0;

        for (var i = g.series.length - 1; i >= 0; i--) {
            g.maxLength = Math.max(g.maxLength, g.series[i].data.length)
        };

        this.calculateColumnWidths();
        this.calculateBarChartHeight();

        this.g = g;
    },
	calculateXRange: function() {
		/*
         * Calculate x-axis range.
		 */
        var g = this.g;


		if (g.type == 'column') {
			g.xAxis.scale.rangePoints([
				g.padding.left + g.chartOffset + (g.columnGroupWidth / 2),
				g.width - (g.padding.right + g.columnGroupWidth / 2)
			]);
		} else if (g.type == 'bar') {
            g.xAxis.scale.rangePoints([
                g.padding.top + (g.barGroupHeight / 2),
                g.height - (g.padding.bottom + g.barGroupHeight / 2)
            ]);
        } else {
			g.xAxis.scale.rangePoints([
                g.padding.left + g.chartOffset,
                g.width - (g.padding.right)
            ]);
		};

		this.g = g;
		
	},
	renderYAxis: function() {
		/*
		*
		* Y-Axis Drawing Section
		*
		*/
		var g = this.g;

        function render(axis,tickSize) {
            axis.call(g.yAxis.axis.scale(g.yAxis.scale)
                .orient(g.type == 'bar' ? 'bottom' : 'left')
                .tickSize(tickSize)
                .tickFormat(g.yAxis.formatter)
                .tickValues(g.yAxis.ticks));

            var firstAxisLabel = null;
            var min = Infinity;
            g.chart.selectAll('#yAxis g')
                .each(function(d, j) {
                    var split = d3.select(this)
                        .attr('transform')
                            .split(')')[0]
                            .split(',')

                    var x = parseFloat(split[0].split('(')[1]);
                    var y = parseFloat(split[1]);
                    
                    var text = d3.select(this).select('text')

                    if(g.type == 'bar') {
                        if (x < min){
                            firstAxisLabel = text
                            min = x
                        }
                    } else {
                        if (y < min){
                            firstAxisLabel = text
                            min = y
                        }
                    }

                    if(d == 0) {
                        //if the axisItem represents the zero line
                        //change it's class and make sure there's no decimal
                        d3.select(this).classed('zero', true);
                        text.text('0');
                    }
                })
			            
            // Add the prefix and suffix to the top most label as appropriate
            firstAxisLabel.text(g.yAxis.prefix + firstAxisLabel.text() + g.yAxis.suffix);
        }

        var translate = (g.type == 'bar')
            ? 'translate(0,' + g.padding.top + ')'
            : 'translate(' + g.padding.left + ',0)';
                
        // Render the axis first without ticks
        var axis = g.chart.selectAll('#yAxis')
            .attr('transform', translate);
            
        render(axis, 0);

        // Measure the axis labels
        this.calculateChartOffset();
           
        var size = (g.type == 'bar')
            ? g.height - (g.padding.top + g.padding.bottom)
            : -(g.width - (g.padding.left + g.padding.right + g.chartOffset));
     
        // Rerender the axis with appropriate padding
        render(axis, size);

        var translate = (g.type == 'bar')
            ? 'translate(0,0)'
            : 'translate(' + g.chartOffset + ',0)';
                
        g.chart.selectAll('#yAxis .tick')
            .attr('transform', translate)
	
        if (g.type != 'bar') {
            var width = 0;

            g.chart.selectAll('#yAxis text')
                .each(function() {
                    width = Math.max(width, this.getBBox().width);
                });

            g.chart.selectAll('#yAxis text')
                .attr('text-anchor', 'end')
                .each(function() {
                    this.setAttribute('x', width);
                })
        }

		this.g = g
	},
	renderXAxis: function() {
		var g = this.g;

		g.xAxis.axis.scale(g.xAxis.scale)
			.orient(g.type == 'bar' ? 'left' : 'bottom')
            //.tickSize(g.type == 'bar' ? 0 : 6);
            .tickSize(6);

        var translate = (g.type == 'bar')
            ? 'translate(' + g.padding.left + ',' + (-g.barGroupHeight / 2 + BAR_HEIGHT / 2 - 3) + ')'
            : 'translate(0,' + (g.height - g.padding.bottom) + ')';

		g.chart.selectAll('#xAxis')
			.attr('transform', translate)
			.call(g.xAxis.axis)

        g.chart.selectAll('#xAxis path')
            .attr('transform', 'translate(10,0)');

        g.chart.selectAll('#xAxis text')
            .attr('transform', 'translate(0,3)');

        if (g.type == 'bar') {


            var width = 0;

            g.chart.selectAll('#xAxis text')
                .each(function() {
                    width = Math.max(width, this.parentNode.getBBox().width);
                });

            g.chart.selectAll('#xAxis text')
                .attr('text-anchor', 'end')
                .each(function() {
                    this.setAttribute('x', width);
                })
        } else {
            g.chart.selectAll('#xAxis text')
                .attr('text-anchor', 'middle')
                .each(function() {
                    var labelWidth = this.parentNode.getBBox().width;
                    var halfLabelWidth = labelWidth / 2;
                    var transform = this.parentNode.getAttribute('transform');
                    var x = Number(transform.split('(')[1].split(',')[0]);

                    // Off right edge of chart
                    if (halfLabelWidth + x > g.width) {
                        this.setAttribute('text-anchor', 'end');
                        this.setAttribute('x', (g.width) - x);
                    }
                })
        }
		
		this.g = g;
	},
	calculateColumnWidths: function() {
        /*
         * Calculate column widths.
         */
		var g = this.g

        var chartWidth = g.width - (g.padding.right + g.padding.left);
		var columnWidth = Math.floor((chartWidth / g.maxLength) / g.series.length);

		columnWidth = Math.max(columnWidth, 1);
		columnWidth = Math.min(columnWidth, chartWidth * 0.075);
		
		g.columnWidth = columnWidth;
		g.columnGroupWidth = (columnWidth + 1) * g.series.length;
		g.columnGroupShift = columnWidth + 1;

        this.g = g;
	},
    calculateBarChartHeight: function() {
        /*
         * Calculate bar heights.
         */
		var g = this.g

        g.barGroupShift = BAR_HEIGHT + 1;
		g.barGroupHeight = g.barGroupShift * g.series.length;

        this.g = g;
    },
    rectBase: function(d, domain) {
        /*
         * Calculate where the a column or bar should start.
         */
        // Value greater than 0 and min greater than 0?
        if(d > 0 && domain[0] > 0) {
            // Start at min
            return domain[0];
        // Value less than 0 and min less than 0?
        } else if (d < 0 && domain[1] < 0) {
            // Start at max
            return domain[1];
        }
        
        // Start at 0
        return 0;
    },
	renderSeries: function() {
		/*
		*
		* Series Drawing Section
		*
		*/
		var g = this.g;

        // Clear old elements
        g.seriesContainer.selectAll('g.seriesColumn').remove();
        g.seriesContainer.selectAll('g.seriesBar').remove();
        g.seriesContainer.selectAll('path').remove();
        g.seriesContainer.selectAll('g.seriesScatter').remove();
		
        // Draw new elements
        if (g.type == 'column') {
            this.renderColumns();
        } else if (g.type == 'bar') {
            this.renderBars();
        } else if (g.type == 'line') {
            this.renderLines();
        } else if (g.type == 'scatter') {
            this.renderScatter();
        }
			
		this.g = g;
	},
    renderColumns: function() {
        /*
         * Draw series as columns.
         */
        var g = this.g;

		var columnWidth = this.g.columnWidth;
		var columnGroupShift = this.g.columnGroupShift;
        
        var domain = g.yAxis.scale.domain();
		
        var columnGroups = g.seriesContainer.selectAll('g.seriesColumn')
            .data(g.series)
        
        columnGroups.enter()
            .append('g') 
                .attr('class', 'seriesColumn')
                .attr('fill', function(d,i) { return d.color })
                .attr('transform', function(d,i) {
                    return 'translate(' + (i * columnGroupShift - (columnGroupShift * (g.series.length - 1) / 2)) + ',1)' 
                })
            
        columnGroups.exit().remove()

        var columnRects = columnGroups.selectAll('rect')
            .data(function(d,i) { return d.data })
        
        columnRects.enter()
            .append('rect')
                .attr('width', columnWidth)
                .attr('height', function(d,i) {
                    return Math.abs(g.yAxis.scale(d) - g.yAxis.scale(Gneiss.rectBase(d, domain))) 
                })
                .attr('x', function(d,i) {
                    return g.xAxis.scale(Gneiss.g.xAxisRef[i]) - (columnWidth / 2)
                })
                .attr('y', function(d,i) {
                    if (g.yAxis.scale(d) - g.yAxis.scale(Gneiss.rectBase(d, domain)) >= 0) {
                        return g.yAxis.scale(Gneiss.rectBase(d, domain)) - 1;
                    } else {
                        return g.yAxis.scale(d) - 1;
                    }
                })
    
        columnRects.exit().remove()

        this.g = g;
    },
    renderBars: function() {
        /*
         * Draw series as bars.
         */
        var g = this.g;

        var domain = g.yAxis.scale.domain();

        var barSeries = g.seriesContainer.selectAll('g.seriesBar')
            .data(g.series)
        
        barSeries.enter()
            .append('g') 
                .attr('class', 'seriesBar')
                .attr('fill', function(d,i) { return d.color })
                .attr('transform', function(d, i) {
                    return 'translate(0,' + ((i * g.barGroupShift) - (g.barGroupShift * (g.series.length - 1) / 2)) + ')';
                })
            
        barSeries.exit().remove()
    
        var barGroups = barSeries.selectAll('g')
            .data(function(d, i) { return d.data; })
            .enter()
            .append('g')
            .attr('class', 'bar')
            .attr('transform', function(d, i) {
                var x = null;
                var y = g.xAxis.scale(i) - (BAR_HEIGHT / 2);

                if (d >= 0) {
                    x = g.yAxis.scale(Gneiss.rectBase(d, domain));
                } else {
                    x = g.yAxis.scale(d) - 1;
                }

                return 'translate(' + x + ',' + y + ')';
            });

        var barRects = barGroups.append('rect')
            .attr('width', function(d, i) {
                return Math.abs(g.yAxis.scale(d) - g.yAxis.scale(Gneiss.rectBase(d, domain)));
            })
            .attr('height', BAR_HEIGHT)
            .attr('transform', function(d, i){

                if (d < 0){
                    return 'translate(1,0)';
                } else {
                    return 'translate(0,0)';
                }
            });

        var barLabels = barGroups.append('text')
            .text(function(d, i) { return d != null ? g.yAxis.prefix + d + g.yAxis.suffix : ''; } )
			.attr('text-anchor', function(d, i) { return d <= 0 ? 'end' : 'start' })
            .attr('fill', '#333')
            .attr('x', function(d, i) {
                if (d >= 0) {
                    return this.parentNode.getBBox().width + 5;
                } else {
                    return -5;
                }
            })
            .attr('y', function(d, i) {
                var thisHeight = this.getBBox().height;

                return thisHeight + (BAR_HEIGHT - thisHeight) / 4;
            });

        this.g = g;
    },
    renderLines: function() {
        /*
         * Draw series as a line chart.
         */
        var g = this.g;

        var lineSeries = g.seriesContainer.selectAll('path')
            .data(g.series)
            .attr('stroke',function(d,i){return d.color});

        lineSeries.enter()
            .append('path')
                .attr('d',function(d,j) { return d != null ? g.yAxis.line(d.data).split('L0,0L').join('M0,0L') : ''; })
                .attr('class', 'seriesLine')
                .attr('stroke', function(d,i) { return d.color })
                .attr('stroke-width', 3)
                .attr('stroke-linejoin', 'round')
                .attr('stroke-linecap', 'round')
                .attr('fill', 'none');

        lineSeries.exit().remove()

        this.g = g;
    },
    renderScatter: function() {
        /*
         * Draw series as a scatter plot.
         */
        var g = this.g;

        var scatterGroups = g.seriesContainer.selectAll('g.seriesScatter')
            .data(g.series)
            .attr('fill', function(d,i){return d.color})
        
        scatterGroups.enter()
            .append('g')
            .attr('class','seriesScatter')
            .attr('fill',function(d,i){return d.color})
        
        scatterGroups.exit().remove()
        
        scatterDots = scatterGroups
            .selectAll('circle')
            .data(function(d){return d.data})
            
        scatterDots.enter()
                .append('circle')
                .attr('r',4)
                .attr('stroke','#fff')
                .attr('stroke-width','1')
                .attr('transform',function(d,i){
                    return 'translate('+g.xAxis.scale(Gneiss.g.xAxisRef[i]) + ',' + g.yAxis.scale(d) + ')'
                    })

        this.g = g;
    },
	renderLegend: function() {
        /*
         * Render the legend to the top of the chart.
         */
		var g = this.g;
		
		g.legendItemContainer.selectAll('g.legendItem').remove()
		
        var legendGroups = g.legendItemContainer.selectAll('g')
            .data(g.series);

        var legendTop = (g.basePadding.top + (g.title == '' ? 0 : 40));

        var legItems = 	legendGroups.enter()
            .append('g')
            .attr('class', 'legendItem')
            .attr('transform', function(d,i) {
                return 'translate(' + g.basePadding.left + ',' + legendTop + ')';
            });

        legendGroups.exit().remove()

        var legLabels = legItems.append('text')
            .filter(function() { return g.series.length > 1; })
            .attr('class', 'legendLabel')
            .attr('x', 15)
            .attr('y', 10)
            .text(function(d,i) { return d.name });
        
        if(g.series.length > 1) {
            legItems.append('rect')
                .attr('width', 10)
                .attr('height', 10)
                .attr('x', 0)
                .attr('y', 0)
                .attr('fill', function(d,i) { return d.color })
		
            var legendItemY;

            legendGroups.filter(function(d){ return d != g.series[0] })
                .attr('transform',function(d,i) {
                    var prev = d3.select(legendGroups[0][i])
                    var prevWidth = parseFloat(prev.node().getBBox().width)
                    var prevCoords = g.all.transformCoordOf(prev)

                    var cur = d3.select(this)
                    var curWidth = parseFloat(cur.node().getBBox().width)
                    var curCoords = g.all.transformCoordOf(cur)

                    legendItemY = prevCoords.y;
                    
                    var x = prevCoords.x + prevWidth + 15
                    
                    if(x + curWidth > g.width) {
                        x = g.basePadding.left
                        legendItemY += 15;						
                    }
                    
                    return 'translate(' + x + ',' + legendItemY + ')';
            })

            g.legendHeight = (legendItemY + 20) - legendTop;
		} else { 
            g.legendHeight = 0;
        }
		
		this.g = g
	},
	render: function() {
		/*
			Render the chart
		*/
		var g = this.g

        // Ensure colors are set for all series
        for (var i = 0; i < g.series.length; i++) {
            if (!g.series[i].color) {
                g.series[i].color = g.colors[i];
            }
        };

        this.renderLegend();
        this.calculatePadding();

        this.calculateYDomain();
        this.calculateXDomain();

        if (g.type == 'bar') {
            var chartHeight = g.padding.top + g.padding.bottom + (g.barGroupShift * g.series.length * g.maxLength) + g.barGroupHeight;
            this.resize(DEFAULT_WIDTH, chartHeight);

            this.calculateXRange();
		    this.renderXAxis();
		    this.calculateYRange();
		    this.renderYAxis();
        } else {
            this.resize(DEFAULT_WIDTH, DEFAULT_HEIGHT);

		    this.calculateYRange();
		    this.renderYAxis();
            this.calculateXRange();
		    this.renderXAxis();
        }

        this.setLineMakers();

		this.renderSeries();

        $('#baseline').empty();

        if (g.type === 'bar' || g.type === 'column'){
            var baseline = $('#yAxis .zero').remove();

            $('#baseline')
                .append(baseline)
                .attr('transform', $('#yAxis').attr('transform'));
        }
        this.inlineStyles();
	},
    transformCoordOf: function(elem){
        var trans = elem.attr('transform').split(',')
        return {x:parseFloat(trans[0].split('(')[1]) , y:parseFloat(trans[1].split(')')[0])}
    }
}
