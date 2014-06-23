//terminology

// sci: A -
// scit: -
// scid: b3 5
// fscid: 1 b3 5
// dn: 3 7
// fdn: 1 3 7

var $bkc = {};

$bkc.notes =   ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
$bkc.degrees = ['1', 'b2', '2', 'b3', '3', '4', 'b5', '5', 'b6', '6', 'b7', '7'];

$bkc.scits = {
  "PU": { scid: "",                    names: [ "Perfect Unison" ]},
  "-2": { scid: "b2",                  names: [ "Minor Second" ]}, 
  "M2": { scid: "2",    primary: true, names: [ "Major Second" ]}, 
  "-3": { scid: "b3",   primary: true, names: [ "Minor Third" ]}, 
  "3":  { scid: "3",    primary: true, names: [ "Major Third" ]}, 
  "P4": { scid: "4",                   names: [ "Perfect Fourth" ]}, 
  "T":  { scid: "T",    primary: true, names: [ "Tritone" ]}, 
  "P5": { scid: "5",    primary: true, names: [ "Perfect Fifth" ]}, 
  "-6": { scid: "b6",                  names: [ "Minor Sixth" ]}, 
  "6":  { scid: "6",                   names: [ "Major Sixth" ]}, 
  "-7": { scid: "b7",                  names: [ "Minor Seventh" ]}, 
  "7":  { scid: "7",    primary: true, names: [ "Major Seventh" ]},
  "M":  { scid: "3 5",  primary: true, names: [ "Minor Chord" ]},
  "-":  { scid: "b3 5", primary: true, names: [ "Major Chord" ]}
};

$bkc.instruments = {
  "Ukulele": '0G1 0C1 0E1 0A1',
  "Guitar":  '01E 01A 01D 1G0 1B0 1E0'
};


$bkc.get_note_number_from_note_letter = function(note_letter) {
  for (var i = 0; i < $bkc.notes.length; i++) {
	  if (note_letter == $bkc.notes[i]) return i;
  }
};
console.log($bkc.get_note_number_from_note_letter('D'));


$bkc.get_note_from_note_number = function(note_number) {
  var octave = Math.floor(note_number / 12);
  var note_letter = $bkc.notes[note_number % 12];
  return note_letter + octave;
};
console.log($bkc.get_note_from_note_number(12));


$bkc.get_degree_number_from_degree = function(degree) {
  var i = 0;
  for (var i = 0; i < $bkc.degrees.length;i++) {
    var compare_degree = $bkc.degrees[i];
	  if (compare_degree == degree) return i;
  }
};
console.log($bkc.get_degree_number_from_degree('5'));

$bkc.get_degree_from_degree_number = function(degree_number) {
  return $bkc.degrees[degree_number % 12];
};


$bkc.get_degree_from_degree_number = function(degree_number) {
  degree_number = degree_number % 12;
  return $bkc.degrees[degree_number];
};
console.log($bkc.get_degree_from_degree_number('5'));


// not used yet
$bkc.get_scit_modes_from_scit = function(scit) {
  degrees_array = $bkc.scits[scit].degrees.split(' ');
  var modes = {}
  for (var i = 0; i < degrees_array.length; i++) {
	  var degree = degrees_array[i];
	  modes[degree] = $bkc.get_mode_at_degree_from_scit(scit, degree);
  }
  return modes;
};

// dn   '3 7'
// scid 'b3 5'
$bkc.get_dn_from_scid = function(scid) {
  var scid_array = scid.split(' ');
  var dn_array = [];
  for (var i = 0; i < scid_array.length; i++) {
	  var degree = scid_array[i];
	  dn_array[i] = $bkc.get_degree_number_from_degree(degree);
  }
  return dn_array.join(' ');
};


$bkc.get_scid_from_dn = function(dn) {
  var degree_numbers_array = dn.split(' ');
  var degrees_array = [];
  for (var i = 0; i < degree_numbers_array.length; i++) {
	  var degree_number = degree_numbers_array[i];
	  degrees_array[i] = $bkc.get_degree_from_degree_number(degree_number);
  }
  return degrees_array.join(' ');
};


