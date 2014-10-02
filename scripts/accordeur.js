navigator.getUserMedia = (
	navigator.getUserMedia ||
	navigator.webkitGetUserMedia ||
	navigator.mozGetUserMedia ||
	navigator.msGetUserMedia
);

/* TODO : needs refactoring! */

if (navigator.getUserMedia) {
	navigator.getUserMedia (
		{
			video: false,
			audio: true
		},
		// successCallback
		function(localMediaStream) {
			var magnitude;
			var bufferSize = 4096;
			var rate;
			var sousEch = 64;

			var audioCtx = new AudioContext();
			var source = audioCtx.createMediaStreamSource(localMediaStream);
			var node = audioCtx.createScriptProcessor(bufferSize, 1, 1);
			var analyser = audioCtx.createAnalyser();

			window.horrible_hack_for_mozilla = source;

			// Connection des nodes : microphone -> ScriptProcessorNode (sous échantillonnage) -> AnalyserNode (fft)
			source.connect(node);
			node.connect(analyser);

			// create a ScriptProcessorNode

			// Give the node a function to process audio events
			node.onaudioprocess = function(audioProcessingEvent) {
				// The input buffer is the song we loaded earlier
				var inputBuffer = audioProcessingEvent.inputBuffer;

				// The output buffer contains the samples that will be modified and played
				var outputBuffer = audioProcessingEvent.outputBuffer;

				// Loop through the output channels (in this case there is only one)
				for (var channel = 0; channel < outputBuffer.numberOfChannels; channel++) {
					var inputData = inputBuffer.getChannelData(channel);
					var outputData = outputBuffer.getChannelData(channel);

					// Loop through the 4096 samples

					for (var sample = 0; sample < inputBuffer.length/sousEch; sample++) {
						// make output equal to the mean of the input
						outputData[sample] = 0;
						for(var i = 0;i<sousEch;i++){
							outputData[sample]=outputData[sample]+inputData[sample*sousEch+i]/sousEch;
						}

					}
				}
			};

			//source.connect(analyser);
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
				var frequency = (max_index(dataArray)*audioCtx.sampleRate/(analyser.fftSize*sousEch));
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
			};
			draw();
		},
		// errorCallback
		function(err) {
			console.log("The following error occured: " + err);
		}
	);
} else {
	console.log("getUserMedia not supported");
}

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
