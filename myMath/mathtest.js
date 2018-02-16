//Testing LU decomposition stuff
//import math from 'mathjs';

/*
Our equation is of the form:
B = (X'X)^(-1)X'Y

We want to re-write this without the inversion. Multiplying both sides by (X'X)^(-1), we get
(X'X)B=X'Y,
or:
X*B=A, where X* = X'X and A=X'Y

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

const basis = function(x, c){
	//A shitty basis function with predictable results!
	return Math.pow(2, -Math.abs(x-c));
};

let inputs = [0, 1, 2, 3];
let Y = inputs.map(x => [x]);
let X = inputs.map(x => inputs.map(x2 => basis(x, x2)));

let A = mMult(mTranspose(X), Y);
console.log(A);

let X_star = mMult(mTranspose(X), X);

const luDecomposition = function(X){
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

//Do the actual decomposition and solve....?
let L, U;
[L, U] = luDecomposition(X_star);

console.log(L);
console.log(U);

//Forward substitution
//We write A=LUB, with UB=F.
//Solve A=LF for F.
let F = [];
A.forEach((x,i) => F.push([x-F.slice(0,i).reduce((sum, current, index) => sum+(current*L[i][index]),0)]));

console.log(F);

//Backward substitution
//Now we solve UB=F for B.
let B=[], n=F.length;
for(let i = n-1; i >=0; i--){
	B[i]=[(F[i]-B.slice(i+1,n).reduce((sum, current, index) => sum+(current*U[i][index+i+1]),0))/U[i][i]];
}

console.log(B);

//And make sure everything works...


let test1 = mMult(X_star, B);

console.log(test1);
console.log();