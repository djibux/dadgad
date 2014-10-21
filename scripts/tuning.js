var Tuning = function(chosenTuning) {
	this.availableTunings = {
		"Standard" : [ "E", "A", "D", "G", "B", "E" ],
		"Drop-C" : [ "C", "G", "C", "F", "A", "D"],
		"Drop-D" : [ "D", "A", "D", "G", "B", "E"],
		"Open-C" : [ "C", "G", "C", "G", "C", "E"],
		"Open-D" : [ "D", "A", "D", "F#", "A", "D"],
		"Modal-D" : [ "D", "A", "D", "G", "A", "D"],
		"Open-D-minor" : [ "D", "A", "D", "F", "A", "D"],
		"Open-G" : [ "D", "G", "D", "G", "B", "D"],
		"Open-G-minor" : [ "D", "G", "D", "G", "A#", "D"],
		"Open-A" : [ "E", "A", "C#", "E", "A", "E"],
		"Chromatic" : Note.AVAILABLE_NOTES
	};
	this.chosenTuning = (chosenTuning ? this.availableTunings[chosenTuning] : this.availableTunings["standard"]);
	this.notes = this.chosenTuning.map( function(note) { return new Note(note) });
}

Tuning.prototype = {
	findClosestNote: function(detectedFrequency) {
		return this.notes.reduce ( function( previousResult, currentNote ) {
			var currentFrequencyGap = currentNote.processFrequencyGap(detectedFrequency);
			if ( Math.abs(currentFrequencyGap) <= Math.abs(previousResult.frequencyGap) ) {
				return { "note": currentNote, "frequencyGap": currentFrequencyGap };
			} else {
				return previousResult;
			}
		}, { "note": null, "frequencyGap": Infinity })
	},
	getAvailableTunings: function() {
		return this.availableTunings;
	}
}
