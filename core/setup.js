//document.querySelector('#main').textContent = "Hello Approximations!";

require(["./entriesList.js", "../charts/scatterLine2d.js", "vue", "../data-sets/datasets.json",
	"../approximations/approximations.json", "../data-sets/simple-squares.csv",
		"./main.css"], function(entriesList, scatterLine2d, Vue, datasetsJson, approximationsJson, simpleSquares){
			
	var currentApproximation = null;
	var currentDataset = null;
	var createdApproximations = {};
	var datasets = {};
	
	var approximationsVue, chartingVue, datasetsVue;
	
	var inputKeys = ['x'], outputKeys= ['y'];
	
	const updateApproximations = function(){
		if(currentApproximation === null || currentDataset === null){
			return;
		}
		
		if(typeof currentApproximation.approximations[currentDataset.id] === 'undefined'){
			var newApprox = new currentApproximation.generator();
			var inputs, outputs;
			[inputs, outputs] = [inputKeys, outputKeys].map(function(keys){
				return currentDataset.data.map(function(row){
					return keys.map(function(key){return row[key]; });
				});
			});
			newApprox.train(inputs, outputs);
			currentApproximation.approximations[currentDataset.id] = newApprox;
		}
		
		chartingVue.approximation = currentApproximation.approximations[currentDataset.id];
	};
	
	//Set up approximations list
	approximationsVue = new Vue({
		el : '#approximationsContent',
		data : {entries: approximationsJson.approximations},
		template : `<div>
			<entries-list
				v-bind:entries="entries"
				v-on:entryClicked="entryClicked"
			></entries-list>
			</div>`,
		methods: {
			entryClicked: function(entry){
				//load approx object factory and initialize one if there's a data set.
				var onImport = function(_approximation){
					var approximation = _approximation.default;
					if(typeof createdApproximations[entry.id] ==='undefined'){
						createdApproximations[entry.id] = {generator : approximation, approximations:{}};
					}
					
					currentApproximation = createdApproximations[entry.id];
					updateApproximations();
				};
				
				import('../approximations/' + entry.path).then(onImport);
			}
		}
	});
	
	//Set up datasets list
	datasetsVue = new Vue({
		el : '#datasetsContent',
		data : {entries: datasetsJson.datasets},
		template : `<div>
			<entries-list
				v-bind:entries="entries"
				v-on:entryClicked="entryClicked"
			></entries-list>
			</div>`,
		methods : {
			entryClicked : function(entry){
				//Get dataset and modify the charting data appropriately.
				var basePath = '../data-sets/';
				var dataSetPath = entry.path;
				var path = basePath + dataSetPath;
				
				var onImport = function(dataset){
					if(typeof datasets[entry.id] === 'undefined'){
						datasets[entry.id] = {
							id : entry.id,
							data : dataset
						};
					}
					
					currentDataset = datasets[entry.id];
					
					updateApproximations();
					chartingVue.dataset = dataset;
				};
				
				import('../data-sets/' + entry.path).then(onImport);
			}
		}
	});
	
	//Set up charting
	chartingVue = new Vue({
		el : '#chartContent',
		data : {dataset:null, approximation:null},
		template : `<div>
			<chart-scatterline2d
				v-bind:dataset="dataset"
				v-bind:approximation="approximation"
			></chart-scatterline2d>
			</div>`
	});
});