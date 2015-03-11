$.widget('bk.scaleToolDegreeHeader', {

    _create: function() {
	this.element.addClass('scaleToolDegreeHeader');
	var headers = [
	    {code:'SD', title:'Scale Degree', width: 50},
	    {code:'N', title:'Note', width: 50},
	    {code:'Mode', title:'Mode', width: 50}
	];
	var widthSoFar = 0;
	for (var i = 0; i < headers.length; i++) {
	    var headerElement = $('<div>')
		.addClass('scaleToolDegreeHeaderField')
		.html(headers[i].code)
	        .attr('title', headers[i].title)
	        .width(headers[i].width)
	        .css('left', widthSoFar)
		.appendTo(this.element);
	    widthSoFar += headers[i].width;
	}
    }

});
