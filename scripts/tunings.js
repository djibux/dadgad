var availableTunings = {
	"standard" : [ "E2", "A2", "D3", "G3", "B3", "E4" ]
};

function Tuning( chosenTuning ) {
	this.chosenTuning = (chosenTuning ? chosenTuning : availableTunings["standard"]);
	this.notes = new Notes();
}

Tuning.prototype.findClosestNote = function(detectedFrequency) {
	var closestLowerNote;
	var closestHigherNote;
	var closestNote;
	var frequencyGap;
	// This should be safe as a tuning would typically consist of 4 to 12 notes
	this.chosenTuning.forEach( function(tuningReference) {
		if ( detectedFrequency > this.notes.noteToFrequency(tuningReference) ) {
			closestLowerNote = tuningReference;
		} else if ( !closestHigherNote ) {
			closestHigherNote = tuningReference;
		}
	}, this);
	if ( !closestHigherNote ) {
		closestNote = closestLowerNote;
	} else if ( !closestLowerNote ) {
		closestNote = closestHigherNote;
	} else if ( detectedFrequency - this.notes.noteToFrequency(closestLowerNote) < this.notes.noteToFrequency(closestHigherNote) - detectedFrequency ) {
		closestNote = closestLowerNote;
	} else {
		closestNote = closestHigherNote;
	}

	frequencyGap = this.notes.noteToFrequency(closestNote) - detectedFrequency;
	return { "note": closestNote, "frequencyGap": frequencyGap };
}
