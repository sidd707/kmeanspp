var kmeanspp = new function() {

	var k = null; // Number of clusters
	var data_in = null; // Input
	var probs = null; // For each data point, probability of being chosen as a mean
	var groups = null; // Output
	var means = null; // Current means
	var dist_func = null; // Callback to calculate distance between two points
	var mean_func = null; // Callback to calculate mean of a set of points
	var comp_func = null; // Callback to determine if two points are equal

	// Fill array with specified value
	function fill(array_, val_) {
		for(var i = 0; i < array_.length; i++) {
			array_[i] = val_;
		}
	}

	// Return a random element from an array with different probabilities
	function choose(array_, probs_) {
		var x = Math.random();
		for(var i = 0; i < array_.length; i++) {
			x -= probs_[i];
			if(x <= 0) return array_[i];
		}
		return null; // All zero probabilities.
	};

	// Pick k means from the input to seed the algorithm
	function seed() {
		var p = 1 / data_in.length; // Start with equal distribution of probability.
		fill(probs, p);
		means[0] = choose(data_in, probs);
		for(var i = 1; i < k; i++) {
			dists = data_in.map(function(obj) { // For each point, find the square of the distance to the closest mean
				var closest_i = 0;
				var closest_dist = dist_func(obj, means[0]);
				for(var i = 1; i < means.length; i++) {
					var dist = dist_func(obj, means[i]);
					if(dist < closest_dist) {
						closest_i = i;
						closest_dist = dist;
					}
					if(dist == 0) break;
				}
				return closest_dist * closest_dist;
			});
			var sum = dists.reduce(function(prev, cur) {
				return prev + cur;
			}, 0);
			probs = dists.map(function(d) { // Points close to a mean are assigned a lower probability
				return d / sum;
			});
			means[i] = choose(data_in, probs); // Choose next mean
		}
		return means;
	}

	// Called before run()
	this.init = function(k_, data_in_, dist_func_, mean_func_, comp_func_) {
		k = k_;
		data_in = data_in_;
		probs = new Array(data_in.length);
		groups = new Array(k);
		means = new Array(k);
		dist_func = dist_func_;
		mean_func = mean_func_;
		comp_func = comp_func_;
	};

	// Run the algorithm
	this.run = function() {
		seed();
		var converged = false;
		while(!converged) { // Repeat until means no longer change
			// Populate groups
			for(var j = 0; j < k; j++) {
				groups[j] = [];
			}
			for(var i = 0; i < data_in.length; i++) {
				var closest_j = 0;
				var closest_dist = dist_func(data_in[i], means[0]);
				for(var j = 1; j < k; j++) {
					var dist = dist_func(data_in[i], means[j]);
					if(dist < closest_dist) {
						closest_j = j;
						closest_dist = dist;
					}
					if(dist == 0) break;
				}
				groups[closest_j].push(data_in[i]);
			}

			// Adjust means
			var prev_means = means.slice();
			converged = true;
			for(var i = 0; i < k; i++) {
				if(groups[i].length < 1) continue;
				means[i] = mean_func(groups[i]);
				if(!comp_func(means[i], prev_means[i])) converged = false;
			}
		}
		return groups;
	};

}
