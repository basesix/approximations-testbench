define(["vue", "d3", "./scatterLine2dStyles.css"], function(Vue, d3){
	Vue.component("chart-scatterline2d", {
		props: ["dataset", "approximation"],
		template : `<div><svg class="mainSvg"></svg></div>`,
		mounted : function(){
			this.populateScatterPlot();
			console.log('scatter line mounted!');
		},
		updated : function(){
			console.log('scattter line update!');
			console.log(this.dataset);
		},
		methods : {
			populateScatterPlot: function(){
				if((!this.dataset) || (!this.approximation)){
					return;
				}
				
				//Calculate data range
				const reducer = (last, current) => [
					[Math.min(last[0][0], current[0]), Math.max(last[0][1], current[0])],
					[Math.min(last[1][0], current[1]), Math.max(last[1][1], current[1])]
				];
				
				var xDomain, yDomain;
				[xDomain, yDomain] = this.dataset.
					reduce(reducer, [[Infinity, -Infinity], [Infinity, -Infinity]]).
					map(function(rawRange){
						const pad = (rawRange[1]-rawRange[0])*.05;
						return [rawRange[0]-pad, rawRange[1]+pad];
					});
					
				//Calculate plot dimensions
				const svg = this.querySelector('.mainSvg');
				const xAxisHeight = 50,
					yAxisWidth = 100;
					
				var xScale = d3.scale.linear()
					.domain(xRange)
					.range([0, svg.offsetWidth-yAxisWidth]);
					
				var yScale = d3.scale.linear()
					.domain(yRange)
					.range([svg.offsetHeight-xAxisHeight, 0]);
					
				//Set up axes
				var xAxis = d3.select(svg).append('g').classed('axis xAxis', true).call(d3.axisBottom(xScale)),
					yAxis = d3.select(svg).append('g').classed('axis yAxis', true).call(d3.axisLeft(yScale));
					
				//Add points
				var pointsGroup = d3.select('svg').append('g').classed('pointsGroup', true);
				pointsGroup.selectAll('.point').data(pointsData)
					.append('circle')
					.classed('point', true)
					.attr('cx', function(d){return xScale(d[0]);})
					.attr('cy', function(d){return yScale(d[1]);})
					.attr('r', 4);
				
				//Add line
					
				
			}
		}
	});
});