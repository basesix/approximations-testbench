webpackJsonp([0],[
/* 0 */,
/* 1 */,
/* 2 */,
/* 3 */,
/* 4 */,
/* 5 */,
/* 6 */,
/* 7 */,
/* 8 */
/***/ (function(module, exports) {

module.exports = {"datasets":[{"name":"simple squares","path":"simple-squares.csv","id":"simplesquares","inputs":["x"],"outputs":["y"]},{"name":"noisy squares","path":"noisy simple squares.csv","id":"noisysquares","inputs":["x"],"outputs":["y"]},{"name":"noisy sine","path":"noisy sine.csv","id":"noisysine","inputs":["x"],"outputs":["y"]},{"name":"full noisy sine","path":"full noisy sine.csv","id":"fullnoisysine","inputs":["x"],"outputs":["y"]},{"name":"full sine","path":"full sine.csv","id":"fullsine","inputs":["x"],"outputs":["y"]},{"name":"coarse sine","path":"coarse sine.csv","id":"coarsesine","inputs":["x"],"outputs":["y"]}]}

/***/ }),
/* 9 */
/***/ (function(module, exports) {

module.exports = {"approximations":[{"name":"x squared","path":"xSquared.js","id":"xsquared"},{"name":"Least Squares","path":"leastSquares.js","id":"leastsquares"},{"name":"RBF Interpolation","path":"rbfInterpolation.js","id":"rbfint"}]}

/***/ }),
/* 10 */
/***/ (function(module, exports) {

module.exports = [{"x":0,"y":0},{"x":1,"y":1},{"x":2,"y":4},{"x":3,"y":9},{"x":4,"y":16},{"x":5,"y":25},{"x":6,"y":36},{"x":7,"y":49},{"x":8,"y":64},{"x":9,"y":81},{"x":10,"y":100}]

/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(0), __webpack_require__(23)], __WEBPACK_AMD_DEFINE_RESULT__ = function(Vue){
	
	//Vue component for approximations list entries
	Vue.component('list-entry',{
		props : ["entry"],
		template : `<div class="listEntry" v-on:click="entrySelect">{{entry.name}}</div>`,
		data: function(){
			return {selected : false}
		},
		methods : {
			entrySelect : function(e){
				//e is the click event
				if(this.selected === false){
					this.selected = true;
					this.$el.classList.add('selected');
				} else {
					this.selected = false;
					this.$el.classList.remove('selected');
				}
				
				this.$emit('entryClicked', this.entry);
			}
		}
	})
	
	//Vue component for entries list
	Vue.component('entries-list', {
		props : ["entries"],
		template : `<div class="entriesList"><list-entry
			v-for="(entry, index) in entries"
			v-bind:entry="entry"
			v-bind:key="index"
			v-on:entryClicked="entrySelect"
		></list-entry></div>`,
		methods : {
			entrySelect : function(entry){
				this.$emit('entryClicked', entry);
			}
		}
	});
}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));



/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(0), __webpack_require__(2), __webpack_require__(26)], __WEBPACK_AMD_DEFINE_RESULT__ = function(Vue, d3){	
	
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
}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(28);
if(typeof content === 'string') content = [[module.i, content, '']];
// Prepare cssTransformation
var transform;

var options = {"hmr":true}
options.transform = transform
// add the styles to the DOM
var update = __webpack_require__(17)(content, options);
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../node_modules/css-loader/index.js!./main.css", function() {
			var newContent = require("!!../node_modules/css-loader/index.js!./main.css");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

