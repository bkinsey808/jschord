$.widget('bk.scaleFretboardTool', {

    _create: function() {
	console.log('create');
	this.element.addClass('scaleFretboardTool');
	this.instrument = $bk.instrument;
	var numStrings = this.instrument.getNumStrings();
	var height = this.element.height();
	var width = this.element.width();
	var numLines = 12 + numStrings;
	scaleToolHeight = height / numLines * 12;
        scaleToolWidth = width / 2;
	fretboardToolHeight = height - scaleToolHeight;	
	$bk.scaleToolElement = $('<div>')
	$bk.chordDatabase = $('<div>')
	$bk.fretboardToolElement = $('<div>')
	var self = this;
	setTimeout(function() {
	    $bk.scaleToolElement
		.css('float', 'left')
		.height(scaleToolHeight)
		.width(scaleToolWidth)
		.scaleTool();
	}, 0);
	setTimeout(function() {
	    $bk.chordDatabase
		.css('float', 'right')
		.height(scaleToolHeight)
		.width(scaleToolWidth)
		.chordDatabase()
	}, 0);
	setTimeout(function() {
	    $bk.fretboardToolElement
		.height(fretboardToolHeight)
		.width(width)
		.fretboardTool();
	}, 0);
	this.element.append([$bk.scaleToolElement, $bk.chordDatabase, $bk.fretboardToolElement]);

    },
    
    redraw: function() {
	this.scaleToolElement.scaleTool('redraw');
	this.fretboardToolElement.fretboardTool('redraw');
    }
});