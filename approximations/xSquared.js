function Approximation(){};

Approximation.prototype.evaluate = function(x){
	x = x[0];
	return (x*x);
};

Approximation.prototype.train = function(dataset){
	//noop
};
	
export default Approximation;