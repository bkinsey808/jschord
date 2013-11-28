var instrument = new Instrument('G0,12 C0,12 E0,12 A0,12');
console.log(instrument.getValueArray());

//var note = new Note(14);
//console.log(note.getString());

//var scale = new Scale([8, 1,8, 4,8, 4]);
//console.log(scale.getString());
//console.log(scale.getValueArray());

//var scaleType = new ScaleType([0, 3, 9, 11]);
//var scaleType = new ScaleType('C Db Eb F G A B');
//console.log(scaleType.getScaleDegreeTypeString()); //true means get primary
//console.log(scaleType.getString()); 
//console.log(scaleType.getModes()); 

//var scaleType = new ScaleType([0, 3, 7]);
//var scaleType = new ScaleType([0, 4, 9]);
//var chord = new Chord('C D E C2');

//console.log(chord.getString());
//console.log(chord.getScaleString());

//console.log(scaleType.getNthInversion(2, [0, 4, 9]));

//var scaleDegreeType = new ScaleDegreeType([11]);
//console.log(scaleDegreeType.getValue());
//console.log(scaleDegreeType.getString());

//var noteType = new Note([26]);
//console.log(noteType.getValue());
//console.log(noteType.getString());

//var instrument = new Instrument('G1 C1 E1 A1');
//console.log(instrument.getValueArray());

//var scale = new Scale([0, 3, 9, 11, 12]);
//var scaleType = new ScaleType('C Db Eb F G A B');
//console.log(scaleType.getScaleDegreeTypeString()); //true means get primary
//console.log(scale.getString()); 
//console.log(scaleType.getModes()); 

//var chord = new Chord([0, 3, 9, 11, 12]);
//var scaleType = new ScaleType('C Db Eb F G A B');
//console.log(scaleType.getScaleDegreeTypeString()); //true means get primary
//console.log(chord.getString()); 
//console.log(scaleType.getModes()); 
//console.log(chord.getScaleString()); 

//console.log(instrument.getValueArray());
var chord = new Chord(instrument.getChordFromPosition('2 2 2 0').getString());
console.log(chord.getString(true));
//scale = new Scale(chord.getString(true));
//console.log(scale.getString(true));