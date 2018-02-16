webpackJsonp([3],{

/***/ 18:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/*
A linear equation solver that uses LU decomposition instead of inversion.
-------------------------------------------------------------------------


Our equation is of the form:
B = (X'X)^(-1)X'Y

We want to re-write this without the inversion. Multiplying both sides by (X'X)^(-1), we get
(X'X)B=X'Y,
or:
X*B=A, where X* = X'X and A=X'Y

The process of LU decomposition will convert the matrix X* into a lower and 
upper diagonal matrix (L and U).

We can then solve the equation A=LUB, first with a forward substitution of the form
A=LF, solving for F easily, and then with a backward substitution of the form F=UB.
*/

//Some math functions for working with arrays of arrays as matrixes.
const zeros = function(size){
	let z = [];
	z.length = size;
	z.fill(0);
	return z;
};

const mSubtract = function(m1, m2){
	if(m1[0] instanceof Array){
		return m1.map((x,i) => mSubtract(x,m2[i]));
	} else {
		return m1.map((x,i) => x-m2[i]);
	}
};

const mAdd = function(m1, m2){
	if(m1[0] instanceof Array){
		return m1.map((x,i) => mAdd(x,m2[i]));
	} else {
		return m1.map((x,i) => x+m2[i]);
	}
};

const mMult = function(m1, m2){
	if(m2 instanceof Array){
		return m1.map((v1,i) => 
			m2[0].map((x,j) => m2.reduce(
				(last,current,index) => last + v1[index]*m2[index][j], 0
			))
		);
	} else {
		if(m1[0] instanceof Array){
			return m1.map(x => mMult(x, m2));
		} else {
			return m1.map(x => x*m2);
		}
	}
};

const mTranspose = function(m1){
	return m1[0].map((x,i) => m1.map((x,j) => m1[j][i]));
};

const luDecompose = function(X){
	if(X[0].length !== X.length){
		//X should be a square array of arrays
		console.log(X);
		console.error('X is not square!');
	}
	
	let L = [], U = [];
	let i,j,nu,nl, c;
	
	for(i = 0; i < X.length; i++){
		nu = X[i];
		nl = zeros(nu.length);
		
		for(j = 0; j < U.length; j++){
			c = nu[j]/U[j][j];
			nu = mSubtract(nu, mMult(U[j], c));
			nl[j] = c;
		}
		nl[i] = 1;
		L.push(nl);
		U.push(nu);
	}
	
	return [L, U];
};

const luSolve = function(X, Y){
	//Given the input and output matrices, solve the pseudoinverse for the
	//vector of constants using LU decomposition.

	let A = mMult(mTranspose(X), Y);
	console.log(A);

	let X_star = mMult(mTranspose(X), X);

	//Do the actual decomposition and solve for B
	let L, U;
	[L, U] = luDecompose(X_star);

	//Forward substitution
	//We write A=LUB, with UB=F.
	//Solve A=LF for F.
	let F = [];
	A.forEach((x,i) => F.push([x-F.slice(0,i).reduce((sum, current, index) => sum+(current*L[i][index]),0)]));

	//Backward substitution
	//Now we solve UB=F for B.
	let B=[], n=F.length;
	for(let i = n-1; i >=0; i--){
		B[i]=[(F[i]-B.slice(i+1,n).reduce((sum, current, index) => sum+(current*U[i][index+i+1]),0))/U[i][i]];
	}
	
	return B;
}

const defaultExports = {
	mult : mMult,
	add : mAdd,
	subtract : mSubtract,
	transpose : mTranspose,
	zeros : zeros,
	luDecompose : luDecompose,
	luSolve : luSolve
};

/* harmony default export */ __webpack_exports__["a"] = (defaultExports);

/***/ }),

/***/ 20:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__myMath_luSolver_js__ = __webpack_require__(18);
//import {matrix, multiply, inv, transpose} from 'mathjs';


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
	var xVector = __WEBPACK_IMPORTED_MODULE_0__myMath_luSolver_js__["a" /* default */].transpose([
		this.termsVector.map(function(term){
			return term.reduce(function(val, power, index){
				return val*Math.pow(x[index], power);
			}, 1);
		})
	]);
	
	//For now, this should always be a single value since there's only one
	//output.
	return __WEBPACK_IMPORTED_MODULE_0__myMath_luSolver_js__["a" /* default */].mult(__WEBPACK_IMPORTED_MODULE_0__myMath_luSolver_js__["a" /* default */].transpose(this.betaVector), xVector)[0][0];
};

Approximation.prototype.train = function(inputs, outputs){
	//Inputs and outputs both represent a vector. For now, only 1-d output vectors are supported.
	
	var nInputs = inputs[0].length
	
	/*const zeros = function(n){
		var a = [];
		for(var i = 0; i < n; i++){
			a.push(0);
		}
		return a;
	};*/
	
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
	var i = 1, newTerm = __WEBPACK_IMPORTED_MODULE_0__myMath_luSolver_js__["a" /* default */].zeros(nInputs);
	this.termsVector.push(newTerm);
	for(i; i <= this.options.maxOrder; i++){
		newTerm = __WEBPACK_IMPORTED_MODULE_0__myMath_luSolver_js__["a" /* default */].zeros(nInputs);
		newTerm[newTerm.length-1] = i;
		do{
			this.termsVector.push(newTerm);
			newTerm = getNextTerm(newTerm);
		} while(newTerm);
	}	
	
	//Build x-matrix
	var xMatrix = inputs.map(function(input){
		//Get an x-vector for each input
		return this.termsVector.map(function(term){
			//Get an element in the x-vector for each term
			return term.reduce(function(val, power, index){
				return val*Math.pow(input[index], power);
			}, 1);
		}.bind(this));
	}.bind(this));
	var yMatrix = outputs;
	
	this.betaVector = __WEBPACK_IMPORTED_MODULE_0__myMath_luSolver_js__["a" /* default */].luSolve(xMatrix, yMatrix);
	
	/*multiply(
		inv(multiply(transpose(xMatrix),xMatrix)),
		multiply(transpose(xMatrix), yMatrix)
	);*/
};
	
/* harmony default export */ __webpack_exports__["default"] = (Approximation);


/***/ })

});