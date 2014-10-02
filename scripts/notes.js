Note = function(note) {
	this.noteName = note;
}

Object.defineProperty(Note, "AVAILABLE_NOTES", { value: [ "A", "A#", "B", "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#" ] })

Note.prototype.toFrequency = function() {
	// A4 is 440Hz, A1 is (440/2**3)Hz, every semitone is sqtr12(2) apart
	return 440/8 * Math.pow(2,Note.AVAILABLE_NOTES.indexOf(this.noteName)/12);
}

Note.prototype.processFrequencyGap = function( frequency ) {
	var previousGap = Infinity;
	var currentGap = Infinity;
	for ( var octave = 0; Math.abs(currentGap) <= Math.abs(previousGap); octave++ ) {
		previousGap = currentGap;
		currentGap = this.toFrequency() * Math.pow(2,octave) - frequency;
	}
	return previousGap;
}