var map = {
	"./approxBase": [
		19,
		5
	],
	"./approxBase.js": [
		19,
		5
	],
	"./approximations": [
		9
	],
	"./approximations.json": [
		9
	],
	"./description.txt": [
		29,
		7
	],
	"./leastSquares": [
		20,
		3
	],
	"./leastSquares.js": [
		20,
		3
	],
	"./rbfInterpolation": [
		21,
		2
	],
	"./rbfInterpolation.js": [
		21,
		2
	],
	"./xSquared": [
		22,
		4
	],
	"./xSquared.js": [
		22,
		4
	]
};
function webpackAsyncContext(req) {
	var ids = map[req];
	if(!ids)
		return Promise.reject(new Error("Cannot find module '" + req + "'."));
	return Promise.all(ids.slice(1).map(__webpack_require__.e)).then(function() {
		return __webpack_require__(ids[0]);
	});
};
webpackAsyncContext.keys = function webpackAsyncContextKeys() {
	return Object.keys(map);
};
webpackAsyncContext.id = 14;
module.exports = webpackAsyncContext;

/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

var map = {
	"./coarse sine.csv": [
		30,
		12
	],
	"./datasets": [
		8
	],
	"./datasets.json": [
		8
	],
	"./description.txt": [
		31,
		6
	],
	"./full noisy sine.csv": [
		32,
		11
	],
	"./full sine.csv": [
		33,
		10
	],
	"./noisy simple squares.csv": [
		34,
		9
	],
	"./noisy sine.csv": [
		35,
		8
	],
	"./simple-squares.csv": [
		10
	]
};
function webpackAsyncContext(req) {
	var ids = map[req];
	if(!ids)
		return Promise.reject(new Error("Cannot find module '" + req + "'."));
	return Promise.all(ids.slice(1).map(__webpack_require__.e)).then(function() {
		return __webpack_require__(ids[0]);
	});
};
webpackAsyncContext.keys = function webpackAsyncContextKeys() {
	return Object.keys(map);
};
webpackAsyncContext.id = 15;
module.exports = webpackAsyncContext;

/***/ }),
/* 16 */
/***/ (function(module, exports) {

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
// css base code, injected by the css-loader
module.exports = function(useSourceMap) {
	var list = [];

	// return the list of modules as css string
	list.toString = function toString() {
		return this.map(function (item) {
			var content = cssWithMappingToString(item, useSourceMap);
			if(item[2]) {
				return "@media " + item[2] + "{" + content + "}";
			} else {
				return content;
			}
		}).join("");
	};

	// import a list of modules into the list
	list.i = function(modules, mediaQuery) {
		if(typeof modules === "string")
			modules = [[null, modules, ""]];
		var alreadyImportedModules = {};
		for(var i = 0; i < this.length; i++) {
			var id = this[i][0];
			if(typeof id === "number")
				alreadyImportedModules[id] = true;
		}
		for(i = 0; i < modules.length; i++) {
			var item = modules[i];
			// skip already imported module
			// this implementation is not 100% perfect for weird media query combinations
			//  when a module is imported multiple times with different media queries.
			//  I hope this will never occur (Hey this way we have smaller bundles)
			if(typeof item[0] !== "number" || !alreadyImportedModules[item[0]]) {
				if(mediaQuery && !item[2]) {
					item[2] = mediaQuery;
				} else if(mediaQuery) {
					item[2] = "(" + item[2] + ") and (" + mediaQuery + ")";
				}
				list.push(item);
			}
		}
	};
	return list;
};

function cssWithMappingToString(item, useSourceMap) {
	var content = item[1] || '';
	var cssMapping = item[3];
	if (!cssMapping) {
		return content;
	}

	if (useSourceMap && typeof btoa === 'function') {
		var sourceMapping = toComment(cssMapping);
		var sourceURLs = cssMapping.sources.map(function (source) {
			return '/*# sourceURL=' + cssMapping.sourceRoot + source + ' */'
		});

		return [content].concat(sourceURLs).concat([sourceMapping]).join('\n');
	}

	return [content].join('\n');
}

// Adapted from convert-source-map (MIT)
function toComment(sourceMap) {
	// eslint-disable-next-line no-undef
	var base64 = btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap))));
	var data = 'sourceMappingURL=data:application/json;charset=utf-8;base64,' + base64;

	return '/*# ' + data + ' */';
}


