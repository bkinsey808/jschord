var Instrument = Class({
  init: function(instrumentString) {
    this.instrumentString = instrumentString;
    var stringStringArray = instrumentString.split(' ');
    this.stringArray = [];
    this.valueArray = [];
    this.lastFret = 0;
    for (var i = 0; i < stringStringArray.length; i++) {
      var string = new String(stringStringArray[i]);
      this.stringArray.push(string);
      this.lastFret = (string.lastFret > this.lastFret) ? string.lastFret : this.lastFret;
    }
    this.setValueArray();
  },

  setValueArray: function() {
    var valueArray = [];
    for (var i = 0; i < this.stringArray.length; i++) {
      var string = this.stringArray[i];
      var stringValueArray = string.getValueArray();
      for (var j = stringValueArray.length; j <= this.lastFret; j++) {
        stringValueArray[j] = null;
      }
      valueArray.push(stringValueArray);
    }    
    this.valueArray = valueArray;
  },

  getValueArray: function() {
    return this.valueArray;
  },

  getString: function() {
    return this.scaleString;
  },

    getStringArray: function() {
	return this.stringArray;
    },

    getMaxFret: function() {
	var maxFret = 0;
	for (var i = 0; i < this.stringArray.length; i++) {
	    var string = this.stringArray[i];
	    var stringMaxFret = string.getMaxFret();
	    if (stringMaxFret > maxFret) {
		maxFret = stringMaxFret;
	    }
	}
	return maxFret;
    },

    getOpenNotes: function() {
	var openNotes = [];
	for (var i = 0; i < this.stringArray.length; i++) {
	    var string = this.stringArray[i];
	    openNotes.push(string.getOpenNote());
	}
	return openNotes;
    },

  getChordFromPosition: function(position) {
    var positionArray = position.split(' ');
    var noteNumArray = [];
    for (var i = 0; i < positionArray.length; i++) {
      var fret = positionArray[i];
      if (fret == 'x') continue;
      var fretNum = parseInt(fret);
      noteNumArray.push(this.valueArray[i][fretNum]);
	
    }
    var chord = new Chord(noteNumArray);
    return chord;
  },

/*

Math.pow(numS);

    0     1  2  n
0:  sf    sf sf sf
1:  sf+1  sf sf sf
2:  sf+2  sf sf sf
...
mf: sf+mf sf sf sf
   

5^0 5^1 5^2 5^3 
1   4

*/

    getPositionsAtFret: function(fretNum, maxFretSpan) {
	var positions = [];
	var numStrings = this.stringArray.length;
	if (fretNum === 0) {
	    var position = [];
	    for (stringNum = 0; stringNum < numStrings; stringNum++) {
		position.push(0);
	    }
	    positions.push(position.join(' '));
	    return positions;
	}
	maxPositionNum = Math.pow(maxFretSpan + 2, numStrings);
	for (var i = 0; i < maxPositionNum; i++) {
	    var position = [];
	    var atFretNum = false;
	    var noPositionAtFret = false;
	    var nonMuteCount = 0;
	    for (stringNum = 0; stringNum < numStrings; stringNum++) {
		var string = this.stringArray[stringNum];
		var fretAtString
		    = fretNum
		    + Math.floor(i / Math.pow(maxFretSpan + 2, stringNum)) % (maxFretSpan + 2);
		var positionAtFret = string.getPositionAtFret(fretAtString);
		if (positionAtFret === null) {
		    noPositionAtFret = true;
		}
		if (fretAtString === fretNum + maxFretSpan) {
		    fretAtString = 'x';
		} else if (fretAtString === fretNum + maxFretSpan + 1) {
		    fretAtString = 0;
		    nonMuteCount++;
		} else {
		    nonMuteCount++;
		}
		position.push(fretAtString);
		if (fretAtString === fretNum) {
		    atFretNum = true;
		}
	    }
	    var positionString = position.join(' ');
	    if (atFretNum && nonMuteCount > 1 && !noPositionAtFret) {
		positions.push(positionString);
	    }
	}
	return positions;
    },

    buildChordDatabase: function(maxFretSpan) {
	console.log(this.lastFret);
	this.chordsByPosition = {};
	this.chordsByType = {};
	for (i = 0; i <= this.lastFret; i++) {
	    var positions = this.getPositionsAtFret(i, maxFretSpan);
	    var numPositionsAtFret = positions.length;
	    for (var j = 0; j < numPositionsAtFret; j++) {
		var position = positions[j];
		var chord = this.getChordFromPosition(position);
		this.chordsByPosition[position] = chord;
		var scale = chord.getScale(true);
		var scaleTypeString = scale.getScaleTypeString();
		var noteString = scale.getNote().getString(true);
		if (position === '2 0 0 0') {
		    console.log('found: ' + position);
		    console.log(noteString);
		}
		if (!this.chordsByType[scaleTypeString]) {
		    this.chordsByType[scaleTypeString] = {};
		}
		if (!this.chordsByType[scaleTypeString][noteString]) {
		    this.chordsByType[scaleTypeString][noteString] = {};
		}
		this.chordsByType[scaleTypeString][noteString][position] = chord;
	    }
	}
	return this.chordsByType;
    },

});

