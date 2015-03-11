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

  getString: function(stringNum) {
    return this.stringArray[stringNum];
  },

    getStringArray: function() {
	return this.stringArray;
    },

    getNumStrings: function() {
	return this.stringArray.length;
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

    getChordFromPosition: function(position, primary) {
    var positionArray = position.split(' ');
      var noteNumArray = this.getNoteNumArrayFromPositionArray(positionArray, true);
    var chord = new Chord(noteNumArray);
    return chord;
  },

    getNoteNumArrayFromPositionArray: function(positionArray, mod) {
	var noteNumArray = [];
	for (var i = 0; i < positionArray.length; i++) {
	    var fret = positionArray[i];
	    if (fret == 'x') continue;
	    var fretNum = parseInt(fret);
	    var noteNum = this.valueArray[i][fretNum];
	    if (mod) {
		//console.log('here: ' + noteNum);
		noteNum = noteNum % 12;
	    }
	    noteNumArray.push(noteNum);
	}
	return noteNumArray;
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
    getNumStrings: function() {
	return this.stringArray.length;
    },

    getPositionsAtFret: function(fretNum, maxFretSpan, scale) {
	var positions = [];
	var numStrings = this.getNumStrings();
	if (fretNum === 0) {
	    var position = [];
	    for (stringNum = 0; stringNum < numStrings; stringNum++) {
		position.push(0);
	    }
	    if (this.positionInScale(position, scale)) {
		positions.push(position.join(' '));
	    }
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
	    if (atFretNum && nonMuteCount > 1 && !noPositionAtFret && this.positionInScale(position, scale)) {
//		positions.push(positionString);

		var chord = this.getChordFromPosition(positionString);
		var scaleString = chord.getScaleString(true);
		var newScale = new Scale(scaleString);
		var numNotes = newScale.getNumNotes();
		var scaleTypeString = newScale.getScaleTypeString();
		var scaleType = new ScaleType(scaleTypeString);
		var scaleTypeName = scaleType.getNames();
		var noteString = newScale.getNote().getString(true);

		var positionData = { 
		    numNotes: numNotes,
		    position: positionString,
		    note: noteString,
		    scaleType: scaleTypeString,
		    scaleTypeName: scaleTypeName
		};
		var numOpen = 0;
		var numMuted = 0;
		for (var s = 1; s <= numStrings; s++) {
		    var positionAt = position[s - 1];
		    positionData['s' + s] = positionAt;
		    if (positionAt === 'x') {
			numMuted++;
		    }
		    if (positionAt === 0) {
			numOpen++;
		    }
		    positionData.numMuted = numMuted;
		    positionData.numOpen = numOpen;
		}
		this.db.push(positionData);
	    }
	}
	return positions;
    },

    positionInScale: function(position, scale) {
	if (!scale) {
	    return true;
	}
	//console.log(arguments);
	var scaleValueArray = scale.getValueArray(true);
	var noteNumArray = this.getNoteNumArrayFromPositionArray(position);
	for (var i = 0; i < noteNumArray.length; i++) {
	    var noteNum = noteNumArray[i] % 12;
	    //console.log(noteNum);
	    var note = new Note(noteNum);
	    if ($.inArray(noteNum, scaleValueArray) === -1) {
		return false;
	    }
	}
	return true;
    },

    buildChordDatabase: function(maxFretSpan, masterScale) {
	this.db = new Backbone.Collection();
	this.db.comparator = function(item) {
	    return [10000-parseInt(item.get('numNotes')), item.get('scaleTypeName'), item.get('note'), 100 - (parseInt(item.get('numOpen')) + 1)];
	};
	for (i = 0; i <= this.lastFret; i++) {
	    this.getPositionsAtFret(i, maxFretSpan, masterScale);
	}
	this.db.sort();
	return this.db;
    },


});

