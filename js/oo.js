$bk = {
    redraw: function() {
	console.log('bk redraw');
	$('#scaleFretboardTool').scaleFretboardTool('redraw');	
    }

};

$bk.scale = new Scale('C Maj');

$(function() {
    $('#scaleFretboardTool').scaleFretboardTool();
});

$(window).on('resize', function() {
    $bk.redraw();
})

$bk.instrument = new Instrument('G0,19 C0,19 E0,19 A0,19');

//var scaleType = new ScaleType();
//console.log(scaleType.getScaleTypeData());
//console.log(instrument.getValueArray());

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


//scale = new Scale(chord.getString(true));
//console.log(scale.getString(true));

//var scaleType = new ScaleType();
//console.log(scaleType.getScaleTypesBySize(5));

//var scale = new Scale("C Eb G A Bb" /*C b3 5 6 b7"*/);
//console.log(scale.getString());
//console.log(scale.getValueArray());
//console.log(scale.getNoteString());

//var scale = new Scale("G C E A");
//console.log(scale.getString(true));
//console.log(scale.getValueArray(true));;
//console.log(scale.getNoteString());


//var scale = new Scale("A B C D E F G");
//console.log(scale.getString());
//console.log(scale.getChildrenOfSize(3, true, true));

/*var inversions = scale.getInversions();
for (var i = 0; i < inversions.length; i++) {
    var scale = inversions[i];
    
    console.log(scale.getString() + ( scale.isPrimary() ? ' primary' : '') +':');
    console.log(scale.getScaleDegreeString(true));
}

*/

var scale = new Scale("C Scri");
var ukulele = new Instrument('G0,12 C0,12 E0,12 A0,12');

//var chordsByPosition = ukulele.buildChordDatabase(5);
//console.log(chordsByPosition);

//var chord = ukulele.getChordFromPosition('0 0 5 3');
//console.log(chord.getString(true));
//console.log(chord.getNoteString());


//var scale = new Scale("Bb PU", true);
//console.log(scale.getString());

/*
var definedPositions = {};
var positions = ukulele.getPositionsAtFret(2, 5);
for (var i = 0; i < positions.length; i++) {
    var position = positions[i];
    var chord = ukulele.getChordFromPosition(position);
    definedPositions[position] = chord.getString(true);
}
console.log(definedPositions);
*/

//var scale = new Scale("C Scri");
//
//var chord = new Chord(ukulele.getChordFromPosition('2 2 2 0').getString());
//console.log(chord.getString());
//var scaleChord = new ScaleChord(chord, scale);
//console.log(scaleChord.getString());

//console.log(scale.getChildrenOfSize(3, true, true));

//var chord = ukulele.getChordFromPosition('0 0 0 0');
//console.log(chord.getScaleString(true));