/* Tuning class handles the conversion from frequency to note
 * availableTunings provide a library of tunings (Standard, DADGAD, OpenC)
 * TODO: consider splitting up Tuning and availableTunings in two classes?
 */

var availableTunings = {
	"standard" : [
		// Frequencies found here
		// http://forum.cakewalk.com/Guitar-notes-and-frequencies-chart-included-m869331.aspx
		// http://www.vaughns-1-pagers.com/music/musical-note-frequencies.htm
		{ frequency:  82.407 , note: "E2" },
		{ frequency: 110.00  , note: "A2" },
		{ frequency: 146.83  , note: "D3" },
		{ frequency: 196.00  , note: "G3" },
		{ frequency: 246.94  , note: "B3" },
		{ frequency: 329.63  , note: "E4" }
	]
};

var Tuning = function(chosenTuning) {
	this.tuningTable = (chosenTuning?chosenTuning:availableTunings["standard"]);
}

Tuning.prototype.findClosestNote = function(frequency) {
	var foundNote = "No match found";
	var foundFrequency = 0;
	this.tuningTable.forEach( function(i) {
		if ( i.frequency < frequency ) {
			foundNote = i.note;
			foundFrequency = frequency;
		}
	});
	return foundNote;
}
