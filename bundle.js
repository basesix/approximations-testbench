webpackJsonp([1],{

/***/ 3:
/***/ (function(module, exports, __webpack_require__) {

//document.querySelector('#main').textContent = "Hello Approximations!";

__webpack_require__.e/* require */(0).then(function() { var __WEBPACK_AMD_REQUIRE_ARRAY__ = [__webpack_require__(10), __webpack_require__(11), __webpack_require__(0), __webpack_require__(8), __webpack_require__(9),
		__webpack_require__(12)]; (function(entriesList, scatterLine2d, Vue, datasets, simpleSquares){
	
	var chartData = {
		dataset : null,
		approximation : null
	};
	
	var testApproximationsData = {
		entries : [
			{
				name : "test approx 1"
			},
			{
				name : "test approx 2"
			}
		]
	};
	
	var approximationsVue, chartingVue, datasetsVue;
	
	//Set up approximations list
	approximationsVue = new Vue({
		el : '#approximationsContent',
		//props : ['entries'],
		data : testApproximationsData,
		template : `<div>
			<entries-list
				v-bind:entries="entries"
			></entries-list>
			</div>`
	});
	
	//Set up datasets list
	datasetsVue = new Vue({
		el : '#datasetsContent',
		//props : ['entries'],
		data : {entries: datasets.datasets},
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
				console.log(path);
				
				var onImport = function(dataset){
					//chartData.dataset = dataset;
					chartingVue.dataset = dataset;
					//chartingVue.$set(dataset, 'dataset');
					//console.log(chartingVue);
				};
				
				__webpack_require__(13)("./" + entry.path).then(onImport);
				//require([path], function(data){console.log(data);});
			}
		}
	});
	
	//Set up charting
	chartingVue = new Vue({
		el : '#chartContent',
		//props : ['dataset', 'approximation'],
		data : chartData,
		template : `<div><div>
			<chart-scatterline2d
				v-bind:dataset="dataset"
				v-bind:approximation="approximation"
			></chart-scatterline2d>
			</div></div>`,
		updated : function(){
			console.log('chart updated!');
			console.log(this.dataset);
		},
	});
}.apply(null, __WEBPACK_AMD_REQUIRE_ARRAY__));}).catch(__webpack_require__.oe);

/***/ })

},[3]);