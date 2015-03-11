var Chord = Class({

  include: AppMixin,

    init: function(argument) {
      //console.log(argument);
    if (!(argument instanceof Array)) {
      argument = this.convertArgumentFromString(argument);
    }
	this.valueArray = this.getUniqueArray(argument);
	this.valueArray.sort(function(a,b){return a-b});
	//console.log(this.valueArray);
  },

  convertArgumentFromString: function(string) {
    var noteStringArray = string.split(' ');
    var valueArray = [];
    for (var i = 0; i < noteStringArray.length; i++) {
      var noteString = noteStringArray[i];
      var note = new Note(noteString);
      var noteValue = note.getValue();
      valueArray.push(noteValue);
    }
    return valueArray;
  },

  getString: function(primary) {
    if (primary) {
      return this.getScaleString(true);
    }
    var noteStringArray = [];
    for (var i = 0; i < this.valueArray.length; i++) {
      var value = this.valueArray[i];
      var note = new Note(value);
      var noteString = note.getString();
      noteStringArray.push(noteString);
    }
    return noteStringArray.join(' ');
  },

  getScaleString: function(primary) {
      var scale = new Scale(this.valueArray, primary);
      return scale.getString(primary);
  },

    getScale: function(primary) {
//	var string = this.getString(primary);
//	console.log(string);
//	console.log(this.valueArray);
	var scale = new Scale(this.valueArray, primary);
	return scale;
    },

    getScaleType: function(primary) {
	var string = this.getString();
	var scale = new Scale(string, primary);
	var scaleType = scale.getScaleType(primary);
	return scaleType;
    },

    getScaleTypeString: function(primary) {
	var string = this.getString(primary);
	var scale = new Scale(string);
	var scaleType = scale.getScaleType();
	var scaleTypeString = scaleType.getString();
	return scaleTypeString;
    },

    getSpelling: function(primary) {
	var string = this.getString(primary);
	var scale = new Scale(string);
	var scaleType = scale.getScaleType();
	return scaleType.getScaleDegreeTypeString();
    },

    getScaleNoteString: function(primary) {
	var string = this.getString(primary);
	//console.log(string);
	var scale = new Scale(string, primary);
	var note = scale.getNote();
	var noteString = note.getString();
	return noteString;
    },

    getNoteString: function() {
	var noteStrings = [];
	for (var i = 0; i< this.valueArray.length; i++) {
	    var note = new Note(this.valueArray[i]);
	    noteStrings.push(note.getString());
	}
	return noteStrings.join(' ');
    },

    getNote: function() {
	var noteValue = this.valueArray[0];

	return new Note(noteValue);
    },

  getValueArray: function() {
    return this.valueArray;
  }
});

/*



 11 
1  1
    11
   
 

  22
22  2
     2
    




*/