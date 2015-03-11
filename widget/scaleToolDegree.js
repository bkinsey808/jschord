$.widget('bk.scaleToolDegree', {

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
	this.index = this.options.index;
	this.scale = this.options.scale;
	console.log(this.index);
	var scaleDegreeString = this.scaleDegrees[this.index].scaleDegree;
	var scaleDegreeTitle = this.scaleDegrees[this.index].title;
	this.element.append(scaleDegreeString);
	this.element.addClass('scaleToolDegree');
	var scaleType = this.scale.getScaleType();
	var scaleTypeValueArray = scaleType.getValueArray();
	
	
	var fields = [
	    {value: scaleDegreeString, title: scaleDegreeTitle, width: 50},
	];
	var widthSoFar = 0;
	for (var i = 0; i < fields.length; i++) {
	    var headerElement = $('<div>')
		.addClass('scaleToolDegreeField')
		.html(fields[i].value)
	        .attr('title', fields[i].title)
	        .width(fields[i].width)
	        .css('left', widthSoFar)
		.appendTo(this.element);
	    widthSoFar += fields[i].width;
	}

    }

});
