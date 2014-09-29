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
	var frequencyGap;
	var logFrequencyGap = Infinity;
	var logDiffFreq;
	var harmonicNumber;
	this.chosenTuning.forEach( function(tuningReference) {
		for(var i=0;i<frequencyMultiple.length;i++){
			logDiffFreq = Math.log(Math.abs(frequencyMultiple[i]*this.notes.noteToFrequency(tuningReference)-detectedFrequency));
			if ( logDiffFreq<= logFrequencyGap) {
				logFrequencyGap =  logDiffFreq;
				closestNote = tuningReference;
				harmonicNumber = i;
			}
		}
	}, this);


	frequencyGap = frequencyMultiple[harmonicNumber]*this.notes.noteToFrequency(closestNote) - detectedFrequency;
	return { "note": closestNote, "frequencyGap": frequencyGap };
}
