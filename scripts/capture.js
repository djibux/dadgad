function max_index(elements) {
	var i = 1;
	var mi = 0;
	while (i < elements.length) {
		if (!(elements[i] < elements[mi]))
			mi = i;
		i += 1;
	}
	return mi;
}
function sum(elements){
	var sum = 0.0;
	for (var i = 0;i<elements.length;i++){
		sum += elements[i];
	}
	return sum;
}

var Capture = function () {
	this.startCapturing();
}

Object.defineProperty(Capture, "BUFFER_SIZE", {value: 4096});
Object.defineProperty(Capture, "RESAMPLING_RATE", {value: 64});

Capture.prototype = {
	startCapturing: function() {
		navigator.getUserMedia = (
			navigator.getUserMedia ||
			navigator.webkitGetUserMedia ||
			navigator.mozGetUserMedia ||
			navigator.msGetUserMedia
		);
		navigator.getUserMedia (
			{ video: false, audio: true },
			this._onSuccessfulCapture.bind(this),
			this._onFailure.bind(this)
		)
	},

	_onFailure: function(err) {
		console.log("The following error occured: " + err);
	},

	_onSuccessfulCapture: function(localMediaStream) {
		var audioCtx = new AudioContext();
		var source = audioCtx.createMediaStreamSource(localMediaStream);
		var node = audioCtx.createScriptProcessor(Capture.BUFFER_SIZE, 1, 1);
		var analyser = audioCtx.createAnalyser();

		window.horrible_hack_for_mozilla = source;

		// Connection des nodes : microphone -> ScriptProcessorNode (resampling) -> AnalyserNode (fft)
		source.connect(node);
		node.connect(analyser);

		// Give the node a function to process audio events
		node.onaudioprocess = this._processAudio;


		analyser.fftSize = 2048;
		analyser.smoothingTimeConstant = 0.9;
		var bufferLength = analyser.frequencyBinCount;
		var dataArray = new Float32Array(bufferLength);

		var detectedFrequencyTxt = document.getElementById('detected-frequency');
		var gapTxt = document.getElementById('gap');
		var closestNoteTxt = document.getElementById('closest-note');
		var lowNoteIndicatorTxt = document.getElementById('low-note-indicator');
		var highNoteIndicatorTxt = document.getElementById('high-note-indicator');

		function draw() {
			drawVisual = requestAnimationFrame(draw);
			analyser.getFloatFrequencyData(dataArray);
			//console.log(sum(dataArray));
			if(sum(dataArray)>=-100000.0){
				var frequency = (max_index(dataArray)*audioCtx.sampleRate/(analyser.fftSize*Capture.RESAMPLING_RATE));
				var closestNote = tuning.findClosestNote(frequency);

				detectedFrequencyTxt.innerHTML = frequency.toFixed(1)+" Hz";
				gapTxt.innerHTML = closestNote.frequencyGap.toFixed(2)+ "Hz";
				closestNoteTxt.innerHTML = closestNote.note.noteName;
				if ( Math.abs(closestNote.frequencyGap) < frequency/100 ) {
					lowNoteIndicatorTxt.innerHTML = ">";
					highNoteIndicatorTxt.innerHTML = "<";
				} else if ( closestNote.frequencyGap > 0 ) {
					lowNoteIndicatorTxt.innerHTML = ">";
					highNoteIndicatorTxt.innerHTML = "";
				} else {
					lowNoteIndicatorTxt.innerHTML = "";
					highNoteIndicatorTxt.innerHTML = "<";
				}
			}else{
				detectedFrequencyTxt.innerHTML = "";
				gapTxt.innerHTML = "";
				closestNoteTxt.innerHTML = "";
				lowNoteIndicatorTxt.innerHTML = "";
				highNoteIndicatorTxt.innerHTML = "";
			}
		};
		draw();
	},

	_processAudio: function(audioProcessingEvent) {
		// The input buffer is the mic
		var inputBuffer = audioProcessingEvent.inputBuffer;

		// The output buffer contains the samples that will be modified and played
		var outputBuffer = audioProcessingEvent.outputBuffer;

		// Loop through the output channels (in this case there is only one)
		for (var channel = 0; channel < outputBuffer.numberOfChannels; channel++) {
			var inputData = inputBuffer.getChannelData(channel);
			var outputData = outputBuffer.getChannelData(channel);

			// Loop through the 4096 samples

			for (var sample = 0; sample < inputBuffer.length/Capture.RESAMPLING_RATE; sample++) {
				// make output equal to the mean of the input
				outputData[sample] = 0;
				for(var i = 0;i<Capture.RESAMPLING_RATE;i++){
					outputData[sample]=outputData[sample]+inputData[sample*Capture.RESAMPLING_RATE+i]/Capture.RESAMPLING_RATE;
				}

			}
		}
	}
}
