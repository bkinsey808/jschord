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
  },
  getValueArray: function() {
    var valueArray = [];
    for (var i = 0; i < this.stringArray.length; i++) {
      var string = this.stringArray[i];
      var stringValueArray = string.getValueArray();
      for (var j = stringValueArray.length; j <= this.lastFret; j++) {
        stringValueArray[j] = null;
      }
      valueArray.push(stringValueArray);
    }    
    return valueArray;
  },
  getString: function() {
    return this.scaleString;
  }
});