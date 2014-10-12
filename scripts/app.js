var App = function() {
	this.tuning = new Tuning("standard"); 
	this.capture = new Capture(this.tuning);
	this.setupChangeTuningActions();
	this.setupNoteDetection();
}

App.prototype = {
	setupChangeTuningActions: function() {
		var selector = "#set-tuner-type a"; 
		for ( var actionElement of document.querySelectorAll(selector) ) {
			actionElement.addEventListener("click", function(e) {
				var tuning = e.target.id.replace(/set-(.)(.*)-tuning/, function(match,p1,p2){ return p1.toUpperCase()+p2 });
				document.querySelector("#drawer h1").innerHTML = tuning + " tuner";
				this.tuning = new Tuning(tuning.toLowerCase());
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
			//function draw() {

			//drawVisual = requestAnimationFrame(draw);
			var canva = document.getElementById('canva');
    			var canvaCtx = canva.getContext('2d');
			canvaCtx.fillStyle = 'rgb(200, 200, 200)';
			canvaCtx.fillRect(0, 0, canva.width, canva.height);
			var clockRadius = 50;


    			//canvaCtx.translate(canva.width / 2, canva.height / 2);
    			//canvaCtx.beginPath();

    			/*// draw numbers
    			canvaCtx.font = '36px Sans-Serif';
    			canvaCtx.fillStyle = '#000';
    			canvaCtx.textAlign = 'center';
    			canvaCtx.textBaseline = 'middle';
    			for (var n = 1; n < 13; n++) {
        			var theta = (n - 3) * (Math.PI * 2) / 12;
        			var x = clockRadius * 0.7 * Math.cos(theta);
        			var y = clockRadius * 0.7 * Math.sin(theta);
        			canvaCtx.fillText(n, x, y);
    			}*/

    			//Draw the spots where the second hand stops
    
		    	/*for(var i=-15; i<=+15; i++){
				var tTheta = (-i + 15) * (Math.PI * 2) / 60;
				var x1 = clockRadius * 0.9 * Math.cos(tTheta);
				var y1 = clockRadius * 0.9 * Math.sin(tTheta);
		    
				canvaCtx.beginPath();
				canvaCtx.arc(x1,y1,1,0,Math.PI * 2,true);
				canvaCtx.closePath();
				canvaCtx.stroke();
		    	} */
    
    			// draw hour
    			var theta = (detectedNote.frequencyGap)/100*Math.PI+Math.PI/2;
			//canvaCtx.rotate(theta);
			canvaCtx.beginPath();
			canvaCtx.moveTo(canva.width/2, canva.height);
			var x = clockRadius * Math.cos(theta);
			var y = clockRadius * Math.sin(theta);
			console.log('x: '+x)
			console.log('y: '+y)
			canvaCtx.lineTo(canva.width/2+x, canva.height-y);
			canvaCtx.stroke();
			//}
			//draw();
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
