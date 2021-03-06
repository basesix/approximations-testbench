webpackJsonp([2],{

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

/***/ 21:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__myMath_luSolver_js__ = __webpack_require__(18);


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
	var xVector = __WEBPACK_IMPORTED_MODULE_0__myMath_luSolver_js__["a" /* default */].transpose([
		this.centroids.map(function(centroid){
			return this.rbf(inputs, centroid);
		}.bind(this))
	]);
	
	//For now, this should always be a single value since there's only one
	//output.
	return __WEBPACK_IMPORTED_MODULE_0__myMath_luSolver_js__["a" /* default */].mult(__WEBPACK_IMPORTED_MODULE_0__myMath_luSolver_js__["a" /* default */].transpose(this.betaVector), xVector)[0][0];
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
	
	this.betaVector = __WEBPACK_IMPORTED_MODULE_0__myMath_luSolver_js__["a" /* default */].luSolve(xMatrix, yMatrix);
};

/* harmony default export */ __webpack_exports__["default"] = (Approximation);


/***/ })

});