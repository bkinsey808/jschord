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

  getChordFromPosition: function(position) {
    var positionArray = position.split(' ');
    var noteNumArray = [];
    for (var i = 0; i < positionArray.length; i++) {
      var fret = positionArray[i];
      if (positionArray == 'x') continue;
      var fretNum = parseInt(fret);
      noteNumArray.push(this.valueArray[i][fretNum]);
    }
    var chord = new Chord(noteNumArray);
    return chord;
  }
});
