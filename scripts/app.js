for ( var button of document.querySelectorAll("button") ) {
	button.addEventListener("click", function() {
		document.querySelector("h1").innerHTML = this.value + " tuner";
		tuning = new Tuning(this.value);
	})
}

// TODO : needs refactoring, should fire click event ?
var tuning = new Tuning("standard");
document.querySelector("h1").innerHTML = "standard tuner";

var capture = new Capture();
