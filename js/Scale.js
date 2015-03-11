var Scale = Class({

  include: AppMixin,

    init: function(argument, makePrimary) {
	//console.log(arguments);
	this.valueArray = [];
	if (argument instanceof Array) {
	    var array = this.getUniqueArray(argument);
	    array.sort(function(a,b){return a-b});
	    this.note = new Note(array[0]);
	    this.scaleType = new ScaleType(array);
	} else {
	    var matches = argument.match(/([ABCDEFG]b?#?\d?)( ([ABCDEFG]b?#?\d?))$/);
	    if (matches) {
		this.note = new Note(matches[1]);
		this.scaleType = new ScaleType(argument);
	    } else {
		var matches = argument.match(/([ABCDEFGb#\d]+) (.*)/);
		if (!matches) {
		    this.perfectUnison = true;
		    this.note = new Note(argument);
		    this.scaleType = new ScaleType();
		    this.valueArray = [this.note.getValue()];
		} else {
                    //console.log('this case')
		    //console.log(arguments);
		    this.note = new Note(matches[1]);
		    this.scaleType = new ScaleType(matches[2]);
		    if (this.scaleType.isPerfectUnison()) {
			this.perfectUnison = true;
		    }
		}
	    }
	}
	this.scaleString = this.note.getString() + ' ' + this.scaleType.getString();
	if (this.perfectUnison) {
	    return;
	}
	var scaleTypeValueArray = this.scaleType.getValueArray();
	var noteValue = this.note.getValue();
	var self = this;
	var mapFunction = function(scaleTypeValue) {
	    self.valueArray.push(scaleTypeValue + noteValue);
	};
	scaleTypeValueArray.map(mapFunction);
	if (makePrimary) {
	    var newScaleString = this.getString(true);
	    if (newScaleString !== this.scaleString) {
		var scale = new Scale(newScaleString);
		this.scaleString = newScaleString;
		this.valueArray = scale.getValueArray();
		this.note = scale.getNote();
	    }
	}
    },
    getNote: function() {
	return this.note;
    },

    getValueArray: function(mod) {
	if (!mod) {
	    return this.valueArray;
	}
	var modValueArray = [];
	for (var i = 0; i < this.valueArray.length; i++) {
	    modValueArray.push(this.valueArray[i] % 12);
	}
	return modValueArray;
    },

    getString: function(primary) {
	if (!primary) {
	    return this.scaleString;
	}
	
	var sortedValueArray = this.getUniqueArray(this.valueArray);
	var length = sortedValueArray.length;
	for (var i = 0; i < length; i++) {
	    sortedValueArray[i] = sortedValueArray[i] % 12;
	}
	sortedValueArray.sort(function(a,b){return a-b});
	//console.log(sortedValueArray);
	for (var n = 0; n < length; n++) {
	    var note = new Note(sortedValueArray[n]);
	    var nthInversion = this.getNthInversion(n, sortedValueArray);
	    var scaleType = new ScaleType(nthInversion);
	    //console.log(n, note.getString(), nthInversion, scaleType.getString());
	    if (scaleType.isPrimary()) {
		var scaleDegreeTypeString = scaleType.getScaleDegreeTypeString();
		var note = new Note(sortedValueArray[n]);
		return note.getString() + ' ' + scaleType.getString();
	    }
	}
    },

    getNumNotes: function() {
	return this.valueArray.length
    },

    getParentsOfSize: function(size) {
	var length = this.valueArray.length;
	if (length === size) {
	    return this;
	}
	if (length > size) {
	    return;
	}
	if (length > 12) {
	    return;
	}
	var scalesByKey = {};
	var modValueArray = this.getValueArray(true);
	for (var i = 0; i < 12; i++) {
	    if (modValueArray.indexOf(i) === -1) {
		var newValueArray = modValueArray.slice(0); // shallow clone
		newValueArray.push(i);
		var scale = new Scale(newValueArray, true);
		if (size === length + 1) {
		    var key = scale.getString();
		    scalesByKey[key] = scale;
		} else {
		    var grandParents = scale.getParentsOfSize(size);
		    for (var grandParentKey in grandParents) {
			scalesByKey[grandParentKey] = grandParents[grandParentKey];
		    }
		}
	    }
	}
	return scalesByKey;
    },

    getChildrenOfSize: function(size, groupByScaleType, groupByScaleTypeNumber) {
	var length = this.valueArray.length;
	if (length === size) {
	    return this;
	}
	if (length < size) {
	    return;
	}
	if (length < 2) {
	    return;
	}
	var scalesByKey = {};
	var modValueArray = this.getValueArray(true);
	for (var i = 0; i < 12; i++) {
	    var index = modValueArray.indexOf(i);
	    if (index !== -1) {
		var newValueArray = this.removeArrayAtIndex(modValueArray, index);
		var scale = new Scale(newValueArray, true);
		if (size === length - 1) {
		    var key = scale.getString(true);
		    scale = new Scale(key);
		    scalesByKey[key] = scale;
		} else {
		    var grandChildren = scale.getChildrenOfSize(size);
		    for (var grandChildKey in grandChildren) {
			scalesByKey[grandChildKey] = grandChildren[grandChildKey];
		    }
		}
	    }
	}
	if (groupByScaleType) {
	    return this.groupByScaleType(scalesByKey, groupByScaleTypeNumber);
	}
	return scalesByKey;
    },

    groupByScaleType: function(scalesByKey, groupByScaleTypeNumber) {
	var groupScales = {};
	for (var scaleKey in scalesByKey) {
	    var scale = scalesByKey[scaleKey];
	    var scaleType = scale.getScaleType();
	    var scaleTypeString = scaleType.getString();
	    if (!groupScales[scaleTypeString]) {
		groupScales[scaleTypeString] = {};		
	    }
	    groupScales[scaleTypeString][scaleKey] = scale;
	}
	if (groupByScaleTypeNumber) {
	    return this.groupByScaleTypeNumber(groupScales);
	}
	return groupScales;
    },

    groupByScaleTypeNumber: function(groupScales) {
	var numGroupScales = {};
	var counts = {};
	for (var scaleTypeKey in groupScales) {
	    var count = 0;
	    for (var scaleKey in groupScales[scaleTypeKey]) {
		count++;
	    }
	    counts[scaleTypeKey] = count;
	}
	for (var scaleTypeKey in counts) {
	    var count = counts[scaleTypeKey];
	    numGroupScales[count] = {};
	}
	for (var scaleTypeKey in groupScales) {
	    var count = counts[scaleTypeKey];
	    if (!numGroupScales[count][scaleTypeKey]) {
		numGroupScales[count][scaleTypeKey] = {};
	    }
	    for (var scaleKey in groupScales[scaleTypeKey]) {
		var scale = groupScales[scaleTypeKey][scaleKey];
		numGroupScales[count][scaleTypeKey][scaleKey] = scale;
	    }
	}
	return numGroupScales;
    },

    getScaleType: function() {
	return this.scaleType;
    },

    isPrimary: function() {
	return this.scaleType.isPrimary();
    },

    getInversions: function() {
	var beforePrimaryInversions = [];
	var inversions = [];
	var primaryFound = false;
	for (var n = 0; n < this.valueArray.length; n++) {
	    var nthInversion = this.getNthInversion(n, this.valueArray);
	    var scaleType = new ScaleType(nthInversion);
	    var scaleDegreeTypeString = scaleType.getScaleDegreeTypeString();
	    var note = new Note(this.valueArray[n]);
	    var scaleString = note.getString(true) + ' ' + scaleDegreeTypeString;
	    var scale = new Scale(scaleString);
	    if (scale.isPrimary() || primaryFound) {
		primaryFound = true;
		inversions.push(scale);
	    } else {
		beforePrimaryInversions.push(scale);
	    }
	}
	return inversions.concat(beforePrimaryInversions);
    },

    getNoteString: function(mod) {
	var notes = [];
	for (var n = 0; n < this.valueArray.length; n++) {
	    var value = this.valueArray[n];
	    if (mod) {
		value = value % 12;
	    }
	    var note = new Note(value);
	    notes.push(note.getString());
	}
	return notes.join(' ');
    },

    getScaleDegreeValue: function(note) {
	var noteValue = note.getValue();
	var startNoteValue = this.note.getValue();
	var scaleDegreeValue = (12 + noteValue - startNoteValue) % 12;
	return scaleDegreeValue;
    },

    containsNotes: function(notes, mod) {
	for (var i =0; i < notes.length; i++) {
	    var note = notes[i];
	    if (!this.containsNote(note, mod)) {
		return false;
	    }
	}
	return true;
    },
    containsNote: function(note, mod) {
	var noteValue = note instanceof Note ? note.getValue() : note;
	for (var i = 0; i < this.valueArray.length; i++) {
	    if (mod && this.valueArray[i] % 12 === noteValue % 12) {
		return true;
	    } else if (this.valueArray[i] === noteValue) {
		return true;
	    }
	}
	return false;
    },

    getScaleDegreeString: function() {
	return this.note.getString() + ' ' + this.scaleType.getScaleDegreeTypeString();
    },

    getScaleTypeString: function() {
	return this.scaleType.getString();
    },

  getNthInversion: function (n, array) {
    array = array.slice(0); //shallow clone
    for (var i = 0; i < n; i++) {
      var element = array.shift();
      array.push(element + 12);
    }
    if (array.length > 0 && array[0] > 0) {
      var diff = array[0];
      for (var i = 0; i < array.length; i++) {
          array[i] = (12 + array[i] - diff) % 12;
      }
    }
    return array;
  },

    setInversion: function(inversionNum) {
	var noteValue = this.note.getValue();
	var newNote = new Note(this.valueArray[inversionNum]);
	var newNoteValue = newNote.getValue();
	inversionArray = this.getNthInversion(inversionNum, this.valueArray);
	this.valueArray = [];
	this.note = newNote;
	for (var i = 0; i < inversionArray.length; i++) {
	    var note = new Note(inversionArray[i]);
	    var note = new Note((inversionArray[i] + newNoteValue ) % 12);
	    this.valueArray.push(note.getValue());
	}
	this.scaleType = new ScaleType(this.valueArray);
	this.scaleString = this.note.getString() + ' ' + this.scaleType.getString();
    },

    getPositionsFromInstrument: function(instrument, maxMuted, maxFretSpan) {
	var instrumentValueArray = instrument.getValueArray();
	var maxFret = instrument.getMaxFret();
	//console.log(instrument.buildChordDatabase(5));
    },

    getNumOpenStringsFromInstrument: function(instrument) {
	
    },

    getParentScales: function() {
	var parentScales = [];
	for (var i = 0; i< 12; i++) {
//	    if (
	}
    },

    addNote: function(note) {
	var value = note.getValue();
	this.valueArray.push(value);
	this.valueArray = this.getUniqueArray(this.valueArray);
	this.valueArray.sort(function(a,b){return a-b});
	this.note = new Note(this.valueArray[0]);
	this.scaleType = new ScaleType(this.valueArray);
	this.scaleString = this.note.getString() + ' ' + this.scaleType.getString();
    },

    removeNote: function(note) {
	var value = note.getValue();
	for (var i = this.valueArray.length - 1; i >= 0; i--) {
	    if (this.valueArray[i] === value) {
		this.valueArray.splice(i, 1);
	    }
	}
	this.valueArray = this.getUniqueArray(this.valueArray);
	this.valueArray.sort(function(a,b){return a-b});
	this.note = new Note(this.valueArray[0]);
	this.scaleType = new ScaleType(this.valueArray);
	this.scaleString = this.note.getString() + ' ' + this.scaleType.getString();
    },

    addScaleDegreeValue: function(scaleDegreeValue) {
	this.scaleType.addScaleDegreeValue(scaleDegreeValue);
	this.calculateScaleFromScaleType();
    },

    removeScaleDegreeValue: function(scaleDegreeValue) {
	this.scaleType.removeScaleDegreeValue(scaleDegreeValue);
	this.calculateScaleFromScaleType();
    },

    calculateScaleFromScaleType: function() {
	this.valueArray = [this.note.getValue()];
	if (this.scaleType.getString() === 'PU') {
	    this.perfectUnison = true;
	}
	this.scaleString = this.note.getString() + ' ' + this.scaleType.getString();
	if (this.perfectUnison) {
	    return;
	}
	var scaleTypeValueArray = this.scaleType.getValueArray();
	var noteValue = this.note.getValue();
	var self = this;
	var mapFunction = function(scaleTypeValue) {
	    self.valueArray.push(scaleTypeValue + noteValue);
	};
	scaleTypeValueArray.map(mapFunction);
	this.valueArray = this.getUniqueArray(this.valueArray);
    }


});