var NoteType = Class({

  init: function(argument) {
    if (argument instanceof Array) {
      var value = argument[0] % 12;
      for (var key in this.noteTypeValues) {
        var noteTypeValue = this.noteTypeValues[key];
        if (noteTypeValue == value) {
          argument = value;
        }        
      }
    }
    if (argument == parseInt(argument) || argument.match(/^\d+$/)) {
      var noteTypeInt = parseInt(argument) % 12;
      for (var key in this.noteTypeValues) {
        var noteTypeValue = this.noteTypeValues[key];
        if (noteTypeValue == noteTypeInt && !key.match(/#/)) {
          this.noteTypeString = key;
        }
      }
    } else if (this.noteTypeValues[argument] != null) {
      this.noteTypeString = argument;
    } else {
      var matches = argument.match(/([ABCDEFGb#]+)(\d+)/);
      this.noteTypeString = matches[1];
    }
  },

  getString: function() {
    return this.noteTypeString;
  },

  getValue: function() {
    return this.noteTypeValues[this.noteTypeString];
  },

  noteTypeValues : {
    "C":  0,
    "C#": 1,
    "Db": 1,
    "D":  2,
    "D#": 3,
    "Eb": 3,
    "E":  4,
    "F":  5,
    "F#": 6,
    "Gb": 6,
    "G":  7,
    "G#": 8,
    "Ab": 8,
    "A":  9,
    "A#": 10,
    "Bb": 10,
    "B":  11
  },
});
