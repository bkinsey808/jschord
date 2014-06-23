var Scale = Class({

  include: AppMixin,

    init: function(argument, makePrimary) {
	this.valueArray = [];
	if (argument instanceof Array) {
	    var array = this.getUniqueArray(argument);
	    array.sort(function(a,b){return a-b});
	    this.note = new Note(array[0]);
	    this.scaleType = new ScaleType(array);
	} else {
	    var matches = argument.match(/([ABCDEFG]b?#?\d?)( ([ABCDEFG]b?#?\d?)+)/);
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
	var length = this.valueArray.length;
	for (var n = 0; n < length; n++) {
	    var nthInversion = this.getNthInversion(n, this.valueArray);
	    var scaleType = new ScaleType(nthInversion);
	    if (scaleType.isPrimary()) {
		var scaleDegreeTypeString = scaleType.getScaleDegreeTypeString();
		var note = new Note(this.valueArray[n]);
		return note.getString() + ' ' + scaleType.getString();
	    }
	}
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
        array[i] -= diff;
      }
    }
    return array;
  },

    getPositionsFromInstrument: function(instrument, maxMuted, maxFretSpan) {
	var instrumentValueArray = instrument.getValueArray();
	var maxFret = instrument.getMaxFret();
	
    },

    getNumOpenStringsFromInstrument: function(instrument) {
	
    },

    getParentScales: function() {
	var parentScales = [];
	for (var i = 0; i< 12; i++) {
//	    if (
	}
    }
});