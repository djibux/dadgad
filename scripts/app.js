var App = function() {
	this.tuning = new Tuning("standard"); 
	this.capture = new Capture(this.tuning);
	this.setupTuningButtons();
	this.setupNoteDetection();
}

App.prototype = {
	setupTuningButtons: function() {
		for ( var button of document.querySelectorAll("button") ) {
			button.addEventListener("click", function(e) {
				document.querySelector("h1").innerHTML = e.target.value + " tuner";
				this.tuning = new Tuning(e.target.value);
			}.bind(this))
		}
		var chooseStandardTuning = new CustomEvent("click");
		document.querySelector("button").dispatchEvent(chooseStandardTuning);
	},

	setupNoteDetection: function() {
		window.addEventListener("soundon", this._drawNote.bind(this));
		window.addEventListener("soundoff", this._drawNote.bind(this));
	},

	_drawNote: function(recievedEvent) {
		var detectedFrequencyTxt = document.getElementById('detected-frequency');
		var gapTxt = document.getElementById('gap');
		var closestNoteTxt = document.getElementById('closest-note');
		var lowNoteIndicatorTxt = document.getElementById('low-note-indicator');
		var highNoteIndicatorTxt = document.getElementById('high-note-indicator');

		var detectedFrequency = recievedEvent.detail;

		if ( detectedFrequency ) {
			detectedNote = this.tuning.findClosestNote(detectedFrequency);
			detectedFrequencyTxt.innerHTML = detectedFrequency.toFixed(1)+" Hz";
			gapTxt.innerHTML = detectedNote.frequencyGap.toFixed(2)+ "Hz";
			closestNoteTxt.innerHTML = detectedNote.note.noteName;
			if ( Math.abs(detectedNote.frequencyGap) < detectedFrequency/100 ) {
				lowNoteIndicatorTxt.innerHTML = ">";
				highNoteIndicatorTxt.innerHTML = "<";
			} else if ( detectedNote.frequencyGap > 0 ) {
				lowNoteIndicatorTxt.innerHTML = ">";
				highNoteIndicatorTxt.innerHTML = "";
			} else {
				lowNoteIndicatorTxt.innerHTML = "";
				highNoteIndicatorTxt.innerHTML = "<";
			}
		} else {
			detectedFrequencyTxt.innerHTML = "";
			gapTxt.innerHTML = "";
			closestNoteTxt.innerHTML = "?";
			lowNoteIndicatorTxt.innerHTML = "";
			highNoteIndicatorTxt.innerHTML = "";
		}
	}
}

var app = new App();
