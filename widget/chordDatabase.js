$.widget('bk.chordDatabase', {

    _create: function() {
	this.element.addClass('chordDatabase');
	this.draw();
    },

    draw: function() {
	this.headerRow = $('<div>')
	    .height(15);
	this.body = $('<div>')
	    .css('overflow', 'scroll')
	    .css('clear', 'left')
	    .height(this.element.height() - 15);
	this.element.html([this.headerRow, this.body]);
	var numStrings = $bk.instrument.getNumStrings();
	var view = {};
	view.cols = [
	    {
		label: '#',
		title: 'Number of Chord Scale Notes',
		code:  'numNotes',
		width: 15
	    },
	    {
		label: 'O',
		title: 'Number of Open Strings in Chord',
		code:  'numOpen',
		width: 15
	    }, 
	    {
		label: 'M',
		title: 'Number of Muted Strings in Chord',
		code:  'numMuted',
		width: 15
	    },
	    {
		label: 'N',
		title: 'Note of Primary Scale',
		code:  'note',
		width:  25
	    },
	    {
		label: 'ST',
		title: 'Chord Scale Type Code',
		code:  'scaleType',
		width: 60
	    },
	    {
		label: 'Chord Scale Type',
		title: 'Scale Type of Chord',
		code:  'scaleTypeName',
		width: 150
	    },
	    {
		label: 'CSpell',
		title: 'Spelling of Chord',
		code:  'chordSpelling',
		width: 60
	    }		
	];
	for (var s = 1; s <= numStrings; s++) {
	    view.cols.push({
		label: 's' + s,
		title: 'Fret position at string ' + s,
		code:  's' + s,
		width: 20
	    });
	}
	var colTemplate = '{{#cols}}<div class="cell" code="{{&code}}" title="{{&title}}" style="width:{{&width}}px;">{{&label}}</div>{{/cols}}';
	var renderString = Mustache.render(colTemplate, view);
	this.headerRow[0].innerHTML = renderString;
	var self = this;
	setTimeout(function() {
	    var db = $bk.instrument.buildChordDatabase(5, $bk.scale);
	    view.positions = db.toJSON()//.slice(0, 1000);
	    var gridTemplate = '{{#positions}}<div style="height:15px; clear: left">';
	    var numCols = view.cols.length;
	    for (var i = 0; i < numCols; i++) {
		var col = view.cols[i];
		gridTemplate +='<div class="cell" code="' + col.code + '" title="' + col.title + '" style="width:' + col.width + 'px;">{{&' + col.code + '}}&nbsp;</div>';
	    }
	    gridTemplate += '</div>{{/positions}}';
	    renderString = Mustache.render(gridTemplate, view);
	    self.body[0].innerHTML = renderString;

	}, 0);
    },

    redraw: function() {
	this.element.empty();
	this.draw();
    }


});

