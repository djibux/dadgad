var App = function() {
	this.tuning = new Tuning("Standard"); 
	this.capture = new Capture(this.tuning);
	this.addTuningSelectors();
	this.setupChangeTuningActions();
	this.setupNoteDetection();
}

App.prototype = {
	addTuningSelectors: function() {
		var tuningList = document.getElementById("set-tuner-type");
		var availableTunings = this.tuning.getAvailableTunings();
		for (var tuningId in availableTunings) {
			var tuningName = tuningId.replace("-"," ");
			if ( availableTunings[tuningId].length <= 6 ) {
				tuningName += " ("+availableTunings[tuningId].join("-")+")"
			}
			tuningList.innerHTML += '<li><a href="#content" id="set-'+tuningId+'-tuning">'+tuningName+'</a></li>'								
		}
	},				

	setupChangeTuningActions: function() {
		var selector = "#set-tuner-type a";
		for ( var actionElement of document.querySelectorAll(selector) ) {
			actionElement.addEventListener("click", function(e) {
				var tuning = e.target.id.replace(/set-(.*)-tuning/, function(match,p1){ return p1 });
				document.querySelector("#drawer h1").innerHTML = e.target.innerHTML;
				this.tuning = new Tuning(tuning);
			}.bind(this))
		}
		var chooseStandardTuningEvent = new CustomEvent("click");
		document.querySelector(selector).dispatchEvent(chooseStandardTuningEvent);
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
			closestNoteTxt.innerHTML = "-";
			lowNoteIndicatorTxt.innerHTML = "";
			highNoteIndicatorTxt.innerHTML = "";
		}
	}
}

var app = new App();