$bkc.get_mode_at_degree_from_scid = function(scid, degree) {
  var scid_array = scid.split(' ');
  var fscid = '1 ' + scid;
  var fscid_array = fscid.split(' ');
  var fdn = $bkc.get_dn_from_scid(fscid);
  var fdn_array = fdn.split(' ');
  var shift_array = fdn_array;
  for (var i = 0; i < fdn_array.length; i++) {
	  degree_number = parseInt(shift_array.shift());
	  shift_array.push(degree_number + 12);
	  var subtract_number = parseInt(shift_array[0]);
	  for (j = 0; j < shift_array.length; j++) {
	    shift_array[j] = parseInt(shift_array[j]) - subtract_number;
	  }
	  if (scid_array[i] == degree) {
	    shift_array.shift();
	    var mode_dn = shift_array.join(' ');
	    return $bkc.get_scid_from_dn(mode_dn);
	  }
  }
};
console.log('get_mode_at_degree_from_scid(\'b3 5\', \'b3\')' + $bkc.get_mode_at_degree_from_scid('b3 5', 'b3'));
console.log('get_mode_at_degree_from_scid(\'b3 5\', \'5\')' + $bkc.get_mode_at_degree_from_scid('b3 5', '5'));
console.log('get_mode_at_degree_from_scid(\'3 5\', \'3\')' + $bkc.get_mode_at_degree_from_scid('3 5', '3'));
console.log('get_mode_at_degree_from_scid(\'3 5\', \'5\')' + $bkc.get_mode_at_degree_from_scid('3 5', '5'));


$bkc.get_modes_from_scid = function(scid) {
  modes = [];
  var scid_array = scid.split(' ');
  for (var i = 0; i < scid_array.length; i++) {
    var degree = scid_array[i];
    modes.push($bkc.get_mode_at_degree_from_scid(scid, degree));
  }
  return modes;
};
console.log('get_modes_from_scid(3, 5) ' + $bkc.get_modes_from_scid('3 5'));


$bkc.get_dn_from_scid = function(scid) {
  scid_array = scid.split(' ');
  var dn_array = [];
  for (var i = 0; i < scid_array.length; i++) {
	  var degree = scid_array[i];
	  dn_array[i] = $bkc.get_degree_number_from_degree(degree);
  }
  return dn_array.join(' ');
};
console.log($bkc.get_dn_from_scid('b3 5'));

 

var position = '0 2 2 2';

