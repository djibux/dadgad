function Notes() {
	// Frequencies found here
	// http://forum.cakewalk.com/Guitar-notes-and-frequencies-chart-included-m869331.aspx
	// http://www.vaughns-1-pagers.com/music/musical-note-frequencies.htm
	this.frequencies = {
		"E2":  82.407,
		"A2": 110.00 ,
		"D3": 146.83 ,
		"G3": 196.00 ,
		"B3": 246.94 ,
		"E4": 329.63
	}
}

Notes.prototype.toFrequency = function(note) {
	return this.frequencies[note];
}
