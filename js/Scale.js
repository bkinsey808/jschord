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

  getString: function() {
    return this.scaleString;
  }
});

/*

homelessness is not a crime!


*/
