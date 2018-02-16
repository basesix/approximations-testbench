import m from '../myMath/luSolver.js';

function Approximation(){
	this.options = {
		shapeConstant : .5,
		shapeConstantSquared : 3
	};
};

Approximation.prototype.rbf = function(x, centroid){
	var r_squared = x.reduce(function(sum, xVal, index){
		return sum += Math.pow(xVal - centroid[index], 2);
	}, 0);
	
	//Gaussian basis function
	return Math.exp(-r_squared*this.options.shapeConstantSquared);
}

Approximation.prototype.evaluate = function(inputs){
	if(this.betaVector === null){
		console.log('rbf interpolation approx is not trained!');
		return;
	}
	
	//Representation of terms
	//beta * x-transpose
	var xVector = m.transpose([
		this.centroids.map(function(centroid){
			return this.rbf(inputs, centroid);
		}.bind(this))
	]);
	
	//For now, this should always be a single value since there's only one
	//output.
	return m.mult(m.transpose(this.betaVector), xVector)[0][0];
};

Approximation.prototype.train = function(inputs, outputs){
	this.centroids = inputs;
	
	//Build x-matrix
	//Each column is a different RBF. We need to compute all of the RBF values for each row
	//of data.
	var xMatrix = this.centroids.map(function(rowCentroid){
		return this.centroids.map(function(centroid){
			return this.rbf(rowCentroid, centroid);
		}.bind(this));
	}.bind(this));
	
	var yMatrix = outputs;
	
	this.betaVector = m.luSolve(xMatrix, yMatrix);
};

export default Approximation;
