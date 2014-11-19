var Capture = function () {
	this.audioCtx = null;
	this.analyser = null;
	this.startCapturing();
}

Object.defineProperty(Capture, "BUFFER_SIZE", {value: 4096});
Object.defineProperty(Capture, "RESAMPLING_RATE", {value: 64});
Object.defineProperty(Capture,"START_VOLUME_THRESHOLD", {value: -110000});
Object.defineProperty(Capture,"STOP_VOLUME_THRESHOLD", {value: -127000});

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
		var node2 = this.audioCtx.createScriptProcessor(Capture.BUFFER_SIZE, 1, 1);
		this.analyser = this.audioCtx.createAnalyser();
		this.analyser2 = this.audioCtx.createAnalyser();

		window.horrible_hack_for_mozilla = source;

		// Connecting nodes: microphone -> ScriptProcessorNode (resampling) -> AnalyserNode (FFT)
		source.connect(node);
		node.connect(this.analyser);
		
		source.connect(node2);
		node2.connect(this.analyser2);

		// Give the node a function to process audio events
		node.onaudioprocess = this._processAudio;
		node2.onaudioprocess = this._processAudio2;
		
		// Configure FFT
		this.analyser.fftSize = 2048;
		this.analyser.smoothingTimeConstant = 0.97;

		// Start analysing
		this._analyseAudio();
		
		// Configure FFT
		this.analyser2.fftSize = 2048;
		this.analyser2.smoothingTimeConstant = 0.97;

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
	
	_processAudio2: function(audioProcessingEvent) {
		// The input buffer is the mic
		var inputBuffer = audioProcessingEvent.inputBuffer;

		// The output buffer contains the samples that will be modified and played
		var outputBuffer = audioProcessingEvent.outputBuffer;
		var resamplingRate = 2*Capture.RESAMPLING_RATE ;

		// Loop through the output channels (in this case there is only one)
		for (var channel = 0; channel < outputBuffer.numberOfChannels; channel++) {
			var inputData = inputBuffer.getChannelData(channel);
			var outputData = outputBuffer.getChannelData(channel);

			// Loop through the 4096 samples
			for (var sample = 0; sample < inputBuffer.length/resamplingRate; sample++) {
				// make output equal to the mean of the input
				outputData[sample] = 0;
				for (var i = 0; i<resamplingRate; i++ ){
					outputData[sample]=outputData[sample]+inputData[sample*resamplingRate+i]/Capture.resamplingRate;
				}

			}
		}
	},

	_analyseAudio: function() {
		var dataArray = new Float32Array(this.analyser.frequencyBinCount);
		this.analyser.getFloatFrequencyData(dataArray);
		var volume = ArrayTools.sum(dataArray);
		
		if ( volume >= Capture.START_VOLUME_THRESHOLD ) {
			var detectedFrequency = (ArrayTools.maxIndex(dataArray)*this.audioCtx.sampleRate/(this.analyser.fftSize*Capture.RESAMPLING_RATE));
			if (detectedFrequency<=this.audioCtx.sampleRate/2*Capture.RESAMPLING_RATE){
				this._analyseAudio2();
				return;
			}
			var soundOn = new CustomEvent("soundon", {"detail":detectedFrequency});
			window.dispatchEvent(soundOn);
		} else if(volume <= -Capture.STOP_VOLUME_THRESHOLD){
			var soundOff = new CustomEvent("soundoff");
			window.dispatchEvent(soundOff);
		}



		// Setting up the next call (when screen is ready to update)
		window.requestAnimationFrame(this._analyseAudio.bind(this));
	},
	
	_analyseAudio2: function() {
		var dataArray = new Float32Array(this.analyser2.frequencyBinCount);
		this.analyser2.getFloatFrequencyData(dataArray);
		var volume = ArrayTools.sum(dataArray);
		
			if ( volume >= Capture.START_VOLUME_THRESHOLD ) {
			var detectedFrequency = (ArrayTools.maxIndex(dataArray)*this.audioCtx.sampleRate/(this.analyser2.fftSize*2*Capture.RESAMPLING_RATE));
			var soundOn = new CustomEvent("soundon", {"detail":detectedFrequency});
			window.dispatchEvent(soundOn);
		} else if(volume <= -Capture.STOP_VOLUME_THRESHOLD){
			var soundOff = new CustomEvent("soundoff");
			window.dispatchEvent(soundOff);
		}



		// Setting up the next call (when screen is ready to update)
		window.requestAnimationFrame(this._analyseAudio.bind(this));
	},
}
