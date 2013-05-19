var ScaleDegreeType = Class({

  init: function(argument) {
    if (argument instanceof Array) {
      for (var scaleDegreeTypeString in this.scaleDegreeTypeValues) {
        if (this.scaleDegreeTypeValues[scaleDegreeTypeString] == argument[0] 
            && !scaleDegreeTypeString.match(/#/)) {
          argument = scaleDegreeTypeString;
          break;
        }
      }
    }
    if (argument == "1") {
      this.scaleDegreeTypeString = "1";
    } else if (this.scaleDegreeTypeValues[argument]) {
      this.scaleDegreeTypeString = argument;
    } else {
      //console.log('argument: ' + argument);
      this.scaleDegreeTypeString = null; // do something;
    }
  },

  getString: function() {
    return this.scaleDegreeTypeString;
  },

  getValue: function() {
    return this.scaleDegreeTypeValues[this.scaleDegreeTypeString];
  },

  scaleDegreeTypeValues : {
    "1":  0,
    "#1": 1,
    "b2": 1,
    "2":  2,
    "#2": 3,
    "b3": 3,
    "3":  4,
    "4":  5,
    "#4": 6,
    "b5": 6,
    "5":  7,
    "#5": 8,
    "b6": 8,
    "6":  9,
    "#6": 10,
    "b7": 10,
    "7":  11
  },
});