/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/

var stylesInDom = {};

var	memoize = function (fn) {
	var memo;

	return function () {
		if (typeof memo === "undefined") memo = fn.apply(this, arguments);
		return memo;
	};
};

var isOldIE = memoize(function () {
	// Test for IE <= 9 as proposed by Browserhacks
	// @see http://browserhacks.com/#hack-e71d8692f65334173fee715c222cb805
	// Tests for existence of standard globals is to allow style-loader
	// to operate correctly into non-standard environments
	// @see https://github.com/webpack-contrib/style-loader/issues/177
	return window && document && document.all && !window.atob;
});

var getElement = (function (fn) {
	var memo = {};

	return function(selector) {
		if (typeof memo[selector] === "undefined") {
			var styleTarget = fn.call(this, selector);
			// Special case to return head of iframe instead of iframe itself
			if (styleTarget instanceof window.HTMLIFrameElement) {
				try {
					// This will throw an exception if access to iframe is blocked
					// due to cross-origin restrictions
					styleTarget = styleTarget.contentDocument.head;
				} catch(e) {
					styleTarget = null;
				}
			}
			memo[selector] = styleTarget;
		}
		return memo[selector]
	};
})(function (target) {
	return document.querySelector(target)
});

var singleton = null;
var	singletonCounter = 0;
var	stylesInsertedAtTop = [];

var	fixUrls = __webpack_require__(25);

module.exports = function(list, options) {
	if (typeof DEBUG !== "undefined" && DEBUG) {
		if (typeof document !== "object") throw new Error("The style-loader cannot be used in a non-browser environment");
	}

	options = options || {};

	options.attrs = typeof options.attrs === "object" ? options.attrs : {};

	// Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
	// tags it will allow on a page
	if (!options.singleton) options.singleton = isOldIE();

	// By default, add <style> tags to the <head> element
	if (!options.insertInto) options.insertInto = "head";

	// By default, add <style> tags to the bottom of the target
	if (!options.insertAt) options.insertAt = "bottom";

	var styles = listToStyles(list, options);

	addStylesToDom(styles, options);

	return function update (newList) {
		var mayRemove = [];

		for (var i = 0; i < styles.length; i++) {
			var item = styles[i];
			var domStyle = stylesInDom[item.id];

			domStyle.refs--;
			mayRemove.push(domStyle);
		}

		if(newList) {
			var newStyles = listToStyles(newList, options);
			addStylesToDom(newStyles, options);
		}

		for (var i = 0; i < mayRemove.length; i++) {
			var domStyle = mayRemove[i];

			if(domStyle.refs === 0) {
				for (var j = 0; j < domStyle.parts.length; j++) domStyle.parts[j]();

				delete stylesInDom[domStyle.id];
			}
		}
	};
};

function addStylesToDom (styles, options) {
	for (var i = 0; i < styles.length; i++) {
		var item = styles[i];
		var domStyle = stylesInDom[item.id];

		if(domStyle) {
			domStyle.refs++;

			for(var j = 0; j < domStyle.parts.length; j++) {
				domStyle.parts[j](item.parts[j]);
			}

			for(; j < item.parts.length; j++) {
				domStyle.parts.push(addStyle(item.parts[j], options));
			}
		} else {
			var parts = [];

			for(var j = 0; j < item.parts.length; j++) {
				parts.push(addStyle(item.parts[j], options));
			}

			stylesInDom[item.id] = {id: item.id, refs: 1, parts: parts};
		}
	}
}

function listToStyles (list, options) {
	var styles = [];
	var newStyles = {};

	for (var i = 0; i < list.length; i++) {
		var item = list[i];
		var id = options.base ? item[0] + options.base : item[0];
		var css = item[1];
		var media = item[2];
		var sourceMap = item[3];
		var part = {css: css, media: media, sourceMap: sourceMap};

		if(!newStyles[id]) styles.push(newStyles[id] = {id: id, parts: [part]});
		else newStyles[id].parts.push(part);
	}

	return styles;
}

