var Note = Class({

  init: function(argument) {
    this.octave = this.getOctaveFromArgument(argument);
    this.noteType = this.getNoteTypeFromArgument(argument);
  },

  getNoteTypeFromArgument: function(argument) {
    return new NoteType(argument);
  },

  getOctaveFromArgument: function(argument) {
    var octave = 0;
    if (argument instanceof Array) {
      argument = argument[0];
    }
    if (argument == parseInt(argument) || argument.match(/^\d+$/)) {
      octave = Math.floor(parseInt(argument) / 12);
    } else {
      var matches = argument.match(/([ABCDEFGb#]+)(\d+)/);
      if (matches) {
        octave = parseInt(matches[2]);
      }
    }
    return octave;
  },

    getString: function(mod) {
	if (mod) {
	    return this.noteType.getString();
	}
	return this.noteType.getString() + (this.octave ? this.octave : '') ;
    },

  getValue: function() {
    return parseInt(this.noteType.getValue()) + parseInt(this.octave) * 12;
  }
});
