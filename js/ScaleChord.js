var ScaleChord = Class({

  include: AppMixin,

    init: function(scale, chord) {
	var scaleString = scale.getString(true);	
	this.scale = new Scale(scaleString, true);
	this.chord = chord;
    },

    getString: function() {
	var scaleTypeString = this.scale.getScaleTypeString();
	var note = this.scale.getNote();
	var noteValue = note.getValue() % 12;
	var scaleDegree = this.getScaleDegreeFromValue(noteValue);
	return scaleDegree + ' ' + scaleTypeString;
    },

    getScaleDegreeFromValue: function(value) {
	for (var scaleDegreeKey in this.scaleDegrees) {
	    var scaleDegreeValue = this.scaleDegrees[scaleDegreeKey];
	    if (scaleDegreeValue === value) {
		return scaleDegreeKey;
	    }
	}
    },

    scaleDegrees : {
	"I":    0,
	"bII":  1,
	"II":   2,
	"bIII": 3,
	"III":  4,
	"IV":   5,
	"bV":   6,
	"V":    7,
	"bVI":  8,
	"VI":   9,
	"bVII": 10,
	"VII":  11
    }

});