function insertStyleElement (options, style) {
	var target = getElement(options.insertInto)

	if (!target) {
		throw new Error("Couldn't find a style target. This probably means that the value for the 'insertInto' parameter is invalid.");
	}

	var lastStyleElementInsertedAtTop = stylesInsertedAtTop[stylesInsertedAtTop.length - 1];

	if (options.insertAt === "top") {
		if (!lastStyleElementInsertedAtTop) {
			target.insertBefore(style, target.firstChild);
		} else if (lastStyleElementInsertedAtTop.nextSibling) {
			target.insertBefore(style, lastStyleElementInsertedAtTop.nextSibling);
		} else {
			target.appendChild(style);
		}
		stylesInsertedAtTop.push(style);
	} else if (options.insertAt === "bottom") {
		target.appendChild(style);
	} else if (typeof options.insertAt === "object" && options.insertAt.before) {
		var nextSibling = getElement(options.insertInto + " " + options.insertAt.before);
		target.insertBefore(style, nextSibling);
	} else {
		throw new Error("[Style Loader]\n\n Invalid value for parameter 'insertAt' ('options.insertAt') found.\n Must be 'top', 'bottom', or Object.\n (https://github.com/webpack-contrib/style-loader#insertat)\n");
	}
}

function removeStyleElement (style) {
	if (style.parentNode === null) return false;
	style.parentNode.removeChild(style);

	var idx = stylesInsertedAtTop.indexOf(style);
	if(idx >= 0) {
		stylesInsertedAtTop.splice(idx, 1);
	}
}

function createStyleElement (options) {
	var style = document.createElement("style");

	options.attrs.type = "text/css";

	addAttrs(style, options.attrs);
	insertStyleElement(options, style);

	return style;
}

function createLinkElement (options) {
	var link = document.createElement("link");

	options.attrs.type = "text/css";
	options.attrs.rel = "stylesheet";

	addAttrs(link, options.attrs);
	insertStyleElement(options, link);

	return link;
}

function addAttrs (el, attrs) {
	Object.keys(attrs).forEach(function (key) {
		el.setAttribute(key, attrs[key]);
	});
}

function addStyle (obj, options) {
	var style, update, remove, result;

	// If a transform function was defined, run it on the css
	if (options.transform && obj.css) {
	    result = options.transform(obj.css);

	    if (result) {
	    	// If transform returns a value, use that instead of the original css.
	    	// This allows running runtime transformations on the css.
	    	obj.css = result;
	    } else {
	    	// If the transform function returns a falsy value, don't add this css.
	    	// This allows conditional loading of css
	    	return function() {
	    		// noop
	    	};
	    }
	}

	if (options.singleton) {
		var styleIndex = singletonCounter++;

		style = singleton || (singleton = createStyleElement(options));

		update = applyToSingletonTag.bind(null, style, styleIndex, false);
		remove = applyToSingletonTag.bind(null, style, styleIndex, true);

	} else if (
		obj.sourceMap &&
		typeof URL === "function" &&
		typeof URL.createObjectURL === "function" &&
		typeof URL.revokeObjectURL === "function" &&
		typeof Blob === "function" &&
		typeof btoa === "function"
	) {
		style = createLinkElement(options);
		update = updateLink.bind(null, style, options);
		remove = function () {
			removeStyleElement(style);

			if(style.href) URL.revokeObjectURL(style.href);
		};
	} else {
		style = createStyleElement(options);
		update = applyToTag.bind(null, style);
		remove = function () {
			removeStyleElement(style);
		};
	}

	update(obj);

	return function updateStyle (newObj) {
		if (newObj) {
			if (
				newObj.css === obj.css &&
				newObj.media === obj.media &&
				newObj.sourceMap === obj.sourceMap
			) {
				return;
			}

			update(obj = newObj);
		} else {
			remove();
		}
	};
}

