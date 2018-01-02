import {matrix, multiply, inv, transpose} from 'mathjs';

function Approximation(){
	this.options = {
		maxOrder : 8,
		crossTerms : true
	};
	
	this.betaVector = null;
	this.termsVector = [];
};

Approximation.prototype.evaluate = function(x){
	if(this.betaVector === null){
		console.log('least squares approx is not trained!');
		return;
	}
	
	//Representation of terms
	//beta * x-transpose
	var xVector = transpose(matrix([
		this.termsVector.map(function(term){
			return term.reduce(function(val, power, index){
				return val*Math.pow(x[index], power);
			}, 1);
		})
	]));
	
	//For now, this should always be a single value since there's only one
	//output.
	return multiply(transpose(this.betaVector), xVector).toArray()[0][0];
};

Approximation.prototype.train = function(inputs, outputs){
	//Inputs and outputs both represent a vector. For now, only 1-d output vectors are supported.
	
	var nInputs = inputs[0].length
	
	const zeros = function(n){
		var a = [];
		for(var i = 0; i < n; i++){
			a.push(0);
		}
		return a;
	};
	
	//Build terms matrix
	//Terms matrix represents orders of terms. For a 1-d input array, this would look something like: [[0], [1], [2], [3]]
	//This would represent a polynomial of the form y = [1 + x+ x^2 + x^3]*B, where B is the beta vector of constants.
	var getNonzeroIndex = function(term, startIndex){
		//Utility function for getting the index of the first non-zero term in an array.
		//for term = [0,0,1,0,1], should return 2
		//If startIndex is supplied, gets first nonzero term after startIndex
		for(var i = (startIndex || 0); i < term.length; i++){
			if(term[i] !==0){
				return i;
			}
		}
		
		return -1;
	};
	
	var getNextTerm = function(term){
		var newTerm = term.slice(0); //Should work since the term should always be an array of primitives (numbers)
		
		var index = getNonzeroIndex(newTerm);
		
		if(index !== 0){
			newTerm[index] -= 1;
			newTerm[index-1] += 1;
		} else {
			index = getNonzeroIndex(newTerm, 1);
			if(index === -1){
				return;
			}
			var sum = 1;
			newTerm[index] -= 1;
			for(var i = 0; i < index; i++){
				sum += newTerm[i];
				newTerm[i] = 0;
			}
			newTerm[i-1] = sum;
		}
		
		return newTerm;
	}.bind(this);
	
	//Get all terms with order < maxOrder, including cross terms.
	var i = 1, newTerm = zeros(nInputs);
	this.termsVector.push(newTerm);
	for(i; i <= this.options.maxOrder; i++){
		newTerm = zeros(nInputs);
		newTerm[newTerm.length-1] = i;
		do{
			this.termsVector.push(newTerm);
			newTerm = getNextTerm(newTerm);
		} while(newTerm);
	}	
	
	//Build x-matrix
	var xMatrix = matrix(inputs.map(function(input){
		//Get an x-vector for each input
		return this.termsVector.map(function(term){
			//Get an element in the x-vector for each term
			return term.reduce(function(val, power, index){
				return val*Math.pow(input[index], power);
			}, 1);
		}.bind(this));
	}.bind(this)));
	var yMatrix = matrix(outputs);
	
	this.betaVector = multiply(
		inv(multiply(transpose(xMatrix),xMatrix)),
		multiply(transpose(xMatrix), yMatrix)
	);
};
	
export default Approximation;
