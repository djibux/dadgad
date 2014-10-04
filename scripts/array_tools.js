var ArrayTools = {
	maxIndex: function( elements ) {
		var i = 1;
		var mi = 0;
		while (i < elements.length) {
			if (!(elements[i] < elements[mi]))
				mi = i;
			i += 1;
		}
		return mi;
	},
	sum: function( elements ){
		var sum = 0.0;
		for (var i = 0;i<elements.length;i++){
			sum += elements[i];
		}
		return sum;
	}
}