$bkc.get_note_for_string_def_at_fret = function(string_def, fret) {
    fret = parseInt(fret);
    console.log('string_def: ' + string_def + ' fret: ' + fret);
    var match = string_def.match(/(\d+)(C|C#|D|D#|E|F|F#|G|G#|A|A#|B)(\d+)/);
    var start_fret = match[1];
    var note_letter = match[2];
    var octave = parseInt(match[3]);
    var note_number = octave * 12 + fret + $bkc.get_note_number_from_note_letter(note_letter);
    return $bkc.get_note_from_note_number(note_number);
};
console.log('get_note_for_string_def_at_fret(\'0C0\', 2) = ' + $bkc.get_note_for_string_def_at_fret('0C0', 2));


$bkc.get_notes_for_instrument_at_position = function(instrument, position) {
  var i = 0;
  var position_array = position.split(' ');
  console.log($bkc.instruments[instrument]);
  var string_def_array = $bkc.instruments[instrument].split(' ');
  var notes_for_position_array = [];
  for (var i = 0; i < position_array.length; i++) {
	  var fret = position_array[i];
	  var string_def = string_def_array[i];
	  notes_for_position_array[i] = $bkc.get_note_for_string_def_at_fret(string_def, fret);
  }
  return notes_for_position_array.join(' ');
};
console.log('get_notes_for_instrument_at_position(\'Ukulele\', \'0 2 2 2\') = ' + $bkc.get_notes_for_instrument_at_position('Ukulele', '0 2 2 2'));

$bkc.sort_notes = function(notes) {
  var note_numbers = $bkc.get_note_numbers_from_notes(notes);
  var note_numbers_array = note_numbers.split(' ');
  var sorted_note_numbers_array = note_numbers_array.sort();
  var note_numbers = $bkc.get_notes_from_note_numbers(sorted_note_numbers_array);
  return note_numbers;
};


$bkc.get_note_numbers_from_notes = function(notes) {
  var notes_array = notes.split(' ');
  var note_numbers_array = [];
  for (var i = 0; i < notes.length; i++) {
	  var note = notes[i];
	  note_numbers_array[i] = $bkc.get_note_number_from_note(note);
  }
  return note_numbers_array.join(' ');
};


$bkc.get_notes_from_note_numbers = function(note_numbers) {
  var note_numbers_array = notes.split(' ');
  var notes_array = [];
  for (var i = 0; i < note_numbers.length; i++) {
	  var note_number = note_numbers[i];
	  notes_array[i] = $bkc.get_note_from_note_number(note_number);
  }
  return notes_array.join(' ');
};


$bkc.get_note_number_from_note = function(note) {
  var match = note.match(/(C|C#|D|D#|E|F|F#|G|G#|A|A#|B)(\d+)/);
  if (match) {
	  var note_letter = match[1];
	  var octave = parseInt(match[2]);
	  console.log(note_letter);
	  return octave * 12 + $bkc.get_note_number_from_note_letter(note_letter);
  }
  return $bkc.get_note_number_from_note_letter(note);
};
console.log($bkc.get_note_number_from_note('D2'));


$bkc.get_note_number_from_octave_and_note_letter = function(octave, note_letter) {
  for (var i = 0; i < 12; i++) {
	  if ($bkc.note[i] == note_letter) return octave * i;
  }
}

$bkc.get_string_def_from_position_and_instrument = function(position, instrument) {
  var string_def_array = instrument.split(' ');
  return string_def_array(position);
};

$bkc.get_sub_scids_from_scid_of_length = function(scid, length) {
  var scid_array = scitd.split(' ');
  for (var i = 0; i < scid_array.length; i++) {
	  var degree = scid_array[i];
	  var mode = $bkc.get_mode_at_degree_from_scid(scid, degree);
	  for (var j = 2; j < length; j++) {
	    
	  }
  }
};

$bkc.get_sub_scitds_from_scitd = function(scitd) {
  var scitd_array = scitd.split(' ');
  var sub_scitds = [];
  for (var i = 2; i < scitd_array.length - 1; i++) {
	  sub_scitds[i] = $bkc.get_sub_scitds_of_scitd_of_length(scitd, i);
  }
  return sub_scitds[i];
};

// scit: -
// scid: b3 5
$bkc.get_scid_from_scit = function(scit) {
  return $bkc.scits[scit].scid;
};

$bkc.get_notes_from_sci = function(sci) {
  var sci_parts = sci.split(' ');
  var notes_array = [];
  notes_array[0] = sci_parts[0];
  var scti = sci_parts[1];
//    var scid = $bkc.get_scid_from_scit[];

  return notes_array.join(' ');  
};

$bkc.get_positions_from_sci_and_instrument = function(sci, instrument, start_fret, end_fret) {
  console.log('sci: ' + sci);
  console.log('instrument: ' + instrument);
  console.log('start_fret: ' + start_fret);
  console.log('end_fret: ' +   end_fret);
  var notes_from_sci = $bkc.get_notes_from_sci;
  console.log('notes_from_sci ' + notes_from_sci);
};

/*
oct1 note1 fret oct2 note2
0    0     0    0    0
0    0     12   1    0
0    0     13   1    1
0    11    1    2    0
oct2  = oct1  + int(fret/12)
note2 = (note1 + fret) % 12 
*/

/*

C Eb G
Eb (E, F, F#) G (G#, A,  A#, B)  C (C#, D, 
1  b2  2  b3  3  4   b5  5   b6  6  b7  7
0  1   2  3   4  5   6   7   8   9  10  11

G (G#, A,  A#, B)  C (C#, D) Eb (E, F, F#) 
1  b2  2  b3  3    4   b5  5    b6  6  b7  7
0  1   2  3   4    5   6   7    8   9  10  11


C   E  G A
C*  E  G A
C* *E  G A
C* *E *G A
C* *E *G A*
C* *E *G A*
C*  E* G A
C*  E* G A*
C*  E *G A*
C*  E *G A
C*  E  G A*
C*  E  G A
C * E* G A*
C * E* G A *
C * E* G A
C * E *G A*
C * E *G A *
C * E *G A 
C * E  G A*
C * E  G A *
C * E  G A 
C * E  G A*
C * E  G A *
C  *E *G A*
C  *E *G A *
C  *E *G A
C  *E  G A*
C  *E  G A *
C   E* G A* 
C   E* G A *
C   E* G A
C   E *G A*
C   E *G A *
C   E *G A
C   E  G A*
C   E  G A *

*/