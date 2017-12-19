webpack = require('webpack');
const path = require('path');

module.exports = {
	entry: {
		app: './core/setup.js',
		vendor: ['vue', 'd3'],
	},
	output: {
		filename: 'bundle.js'
	},
		resolve: {
		alias: {
			vue: 'vue/dist/vue.js',
			d3: 'd3/build/d3.min.js'
		}
	},
	module : {
		rules: [
			{
				test: /\.csv$/,
				loader: 'csv-loader',
				options: {
					dynamicTyping: true,
					header: true,
					skipEmptyLines: true
				}
			},
			{ test: /\.css$/, loader: 'style-loader!css-loader' },
			{ test: /\.txt$/, loader: 'ignore-loader'}
		]
	},
	plugins: [
		new webpack.optimize.CommonsChunkPlugin({name : 'vendor', filename : 'vendor.bundle.js', minChunks : 'Infinity'})
	]
};