var replaceText = (function () {
	var textStore = [];

	return function (index, replacement) {
		textStore[index] = replacement;

		return textStore.filter(Boolean).join('\n');
	};
})();

function applyToSingletonTag (style, index, remove, obj) {
	var css = remove ? "" : obj.css;

	if (style.styleSheet) {
		style.styleSheet.cssText = replaceText(index, css);
	} else {
		var cssNode = document.createTextNode(css);
		var childNodes = style.childNodes;

		if (childNodes[index]) style.removeChild(childNodes[index]);

		if (childNodes.length) {
			style.insertBefore(cssNode, childNodes[index]);
		} else {
			style.appendChild(cssNode);
		}
	}
}

function applyToTag (style, obj) {
	var css = obj.css;
	var media = obj.media;

	if(media) {
		style.setAttribute("media", media)
	}

	if(style.styleSheet) {
		style.styleSheet.cssText = css;
	} else {
		while(style.firstChild) {
			style.removeChild(style.firstChild);
		}

		style.appendChild(document.createTextNode(css));
	}
}

function updateLink (link, options, obj) {
	var css = obj.css;
	var sourceMap = obj.sourceMap;

	/*
		If convertToAbsoluteUrls isn't defined, but sourcemaps are enabled
		and there is no publicPath defined then lets turn convertToAbsoluteUrls
		on by default.  Otherwise default to the convertToAbsoluteUrls option
		directly
	*/
	var autoFixUrls = options.convertToAbsoluteUrls === undefined && sourceMap;

	if (options.convertToAbsoluteUrls || autoFixUrls) {
		css = fixUrls(css);
	}

	if (sourceMap) {
		// http://stackoverflow.com/a/26603875
		css += "\n/*# sourceMappingURL=data:application/json;base64," + btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))) + " */";
	}

	var blob = new Blob([css], { type: "text/css" });

	var oldSrc = link.href;

	link.href = URL.createObjectURL(blob);

	if(oldSrc) URL.revokeObjectURL(oldSrc);
}


