$.widget('bk.scaleTool', {

    options: {
	headerRow: false
    },

    headerFields : [
	{ value:'SD', title:'Scale Degree', width: 40 },
	{ value:'N',  title:'Note', width: 30 },
	{ value:'NN', title:'Note Number', width: 30 },
	{ value:'Mode', title:'Mode', width: 130 },
	{ value:'MS', title:'Mode Scale Degrees', width: 200 },
	{ value:'MName', title:'Mode Name', width: 220 },
	{ value:'C', title:'Mode Name', width: 30 },
	{ value:'Chord', width: 130 },
    ],

    scaleDegrees : [
	{ scaleDegree: "I",   title: "First" },
	{ scaleDegree: "bII", title: "Flat Second" },
	{ scaleDegree: "II",  title: "Second" },
	{ scaleDegree: "bIII",title: "Flat Third" },
	{ scaleDegree: "III", title: "Third" },
	{ scaleDegree: "IV",  title: "Fourth" },
	{ scaleDegree: "bV",  title: "Flat Fifth" },
	{ scaleDegree: "V",   title: "Fifth" },
	{ scaleDegree: "bVI", title: "Flat Sixth" },
	{ scaleDegree: "VI",  title: "Sixth" },
	{ scaleDegree: "bVII",title: "Flat Seventh" },
	{ scaleDegree: "VII", title: "Seventh" }
    ],

    _create: function() {
	this.element.addClass('scaleTool');
	this.draw();
    },

    draw: function() {
	this.width  = this.element.width();
	this.height = this.element.height();
	this.element.hide();
	this.scale = $bk.scale;
	this.chordScale = $bk.chordScale;
	var height = this.element.height();
	this.scaleToolDegrees = [];
	var numScaleNote = 0;
	var numChordNote = 0;
	var startRow = this.options.headerRow ? 0 : 1;
	for (var i = startRow; i <= 12; i++) {
	    var chordScaleActive, scaleActive, fields, mode, modeScaleDegrees, modeName, chordActive, chord;
	    if (i === 0) {
		fields = this.headerFields;
	    } else {
		mode = '';
		chord = '';
		modeName = '';
		modeScaleDegrees = '';
		chordNote = '';
		var noteValue = (this.scale.getNote().getValue() + i - 1) % 12;
		var note = new Note(noteValue);
		var noteString = note.getString();
		var scaleDegreeString = this.scaleDegrees[i - 1].scaleDegree;
		var scaleDegreeTitle = this.scaleDegrees[i - 1].title;
		scaleActive = this.scale.containsNote(note, true);
		chordScaleActive = this.chordScale && this.chordScale.containsNote(note, true);
		if (chordScaleActive) {
		    var valueArray = this.chordScale.getValueArray();
		    var nthInversion = this.chordScale.getNthInversion(numChordNote, valueArray);
		    inversionChordScale = new Scale(nthInversion);
		    var inversionChordScaleType = inversionChordScale.getScaleType();
		    chord = inversionChordScaleType.getString();
		    chordScaleDegrees = inversionChordScaleType.getScaleDegreeTypeString();
		    chordName = inversionChordScaleType.getNames();
		    numChordNote ++;
		}
		if (scaleActive) {
		    var valueArray = this.scale.getValueArray();
		    var nthInversion = this.scale.getNthInversion(numScaleNote, valueArray);
		    inversionScale = new Scale(nthInversion);
		    var inversionScaleType = inversionScale.getScaleType();
		    mode = inversionScaleType.getString();
		    modeScaleDegrees = inversionScaleType.getScaleDegreeTypeString();
		    modeName = inversionScaleType.getNames();
		    numScaleNote ++;
		}		
		var toggleScaleDegreeProxy = $.proxy(this.toggleScaleDegree, this);
		var toggleChordNoteProxy = $.proxy(this.toggleChordNote, this);
		var setRootNoteProxy = $.proxy(this.setRootNote, this);
		chordNote = noteString;
		fields = [
		    { value:scaleDegreeString, title:scaleDegreeTitle, click:toggleScaleDegreeProxy},
		    { value:noteString, title:'Note', click:setRootNoteProxy },
		    { value:scaleActive ? numScaleNote : '', title:'Note Number'},
		    { value:mode, title:'Mode'},
		    { value:modeScaleDegrees, title:'Mode Scale Degrees'},
		    { value:modeName, title:'Mode Name'},
		    { value:chordNote, title:'Chord Note', click: toggleChordNoteProxy},
		    { value:chord, title:'Chord' }
		];
	    }
	    var widthSoFar = 0;
	    var maxRows = this.options.headerRow ? 13 : 12;
	    var top = this.height / maxRows * (i - 1)
	    for (var j = 0; j < fields.length; j++) {
		
		var fieldElement = $('<div>')
		    .addClass('scaleToolField')
		    .addClass('scaleDegree' + (i - 1))
		    .html(fields[j].value)
		    .attr('title', fields[j].title)
		    .width(this.headerFields[j].width - 1)
		    .css('left', widthSoFar)
		    .css('top',  top)
		    .height(this.height / maxRows - 1)
		    .appendTo(this.element);
		if (j === 0 || j === 6) {
		    fieldElement.data('scaleDegreeNum', i - 1);
		}
		if (j == 6) {
		    if (chordScaleActive) {
			fieldElement.addClass('chordScaleActive');
		    }
		}
		if (j === 1) {
		    fieldElement.data('numScaleNote', numScaleNote - 1);
		}
		if (fields[j].click) {
		    fieldElement.click(fields[j].click);
		}
		if (scaleActive) {
		    fieldElement.addClass('scaleDegreeActive');
		}
		if (i === 0) {
		    fieldElement.addClass('fieldHeader');
		}
		widthSoFar += this.headerFields[j].width;
	    }
	}
	this.element.show();
    },

    toggleChordNote: function(event) {
	var scaleDegreeValue = $(event.target).data('scaleDegreeNum');
	var note = new Note((scaleDegreeValue + this.scale.getNote().getValue())%12);
	console.log(scaleDegreeValue);
	chordScaleActive = this.chordScale && this.chordScale.containsNote(note, true);
	if (chordScaleActive) {
	    if (this.chordScale.getValueArray().length === 1) {
		$bk.chordScale = null;
	    } else {
		this.chordScale.removeNote(note);
	    }
	} else {
	    if (!$bk.chordScale) {
		console.log('adding chord scale');
		$bk.chordScale = new Scale([note.getValue()]);
		this.chordScale = $bk.chordScale;
		console.log(this.chordScale);
	    } else {
		this.chordScale.addNote(note);
	    }
	}
	$bk.redraw();
    },

    toggleScaleDegree: function(event) {
	var scaleDegreeValue = $(event.target).data('scaleDegreeNum');
	var note = new Note((scaleDegreeValue + this.scale.getNote().getValue())%12);
	scaleActive = this.scale.containsNote(note, true);
	if (scaleActive) {
	    if (scaleDegreeValue === 0) {
		this.scale.removeNote(note);
	    } else {
		this.scale.removeScaleDegreeValue(scaleDegreeValue);
	    }
	} else {
	    this.scale.addScaleDegreeValue(scaleDegreeValue);
	}
	$bk.redraw();
    },

    setRootNote: function(event) {
	var numScaleNote = $(event.target).data('numScaleNote');
	this.scale.setInversion(numScaleNote);
	$bk.redraw();
    },

    redraw: function() {
	this.element.empty();
	this.draw();
    }


});

