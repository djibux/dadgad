function Tuning( chosenTuning ) {
	this.availableTunings = {
		"standard" : [ "E2", "A2", "D3", "G3", "B3", "E4" ]
	}
	this.chosenTuning = (chosenTuning ? chosenTuning : this.availableTunings["standard"]);
	this.notes = new Notes();
}

Tuning.prototype.findClosestNote = function(detectedFrequency) {
	var notes = this.notes;
	return this.chosenTuning.reduce ( function( previousResult, currentNote ) {
		var currentFrequencyGap = notes.toFrequency(currentNote)-detectedFrequency
		if ( Math.abs(currentFrequencyGap) <= Math.abs(previousResult.frequencyGap) ) {
			return { "note": currentNote, "frequencyGap": currentFrequencyGap };
		} else {
			return previousResult;
		}
	}, { "note": null, "frequencyGap": Infinity })
}
