var Chord = Class({

  include: AppMixin,

  init: function(argument) {
    if (!(argument instanceof Array)) {
      argument = this.convertArgumentFromString(argument);
    }
    this.valueArray = this.getUniqueArray(argument);
    this.valueArray.sort(function(a,b){return a-b});
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
    var string = this.getString();
    var scale = new Scale(string);
    return scale.getString(primary);
  },

  getValueArray: function() {
    return this.valueArray;
  }
});
