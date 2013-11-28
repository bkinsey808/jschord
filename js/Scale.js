var Scale = Class({

  include: AppMixin,

  init: function(argument) {
    if (argument instanceof Array) {
      var array = this.getUniqueArray(argument);
      array.sort(function(a,b){return a-b});
      this.note = new Note(array[0]);
      this.scaleType = new ScaleType(array);
    } else {
      var matches = argument.match(/([ABCDEFGb#\d]+)( [ABCDEFGb#\d]+)+/);
      if (matches) {
        this.note = new Note(matches[1]);
        this.scaleType = new ScaleType(argument);
      } else {
        var matches = argument.match(/([ABCDEFGb#\d]+) (.*)/);
        if (!matches) return;
        this.note = new Note(matches[1]);
        this.scaleType = new ScaleType(matches[2]);
      }
    }
    this.scaleString = this.note.getString() + ' ' + this.scaleType.getString();
    var scaleTypeValueArray = this.scaleType.getValueArray();
    var noteValue = this.note.getValue();
    this.valueArray = [];
    var self = this;
    var mapFunction = function(scaleTypeValue) {
      self.valueArray.push(scaleTypeValue + noteValue);
    };
    scaleTypeValueArray.map(mapFunction);
  },

  getValueArray: function() {
    return this.valueArray;
  },

  getString: function(primary) {
    if (!primary) {
      return this.scaleString;
    }
    for (var n = 1; n < this.valueArray.length; n++) {
      var nthInversion = this.getNthInversion(n, this.valueArray);
      var scaleType = new ScaleType(nthInversion);
      if (scaleType.isPrimary()) {
        var self = this;
        var noteValue = this.valueArray[n];
        var newArray = [];
        var mapFunction = function(scaleTypeValue) {
          newArray.push(scaleTypeValue + noteValue);
        };
        this.valueArray.map(mapFunction);
        var newScale = new Scale(newArray);
        return newScale.getString();
      }
    }
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
    
  }
});