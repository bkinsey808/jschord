var String = Class({
  init: function(stringString) {
    var matches = stringString.match(/(\d*)([ABCDEFG][b#]?)(\d*),?(\d*)/);
    this.startFret = matches[1] ? parseInt(matches[1]) : 0;
    this.lastFret =  matches[4] ? parseInt(matches[4]) : 0; 
    this.note = new Note(matches[2] + matches[3]);
    this.valueArray = [];
    for (var i = 0; i < this.startFret; i++) {
      this.valueArray.push(null);
    }
    var noteValue = this.note.getValue();
    for (var i = this.startFret; i <= this.lastFret; i++) {
      fretNoteValue = noteValue - this.startFret + i;
      this.valueArray.push(fretNoteValue);
    }
  },
  getValueArray: function() {
    return this.valueArray;
  },

    getOpenNote: function() {
	return this.note;
    },

    getStartFret: function() {
	return this.startFret;
    },

    getMaxFret: function() {
	return this.lastFret;
    },

    getPositionAtFret: function(fretNum) {
	if (fretNum > this.lastFret) {
	    return null;
	}
	if (fretNum < this.startFret) {
	    return null;
	}
	return this.valueArray[fretNum];
    }
});
