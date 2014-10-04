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

var Capture = function (tuning) {
	this.audioCtx = null;
	this.analyser = null;
	this.tuning = tuning;
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
		this.audioCtx = new AudioContext();
		var source = this.audioCtx.createMediaStreamSource(localMediaStream);
		var node = this.audioCtx.createScriptProcessor(Capture.BUFFER_SIZE, 1, 1);
		this.analyser = this.audioCtx.createAnalyser();

		window.horrible_hack_for_mozilla = source;

		// Connecting nodes: microphone -> ScriptProcessorNode (resampling) -> AnalyserNode (FFT)
		source.connect(node);
		node.connect(this.analyser);

		// Give the node a function to process audio events
		node.onaudioprocess = this._processAudio;
		
		// Configure FFT
		this.analyser.fftSize = 2048;
		this.analyser.smoothingTimeConstant = 0.9;

		// Start analysing
		this._analyseAudio();
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
				for (var i = 0; i<Capture.RESAMPLING_RATE; i++ ){
					outputData[sample]=outputData[sample]+inputData[sample*Capture.RESAMPLING_RATE+i]/Capture.RESAMPLING_RATE;
				}

			}
		}
	},

	_analyseAudio() {
		var dataArray = new Float32Array(this.analyser.frequencyBinCount);
		this.analyser.getFloatFrequencyData(dataArray);

		if ( sum(dataArray) >= -100000.0 ) {
			var detectedFrequency = (max_index(dataArray)*this.audioCtx.sampleRate/(this.analyser.fftSize*Capture.RESAMPLING_RATE));
			var closestNote = this.tuning.findClosestNote(detectedFrequency);
			var noteFoundEvent = new CustomEvent("notefound", {"detail":closestNote});
			window.dispatchEvent(noteFoundEvent);
		} else {
			var noteLostEvent = new CustomEvent("notefound");
			window.dispatchEvent(noteLostEvent);
		}


		// Setting up the next call (when screen is ready to update)
		window.requestAnimationFrame(this._analyseAudio.bind(this));
	}
}
