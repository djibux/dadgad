var availableTunings = {
	"standard" : [ "E2", "A2", "D3", "G3", "B3", "E4" ]
};

function Tuning( chosenTuning ) {
	this.chosenTuning = (chosenTuning ? chosenTuning : availableTunings["standard"]);
	this.notes = new Notes();
}

Tuning.prototype.findClosestNote = function(detectedFrequency) {
	var closestNote;
	var frequencyGap;
	var logFrequencyGap = Infinity;
	var logDiffFreq;
	this.chosenTuning.forEach( function(tuningReference) {
		logDiffFreq = Math.log(Math.abs(this.notes.noteToFrequency(tuningReference)-detectedFrequency));
		if ( logDiffFreq<= logFrequencyGap) {
			logFrequencyGap =  logDiffFreq;
			closestNote = tuningReference;
		}
	}, this);


	frequencyGap = this.notes.noteToFrequency(closestNote) - detectedFrequency;
	return { "note": closestNote, "frequencyGap": frequencyGap };
}
