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

		var canva = document.getElementById('canva');
		var canvaCtx = canva.getContext('2d');
		canvaCtx.clearRect(0, 0, canva.width, canva.height);
		var clockRadius = canva.height;

		// draw numbers
		canvaCtx.font = '12px Sans-Serif';
		canvaCtx.fillStyle = '#000';
		canvaCtx.textAlign = 'center';
		canvaCtx.textBaseline = 'middle';
		theDeltaF = [-20.0,0.0,+20.0];
		for (var i=0;i<theDeltaF.length;i++){
			var deltaF = theDeltaF[i];
			var theta = deltaF/100*Math.PI+Math.PI/2;
			var x = clockRadius * 0.9 * Math.cos(theta);
			var y = clockRadius * 0.9 * Math.sin(theta);
			canvaCtx.fillText(-deltaF+" Hz", canva.width/2+x, canva.height-y);
		}
		//draw small circles
		for (var i=-20;i<=20;i=i+5){
			var theta = i/100*Math.PI+Math.PI/2;
			var x1 = clockRadius * (1-2/100) * Math.cos(theta);
			var y1 = clockRadius * (1-2/100) * Math.sin(theta);
			canvaCtx.beginPath();
			canvaCtx.arc(canva.width/2+x1,canva.height-y1,canva.height/100,0,Math.PI * 2,true);
			canvaCtx.closePath();
			canvaCtx.stroke();
		}
		// draw hand circle
		canvaCtx.beginPath();
		canvaCtx.arc(canva.width/2,canva.height,canva.height/50,0,Math.PI * 2,true);
		canvaCtx.closePath();
		canvaCtx.fill();

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
    
    		// draw hand
    		var theta = (detectedNote.frequencyGap)/100*Math.PI+Math.PI/2;
			canvaCtx.beginPath();
			canvaCtx.moveTo(canva.width/2, canva.height);
			var x = clockRadius *Math.cos(theta);
			var y = clockRadius *Math.sin(theta);
			console.log('x: '+x)
			console.log('y: '+y)
			canvaCtx.lineTo(canva.width/2+x, canva.height-y);
			canvaCtx.stroke();
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
