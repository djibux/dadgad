var availableTunings = {
	"standard" : [ "E2", "A2", "D3", "G3", "B3", "E4" ]
};
var frequencyMultiple = [1,2];

function Tuning( chosenTuning ) {
	this.chosenTuning = (chosenTuning ? chosenTuning : availableTunings["standard"]);
	this.notes = new Notes();
}

Tuning.prototype.findClosestNote = function(detectedFrequency) {
	var closestNote;
	var frequencyGap = Infinity;
	var diffFreq;
	this.chosenTuning.forEach( function(tuningReference) {
		for(var i=0;i<frequencyMultiple.length;i++){
			diffFreq = Math.abs(frequencyMultiple[i]*this.notes.noteToFrequency(tuningReference)-detectedFrequency);
			if ( diffFreq<= frequencyGap) {
				frequencyGap =  diffFreq;
				closestNote = tuningReference;
			}
		}
	}, this);

	return { "note": closestNote, "frequencyGap": frequencyGap };
}