/***/ }),
/* 18 */,
/* 19 */,
/* 20 */,
/* 21 */,
/* 22 */,
/* 23 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(24);
if(typeof content === 'string') content = [[module.i, content, '']];
// Prepare cssTransformation
var transform;

var options = {"hmr":true}
options.transform = transform
// add the styles to the DOM
var update = __webpack_require__(17)(content, options);
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../node_modules/css-loader/index.js!./entriesListStyles.css", function() {
			var newContent = require("!!../node_modules/css-loader/index.js!./entriesListStyles.css");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),
/* 24 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(16)(undefined);
// imports


// module
exports.push([module.i, ".listEntry{\r\n\tbackground: aliceblue;\r\n\tpadding: 3px;\r\n\tfont-size: large;\r\n}\r\n\r\n.listEntry:nth-child(even){\r\n\tbackground: #f8fcff;\r\n}\r\n\r\n.listEntry.selected{\r\n\tbackground: #8ac9ff;\r\n}\r\n\r\n", ""]);

// exports


/***/ }),
/* 25 */
/***/ (function(module, exports) {


/**
 * When source maps are enabled, `style-loader` uses a link element with a data-uri to
 * embed the css on the page. This breaks all relative urls because now they are relative to a
 * bundle instead of the current page.
 *
 * One solution is to only use full urls, but that may be impossible.
 *
 * Instead, this function "fixes" the relative urls to be absolute according to the current page location.
 *
 * A rudimentary test suite is located at `test/fixUrls.js` and can be run via the `npm test` command.
 *
 */

module.exports = function (css) {
  // get current location
  var location = typeof window !== "undefined" && window.location;

  if (!location) {
    throw new Error("fixUrls requires window.location");
  }

	// blank or null?
	if (!css || typeof css !== "string") {
	  return css;
  }

  var baseUrl = location.protocol + "//" + location.host;
  var currentDir = baseUrl + location.pathname.replace(/\/[^\/]*$/, "/");

	// convert each url(...)
	/*
	This regular expression is just a way to recursively match brackets within
	a string.

	 /url\s*\(  = Match on the word "url" with any whitespace after it and then a parens
	   (  = Start a capturing group
	     (?:  = Start a non-capturing group
	         [^)(]  = Match anything that isn't a parentheses
	         |  = OR
	         \(  = Match a start parentheses
	             (?:  = Start another non-capturing groups
	                 [^)(]+  = Match anything that isn't a parentheses
	                 |  = OR
	                 \(  = Match a start parentheses
	                     [^)(]*  = Match anything that isn't a parentheses
	                 \)  = Match a end parentheses
	             )  = End Group
              *\) = Match anything and then a close parens
          )  = Close non-capturing group
          *  = Match anything
       )  = Close capturing group
	 \)  = Match a close parens

	 /gi  = Get all matches, not the first.  Be case insensitive.
	 */
	var fixedCss = css.replace(/url\s*\(((?:[^)(]|\((?:[^)(]+|\([^)(]*\))*\))*)\)/gi, function(fullMatch, origUrl) {
		// strip quotes (if they exist)
		var unquotedOrigUrl = origUrl
			.trim()
			.replace(/^"(.*)"$/, function(o, $1){ return $1; })
			.replace(/^'(.*)'$/, function(o, $1){ return $1; });

		// already a full url? no change
		if (/^(#|data:|http:\/\/|https:\/\/|file:\/\/\/)/i.test(unquotedOrigUrl)) {
		  return fullMatch;
		}

		// convert the url to a full url
		var newUrl;

		if (unquotedOrigUrl.indexOf("//") === 0) {
		  	//TODO: should we add protocol?
			newUrl = unquotedOrigUrl;
		} else if (unquotedOrigUrl.indexOf("/") === 0) {
			// path should be relative to the base url
			newUrl = baseUrl + unquotedOrigUrl; // already starts with '/'
		} else {
			// path should be relative to current directory
			newUrl = currentDir + unquotedOrigUrl.replace(/^\.\//, ""); // Strip leading './'
		}

		// send back the fixed url(...)
		return "url(" + JSON.stringify(newUrl) + ")";
	});

	// send back the fixed css
	return fixedCss;
};


/***/ }),
/* 26 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(27);
if(typeof content === 'string') content = [[module.i, content, '']];
// Prepare cssTransformation
var transform;

var options = {"hmr":true}
options.transform = transform
// add the styles to the DOM
var update = __webpack_require__(17)(content, options);
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../node_modules/css-loader/index.js!./scatterLine2dStyles.css", function() {
			var newContent = require("!!../node_modules/css-loader/index.js!./scatterLine2dStyles.css");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),
/* 27 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(16)(undefined);
// imports


// module
exports.push([module.i, ".mainSvg{\r\n\theight: 500px;\r\n\twidth: 100%;\r\n}\r\n", ""]);

// exports


/***/ }),
/* 28 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(16)(undefined);
// imports


// module
exports.push([module.i, "#main{\r\n\tborder: 1px solid #555;\r\n\tpadding: 2px;\r\n\tdisplay: flex;\r\n\tmin-height: 500px;\r\n}\r\n\r\n.container{\r\n\tborder: 1px solid #555;\r\n\tpadding: 2px;\r\n}\r\n\r\n.title{\r\n\t border-bottom: 1px solid #555;\r\n\t min-height: 30px;\r\n\t text-align: center;\r\n}\r\n\r\n#approximations{\r\n\tflex-basis: 250px;\r\n}\r\n\r\n#chart{\r\n\tflex-grow: 1;\r\n}\r\n\r\n#datasets{\r\n\tflex-basis: 250px;\r\n}\r\n", ""]);

// exports


/***/ })
]);