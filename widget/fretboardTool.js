$.widget('bk.fretboardTool', {

    _create: function() {
	this.element.addClass('fretboardTool');
	this.scale = $bk.scale;
	this.draw();
    },

    draw: function() {
	this.width = this.element.width();
	this.height = this.element.height();
	this.instrument = $bk.instrument;
	var stringArray = this.instrument.getStringArray();
	var instrumentMaxFret = this.instrument.getMaxFret();
	numStrings = stringArray.length;
	for (i = 0; i < numStrings; i++) {
	    var string = this.instrument.getString(i);
	    var stringValueArray = string.getValueArray();
	    for (var j = 0; j < instrumentMaxFret; j++) {
		var note = new Note(stringValueArray[j]);
		var containsNote = this.scale.containsNote(note, true);
		var scaleDegreeValue = this.scale.getScaleDegreeValue(note);
		var cellHeight = this.height / numStrings - 1;
		var cellWidth = this.width / instrumentMaxFret - 1;
		var stringFretElement = $('<div>')
		    .addClass('stringFret')
		    .addClass('scaleDegree' + scaleDegreeValue)
		    .css('top', i * this.height / numStrings)
		    .css('left', j * this.width / instrumentMaxFret)
		    .width(cellWidth)
		    .height(cellHeight)
		    .appendTo(this.element)
		    .html(note.getString());
		if (containsNote) {
		    stringFretElement.addClass('scaleDegreeActive');
		}
	    }
	}
    },

    redraw: function() {
	this.element.empty();
	this.draw();
    }



});

