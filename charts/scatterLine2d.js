define(["vue", "d3", "./scatterLine2dStyles.css"], function(Vue, d3){	
	
	Vue.component("chart-scatterline2d", {
		props: ["dataset", "approximation"],
		template : `<div><svg class="mainSvg"></svg></div>`,
		mounted : function(){
			this.populateScatterPlot();
			console.log('scatter line mounted!');
		},
		computed : {
			dataKeys : function(){
				return Object.keys(this.dataset[0]);
			},
			parsedData : function(){
				return this.dataset.map(function(d){
					return this.dataKeys.map(function(key){return d[key];});
				}.bind(this));
			}
		},
		watch:{
			dataset : function(){ this.populateScatterPlot(); },
			approximation : function(){
				console.log('approximation changed!');
				console.log(this.approximation);
				this.populateScatterPlot();
			}
		},
		methods : {
			populateScatterPlot: function(){
				if((!this.dataset)){
					return;
				}
				
				const el = this.$el;
				
				//Calculate data range
				const reducer = (last, current) => [
					[Math.min(last[0][0], current[0]), Math.max(last[0][1], current[0])],
					[Math.min(last[1][0], current[1]), Math.max(last[1][1], current[1])]
				];
				
				var xDomain, yDomain;
				[xDomain, yDomain] = this.parsedData.
					reduce(reducer, [[Infinity, -Infinity], [Infinity, -Infinity]]).
					map(function(rawRange){
						const pad = (rawRange[1]-rawRange[0])*.05;
						return [rawRange[0]-pad, rawRange[1]+pad];
					});
					
				//Calculate plot dimensions
				const svg = el.querySelector('.mainSvg');
				const xAxisHeight = 20,
					yAxisWidth = 50;
				
				//Do something 	smarter here, maybe?			
				d3.select(svg).selectAll('g').remove();
					
				var svgBounds= svg.getBoundingClientRect();
					
				var xScale = d3.scaleLinear()
					.domain(xDomain)
					.range([0, svgBounds.width-yAxisWidth]);
					
				var yScale = d3.scaleLinear()
					.domain(yDomain)
					.range([svgBounds.height-xAxisHeight, 0]);
					
				//Set up axes
				var xAxis = d3.select(svg).append('g').classed('axis xAxis', true).call(d3.axisBottom(xScale)),
					yAxis = d3.select(svg).append('g').classed('axis yAxis', true).call(d3.axisLeft(yScale));
					
				xAxis.attr('transform', 'translate('+yAxisWidth+','+(svgBounds.height-xAxisHeight)+')');
				yAxis.attr('transform', 'translate('+yAxisWidth+',0)');
					
				//Add points
				var mainGroup = d3.select('svg').append('g').classed('mainGroup', true)
					.attr('transform', 'translate('+yAxisWidth+',0)');
				
				var pointsGroup = mainGroup.append('g').classed('pointsGroup', true);
				
				pointsGroup.selectAll('.point').data(this.parsedData)
					.enter()
					.append('circle')
					.classed('point', true)
					.attr('cx', function(d){return xScale(d[0]);})
					.attr('cy', function(d){return yScale(d[1]);})
					.attr('r', 4);
				
				//Add line
				if(!this.approximation){
					return;
				}
				
				var nPoints = 129;
				var linePoints = [], point;
				var getPoint = function(index){
					var x = (i/nPoints)*(xScale.domain()[1] - xScale.domain()[0]) + xScale.domain()[0];
					var y = this.approximation.evaluate([x]);
					return [x, y];
				}.bind(this);
				for(var i = 0; i < nPoints; i++){
					linePoints.push(getPoint(i));
				}
				
				var lineGenerator = d3.line()
					.x(function(d){ return xScale(d[0]); })
					.y(function(d){ return yScale(d[1]); });
					
				var lineGroup = mainGroup.append('g').classed('lineGroup', true);
				
				//TODO: Modify this to support multiple lines.
				lineGroup.append('path')
					.attr('fill', 'none')
					.attr('stroke', 'steelblue')
					.attr('stroke-width', 1.5)
					.datum(linePoints)
					.attr('d',  lineGenerator);
				
			}
		}
	});
});