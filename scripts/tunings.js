function Tuning( chosenTuning ) {
	this.availableTunings = {
		"standard" : [ "E", "A", "D", "G", "B", "E" ],
		"chromatic" : Note.AVAILABLE_NOTES
	};
	this.chosenTuning = (chosenTuning ? this.availableTunings[chosenTuning] : this.availableTunings["standard"]);
	this.notes = this.chosenTuning.map( function(note) { return new Note(note) });
}

Tuning.prototype.findClosestNote = function(detectedFrequency) {
	return this.notes.reduce ( function( previousResult, currentNote ) {
		var currentFrequencyGap = currentNote.processFrequencyGap(detectedFrequency);
		if ( Math.abs(currentFrequencyGap) <= Math.abs(previousResult.frequencyGap) ) {
			return { "note": currentNote, "frequencyGap": currentFrequencyGap };
		} else {
			return previousResult;
		}
	}, { "note": null, "frequencyGap": Infinity })
}
