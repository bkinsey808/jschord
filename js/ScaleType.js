var ScaleType = Class({

    include: AppMixin,

    init: function(argument) {
	if (typeof argument === 'undefined') {
	    this.valueArray = [];
	    perfectUnison = true;
	} else if (!(argument instanceof Array)) {
	    if (this.scaleTypeData[argument]) {
		argument = this.scaleTypeData[argument].scaleDegreeTypeString;
	    }
	    this.valueArray = [];
	    var self = this;
	    if (!argument.match(/^[ABCDEFG]b?#?/)) {
		argument = '1 ' + argument;
	    }
	    var scaleDegreeTypeArray = argument.split(' ');
	    var mapFunction = function(splitString) {
		var value = self.getValueFromSplitString(splitString, true);
		if (!isNaN(value)) {
		    self.valueArray.push(value);
		}
	    }
	    scaleDegreeTypeArray.map(mapFunction);      
	    if (this.valueArray[0] > 0) {
		this.adjustValueArrayForInitialNote();
	    }
	} else {
	    this.valueArray = argument;
	}
	var noteNum = this.valueArray[0];
	var mapFunction = function(value) {
	    return value % 12;
	}
	this.valueArray = this.valueArray.map(mapFunction);     
	this.valueArray = this.getUniqueArray(this.valueArray);
	this.valueArray.sort(function(a,b){return a-b});
	var firstValue = this.valueArray[0];
	if (this.valueArray.length > 0 && firstValue > 0) {
	    var diff = firstValue;
	    for (var i = 0; i < this.valueArray.length; i++) {
		this.valueArray[i] -= diff;
	    }
	}
    },

    isPerfectUnison: function() {
	if (!this.valueArray) {
	    return true;
	}
	return false;
    },

    adjustValueArrayForInitialNote: function() {
	var initialNoteValue = this.valueArray[0];
	for (var i = 0; i < this.valueArray.length; i++) {
	    var value = this.valueArray[i];
	    var newValue = value - initialNoteValue;
	    if (newValue < 0) {
		newValue += 12;
	    }
	    this.valueArray[i] = newValue;
	}
    },

    getValueFromSplitString: function(splitString) {
	var matches = splitString.match(/([ABCDEFG]b?#?)(\d*)/);
	var value;
	if (matches && matches[1]) {
	    var noteType = new NoteType(matches[1]);
	    return noteType.getValue();
	}
	var scaleDegree = new ScaleDegreeType(splitString);
	return scaleDegree.getValue() % 12;
    },

  getScaleDegreeTypeString: function(array) {
    if (! array) {
      array = this.valueArray;
    }
    var scaleDegreeTypeStringArray = [];
    for (var i = 1; i < array.length; i++) {
      var scaleDegreeType = new ScaleDegreeType([array[i]]);
      var scaleDegreeTypeString = scaleDegreeType.getString();
      scaleDegreeTypeStringArray.push(scaleDegreeTypeString);
//      console.log(i + ': ' + array[i] + " " + scaleDegreeTypeString);
    }
    return scaleDegreeTypeStringArray.join(' ');
  },

  getString: function(primary) {
      if (this.isPerfectUnison()) {
	  return "PU";
      }
    if (!primary) {
      var scaleDegreeTypeString = this.getScaleDegreeTypeString();
      var string = this.getScaleTypeStringFromScaleDegreeTypeString(scaleDegreeTypeString);
      if (string) {
        return string;
      }
    }
    for (var n = 1; n < this.valueArray.length; n++) {
      // not cross browser!
      for (var key in this.scaleTypeData) {
        var scaleTypeDataItem = this.scaleTypeData[key];
        if (! scaleTypeDataItem.primary) continue;
        var checkScaleDegreeTypeString = scaleTypeDataItem.scaleDegreeTypeString;
        var array = this.getArrayFromScaleDegreeTypeString(checkScaleDegreeTypeString);
        var inversionArray = this.getNthInversion(n, array);
        if (inversionArray.toString() == this.valueArray.toString()) {
          return key + 'inv' + n;
        }
      }
    } 
    return scaleDegreeTypeString;
  },

    getModes: function() {
	if (!this.valueArray) {
	    console.log('no array');
	    return;
	}
    for (var n = 0; n < this.valueArray.length; n++) {
      var inversionScaleType = new ScaleType(this.getNthInversion(n, this.valueArray));
      console.log(n 
        + ": (" + inversionScaleType.getString() + ') ' 
        + inversionScaleType.getScaleDegreeTypeString());
    }
      
  },

  getArrayFromScaleDegreeTypeString: function(scaleDegreeTypeString) {
    var scaleDegreeTypeStringArray = scaleDegreeTypeString.split(' ');
    var array = [];
    array.push(0);
    for(var i = 0; i < scaleDegreeTypeStringArray.length; i++) {
      var degreeTypeString = scaleDegreeTypeStringArray[i];
      var degreeType = new ScaleDegreeType(degreeTypeString);
      array.push(degreeType.getValue());
    }
    return array;
  },

  getScaleTypeStringFromScaleDegreeTypeString: function(scaleDegreeTypeString) {
    for (var key in this.scaleTypeData) {
      var scaleTypeDataItem = this.scaleTypeData[key];
      if (scaleTypeDataItem.scaleDegreeTypeString == scaleDegreeTypeString) {
        return key;
      }
    }
  },

  getNthInversion: function (n, array) {
    array = array.slice(0); //shallow clone
    for (var i = 0; i < n; i++) {
      var element = array.shift();
      array.push(element + 12);
    }
    if (array.length > 0 && array[0] > 0) {
      var diff = array[0];
      for (var i = 0; i < array.length; i++) {
        array[i] -= diff;
      }
    }
    return array;
  },

  getValueArray: function() {
    return this.valueArray;
  },

    isPrimary: function(checkArray) {
	if (!checkArray) {
	    checkArray = this.valueArray;
	}
	var scaleDegreeTypeString = this.getScaleDegreeTypeString(checkArray);
	// not cross browser!
	for (var key in this.scaleTypeData) {
	    var scaleTypeDataItem = this.scaleTypeData[key];
	    
	    if (scaleTypeDataItem.scaleDegreeTypeString == scaleDegreeTypeString) {
		if (scaleTypeDataItem.primary) {
		    return true;
		}
	    }
	}
	return false;
    },

    getScaleTypesBySize: function(size) {
	var data = {};
        for (var key in this.scaleTypeData) {
	    var scaleTypeDataItem = this.scaleTypeData[key];
	    var scaleDegreeTypeString = scaleTypeDataItem.scaleDegreeTypeString;
	    var splitArray = scaleDegreeTypeString.split(' ');
	    if (splitArray.length == 4) {
		var scaleType = new ScaleType(scaleDegreeTypeString);
		var valueArray = scaleType.getValueArray();
		data[key] = {};
		data[key].scaleDegreeTypeString = scaleDegreeTypeString;
		data[key].valueArray = valueArray;
	    }
	}
	return data;
    },

    getScales: function() {
    },

    getScaleTypeData: function() {
	var data = {};
        for (var key in this.scaleTypeData) {
	    var scaleTypeDataItem = this.scaleTypeData[key];
	    data[key] = {};
	    data[key].scaleDegreeTypeString = scaleTypeDataItem.scaleDegreeTypeString;
//	    console.log(key + ': ' + scaleTypeDataItem.scaleDegreeTypeString);
	   var scaleType = new ScaleType(scaleTypeDataItem.scaleDegreeTypeString);
	    data[key].primaryValueArray = scaleType.getValueArray();
	    data[key].modes = scaleType.getModes();
	}
	return data;
    },

  scaleTypeData : {
    "PU":   { scaleDegreeTypeString: "",    primary: true, names: [ "Perfect Unison" ]},

    "d2":   { scaleDegreeTypeString: "b2",                  names: [ "Minor Second" ]}, 
    "a2":   { scaleDegreeTypeString: "2",    primary: true, names: [ "Major Second" ]}, 
    "d3":   { scaleDegreeTypeString: "b3",   primary: true, names: [ "Minor Third" ]}, 
    "a3":   { scaleDegreeTypeString: "3",    primary: true, names: [ "Major Third" ]}, 
    "P4":   { scaleDegreeTypeString: "4",                   names: [ "Perfect Fourth" ]}, 
    "T":    { scaleDegreeTypeString: "b5",   primary: true, names: [ "Tritone" ]}, 
    "P5":   { scaleDegreeTypeString: "5",    primary: true, names: [ "Perfect Fifth" ]}, 
    "d6":   { scaleDegreeTypeString: "b6",                  names: [ "Minor Sixth" ]}, 
    "a6":   { scaleDegreeTypeString: "6",                   names: [ "Major Sixth" ]}, 
    "d7":   { scaleDegreeTypeString: "b7",                  names: [ "Minor Seventh" ]}, 
    "a7":   { scaleDegreeTypeString: "7",    primary: true, names: [ "Major Seventh" ]},

    "M":    { scaleDegreeTypeString: "3 5",  primary: true, names: [ "Minor Chord" ]},
    "-":    { scaleDegreeTypeString: "b3 5", primary: true, names: [ "Major Chord" ]},
    "sus2": { scaleDegreeTypeString: "2 5",                 names: [ "Sus 2 Chord", "Quartal Trichord" ]},
    "Mb5":  { scaleDegreeTypeString: "3 b5", primary: true, names: ["Major Flat Five"]},
    "+":  { scaleDegreeTypeString: "3 b6", primary: true, names: ["Aug Chord", "Semitone Scale", "Four Semitone", "Major Sharp Five"]},
    "sus4":  { scaleDegreeTypeString: "4 5", primary: true, names: ["Sus Four", "Raga Sarvasri"]},
    "Sans":  { scaleDegreeTypeString: "4 b7", primary: false, names: ["Sansagari"]},
    "-":  { scaleDegreeTypeString: "b3 5", primary: true, names: ["Minor Chord", "Peruvian Tritonic Two"]},
   "Peru3":  { scaleDegreeTypeString: "b3 6", primary: false, names: ["Peruvian Tritonic", "Ute Tritonic"]},
   "o":  { scaleDegreeTypeString: "b3 b5", primary: true, names: ["Dim Chord"]},
   "Ute":  { scaleDegreeTypeString: "b3 b7", primary: true, names: ["Ute Tritonic"]},
   "ROng":  { scaleDegreeTypeString: "b5 5", primary: true, names: ["Raga Ongkari", "Sharp Eleven Chord"]},
   "7om3":  { scaleDegreeTypeString: "5 b7", primary: true, names: ["Seven Omit Three", "Dominant Seventh Incomplete"]},

   "2C":  { scaleDegreeTypeString: "2 3 5", primary: true, names: ["Two", "Eskimo Tetratonic", "Add Two", "Sus Two Add Three", "Add Nine Omit Three"]},
   "GP":  { scaleDegreeTypeString: "2 4 5", primary: false, names: ["Genus Primum", "Sus Two Four"]},
   "RBha":  { scaleDegreeTypeString: "2 4 6", primary: false, names: ["Raga Bhavani"]},
   "7sus2":  { scaleDegreeTypeString: "2 5 b7", primary: false, names: ["Seventh Sus Two"]},
   "-2":  { scaleDegreeTypeString: "2 b3 5", primary: true, names: ["Minor Two", "Minor Add Nine"]},
   "WTet":  { scaleDegreeTypeString: "2 b3 b7", primary: true, names: ["Warao Tetratonic"]},
   "M6":  { scaleDegreeTypeString: "2 b5 b6", primary: false, names: ["Messiaen Six"]},
   "4C":  { scaleDegreeTypeString: "3 4 5", primary: true, names: ["Four", "Add 4"]},
   "6C":  { scaleDegreeTypeString: "3 5 6", primary: false, names: ["Six Chord", "German Six"]},
   "M7":  { scaleDegreeTypeString: "3 5 7", primary: true, names: ["Major Seven"]},
   "7C":  { scaleDegreeTypeString: "3 5 b7", primary: true, names: ["Seven", "Raga Mahathi", "Antara Kaishiaki"]},
   "RNig":  { scaleDegreeTypeString: "3 b5 7", primary: true, names: ["Raga Nigamagamini", "Major Seven Flat Five"]},
   "7b5":  { scaleDegreeTypeString: "3 b5 b7", primary: true, names: ["Seven Flat Five", "Messiaen Truncated Mode 6 Inv."]},
   "+7":  { scaleDegreeTypeString: "3 b6 b7", primary: true, names: ["Aug Seven", "Seven Sharp Five Chord"]},
   "M7#5":  { scaleDegreeTypeString: "3 b6 7", primary: true, names: ["Major Seven Sharp Five"]},
   "7sus4":  { scaleDegreeTypeString: "4 5 b7", primary: true, names: ["Seven Sus Four", "Genus Primum Inverse"]},
   "M5i":  { scaleDegreeTypeString: "4 b5 7", primary: false, names: ["Messiaen Five Inv."]},
   "RLav":  { scaleDegreeTypeString: "b2 5 b7", primary: true, names: ["Raga Lavangi"]},
   "M5":  { scaleDegreeTypeString: "b2 b5 5", primary: true, names: ["Messiaen Five"]},
   "-4":  { scaleDegreeTypeString: "b3 4 5", primary: true, names: ["Minor Four Chord", "Minor Add Four"]},
   "-6":  { scaleDegreeTypeString: "b3 5 6", primary: true, names: ["Minor Six"]},
   "-M7":  { scaleDegreeTypeString: "b3 5 7", primary: true, names: ["Minor Major Seventh"]},
   "-7":  { scaleDegreeTypeString: "b3 5 b7", primary: true, names: ["Minor Seven", "Bi Yu"]},
   "o7":  { scaleDegreeTypeString: "b3 b5 6", primary: true, names: ["Dim Seven", "Three Semitone", "French Six"]},
   "ob7":  { scaleDegreeTypeString: "b3 b5 b7", primary: false, names: ["Half Dim", "Minor Seven Flat Five", "Tristan Chord"]},
   "-3Tet":  { scaleDegreeTypeString: "b3 3 4", primary: false, names: ["Minor-Third Tetracluster"]}, 

   "MPent":  { scaleDegreeTypeString: "2 3 5 6", primary: true, names: ["Major Pentatonic", "Six Nine Chord", "Mongolian", "Diatonic", " Chinese 1", "Ghana Pentatonic", "Ryosen", "Yona Nuki Major", "Man Jue", "Gong", "Raga Bhopali", "Bhup", "Mohanam", "Deskar", "Bilahari", "Kokila", "Jait Kalyan", "Peruvian Pentatonic One"]},
   "M9":  { scaleDegreeTypeString: "2 3 5 7", primary: true, names: ["Major Nine", "Raga Hamsadhvani", "Raga Hansadhvani"]},
   "9C":  { scaleDegreeTypeString: "2 3 5 b7", primary: true, names: ["Nine", "Dominant Pentatonic"]},
   "Kung":  { scaleDegreeTypeString: "2 3 b5 6", primary: false, names: ["Kung", "Six Nine Flat Five"]},
   "RKumarD":  { scaleDegreeTypeString: "2 3 b5 7", primary: true, names: ["Raga Kumardaki", "Major Nine Flat Five", "Kumudki"]},
   "9b5":  { scaleDegreeTypeString: "2 3 b5 b7", primary: true, names: ["Nine Flat Five"]},
   "9#5":  { scaleDegreeTypeString: "2 3 b6 b7", primary: false, names: ["Nine Sharp Five"]},
   "Ritusen":  { scaleDegreeTypeString: "2 4 5 6", primary: false, names: ["Ritusen", "Arabhi", "Durga", "Major Complementary", "Ritusen", "Ritsu", "Zhi", "Zheng", "Raga Devakriya", "Suddha Saveri", "Arabhi", "Scottish Pentatonic", "Ujo", "P'yongjo", "Major complement"]},
   "Egypt":  { scaleDegreeTypeString: "2 4 5 b7", primary: false, names: ["Egyptian", "Elevent Omit Three", "Aeolian Pentatonic", "Jin Yu", "Madhmat Sarang", "Yo", "Suspended Pentatonic", "Raga Madhyamavati", "Madhmat Sarang", "Egyptian", "Shang", "Rui Bin", "Qing Yu"]},
   "Chad":  { scaleDegreeTypeString: "2 b3 4 5", primary: false, names: ["Chad Gadyo", "Raga Purnalalita", "Ghana Pentatonic One", "Nando-kyemyonjo"]},
   "RAbh":  { scaleDegreeTypeString: "2 b3 4 6", primary: false, names: ["Raga Abhogi"]},
   "RAT":  { scaleDegreeTypeString: "2 b3 4 b6", primary: false, names: ["Raga Audav Tukhari"]},
   "Kum":  { scaleDegreeTypeString: "2 b3 5 6", primary: true, names: ["Kumoi", "Minor Six Nine Chord", "Minor Six Add Nine Chord", "Akebono One", "Raga Sivaranjini", "Shivranjani", "Dorian Pentatonic"]},
   "-M9":  { scaleDegreeTypeString: "2 b3 5 7", primary: true, names: ["Minor Major Nine"]},
   "Hir":  { scaleDegreeTypeString: "2 b3 5 b6", primary: true, names: ["Hira-joshi", "Kata-kumoi", "Yona Nuki mineur", "Hon-kumoi-joshi", "Sakura", "Akebono II"]},
   "-9":  { scaleDegreeTypeString: "2 b3 5 b7", primary: true, names: ["Minor Nine Chord"]},
   "Ryu":  { scaleDegreeTypeString: "3 4 5 7", primary: true, names: ["Ryukyu", "Hirajoshi Two", "Major Eleven Omit Nine", "Raga Gambhiranata"]},
   "7/11":  { scaleDegreeTypeString: "3 4 5 b7", primary: true, names: ["Seven Eleven", "Eleven Omit Nine", "Mixolydian Pentatonic", "Raga Savethri"]},
   "RMam":  { scaleDegreeTypeString: "3 5 6 7", primary: false, names: ["Raga Mamata", "Major Thirteen Omit 9 Omit 11"]},
   "7/6":  { scaleDegreeTypeString: "3 5 6 b7", primary: true, names: ["Seven Six", "Thirteen Omit Nine Omit Eleven", "Raga Valaji"]},
   "7#11":  { scaleDegreeTypeString: "3 b5 5 b7", primary: false, names: ["Seven Sharp Eleven"]},
   "Chin":  { scaleDegreeTypeString: "3 b5 5 7", primary: false, names: ["Chinese", "Major Seven Sharp Eleven Chord", "Chinese 2", "Raga Amritavarshini", "Malashri", "Shilangi"]},
   "RNab":  { scaleDegreeTypeString: "b2 2 b5 5", primary: false, names: ["Raga Nabhomani"]},
   "MB":  { scaleDegreeTypeString: "b2 3 4 7", primary: true, names: ["Mangal-Bairo", "Raga Megharanji"]},
   "SPent":  { scaleDegreeTypeString: "b2 3 4 b6", primary: true, names: ["Syrian Pentatonic", "Raga Megharanjani"]},
   "Scri":  { scaleDegreeTypeString: "b2 3 5 6", primary: true, names: ["Scriabin", "Raga Rasika Ranjani", "Jait", "Marva", "Vibhas Marva"]},
   "RRev":  { scaleDegreeTypeString: "b2 3 5 b6", primary: true, names: ["Raga Reva", "Bhairava", "Revagupti", "Ramkali", "Vibhas Bhairava"]},
   "7b9":  { scaleDegreeTypeString: "b2 3 5 b7", primary: true, names: ["Seven Flat Nine", "Raga Manaranjani I"]},
   "7b5b9":  { scaleDegreeTypeString: "b2 3 b5 b7", primary: false, names: ["Seven Flat Five Flat Nine"]},
   "RKsha":  { scaleDegreeTypeString: "b2 3 b6 7", primary: true, names: ["Raga Kshanika"]},
   "aug7b9":  { scaleDegreeTypeString: "b2 3 b6 b7", primary: false, names: ["Aug Seven Flat Nine", "Seven Sharp Five Flat Nine"]},
   "APent":  { scaleDegreeTypeString: "b2 4 5 6", primary: true, names: ["Altered Pentatonic", "Raga Manaranjani Two"]},
   "RGaur":  { scaleDegreeTypeString: "b2 4 5 7", primary: true, names: ["Raga Gauri"]},
   "Sav":  { scaleDegreeTypeString: "b2 4 5 b6", primary: false, names: ["Saveri", "Japanese One", "Hon-kumoi-joshi", "Gunakri", "Gunakali", "Kumoi One", "Raga Salanganata", "Latantapriya"]},
   "Baira":  { scaleDegreeTypeString: "b2 4 5 b7", primary: false, names: ["Baira", "Kokin-Joshi", "Miyakobushi", "Han-Iwato", "In Sen: Japan", "Raga Vibhavari", "Revati", "Bairagi", "Lasaki"]},
   "Iwa":  { scaleDegreeTypeString: "b2 4 b5 b7", primary: false, names: ["Iwato"]},
   "RDeshG":  { scaleDegreeTypeString: "b2 5 b6 7", primary: true, names: ["Raga Deshgaur"]},
   "BP":  { scaleDegreeTypeString: "b2 b3 5 b6", primary: false, names: ["Balinese Pelog", "Balinese", "Bhupal Todi", "Bhupala Todi", "Bibhas", "Raga Bhupalam"]},
   "Pelog":  { scaleDegreeTypeString: "b2 b3 5 b7", primary: false, names: ["Pelog", "Raga Rukmangi"]},
   "RCT":  { scaleDegreeTypeString: "b2 b3 b5 b6", primary: false, names: ["Raga Chhaya Todi"]},
   "Yash":  { scaleDegreeTypeString: "b2 b5 5 b6", primary: true, names: ["Yashranjani", "Raga Saugandhini"]},
   "7#9":  { scaleDegreeTypeString: "b3 3 5 b7", primary: false, names: ["Seven Sharp Nine"]},
   "aug7#9":  { scaleDegreeTypeString: "b3 3 b6 b7", primary: false, names: ["Aug Seven Sharp Nine", "Seven Sharp Five Sharp Nine Chord"]},
   "MR":  { scaleDegreeTypeString: "b3 4 5 7", primary: true, names: ["Madhuranjani", "Minor Major Eleven Omit Nine", "Raga Nata", "Udayaravicandrika"]},
   "-Pent":  { scaleDegreeTypeString: "b3 4 5 b7", primary: false, names: ["Minor Pentatonic", "Minor 7/11", "Minor 11 Omit 9", "Phrygian Pentatonic", "Blues Pentatonic", "Abheri", "Gu Xian", "Jia Zhong", "Kyenmyonjo", "Raga Dhani", "Suddha Dhanyasi", "Udhayaravi Chandrika", "Qing Shang", "Yu", "Pyongjo-kyenmyonjo", "Minyo"]},
   "LocPent":  { scaleDegreeTypeString: "b3 4 b6 b7", primary: false, names: ["Locrian Pentatonic", "Raga Mallkauns", "Malakosh", "Raga Hindola", "Man Gong", "Quan Ming", "Yi Ze", "Jiao"]},
   "-M13om911":  { scaleDegreeTypeString: "b3 5 6 7", primary: true, names: ["Minor Major Thirteen Omit 9,11"]},
   "-13om911":  { scaleDegreeTypeString: "b3 5 6 b7", primary: true, names: ["Minor Thirteen Omit 9, 11"]},

   "MI":  { scaleDegreeTypeString: "2 3 4 5 6", primary: false, names: ["Mixolydian Ionian", "Arezzo Major Diatonic Hexachord", "Devarangini", "Raga Kambhoji", "Schottish Hexatonic"]},
   "Kend":  { scaleDegreeTypeString: "2 3 4 5 7", primary: true, names: ["Kendaram", "Major Eleven Chord", "Raga Nalinakanti", "Vilasini"]},
   "RSiv":  { scaleDegreeTypeString: "2 3 4 5 b7", primary: true, names: ["Raga Siva Kambhoji", "Eleven Chord"]},
   "RHV":  { scaleDegreeTypeString: "2 3 4 6 7", primary: false, names: ["Raga Hamsa Vinodini"]},
   "RRagShri":  { scaleDegreeTypeString: "2 3 4 6 b7", primary: false, names: ["Raga Rageshri"]},
   "RDip":  { scaleDegreeTypeString: "2 3 4 b5 5", primary: true, names: ["Raga Dipak"]},
   "RSS":  { scaleDegreeTypeString: "2 3 4 b6 7", primary: true, names: ["Raga Sarasanana"]},
   "RKumud":  { scaleDegreeTypeString: "2 3 5 6 7", primary: true, names: ["Raga Kumud", "Ionian Lydian Scale", "Major Thirteen Omit Eleven Chord", "Lydian Hexatonic", "Sankara", "Shankara"]},
   "13om11":  { scaleDegreeTypeString: "2 3 5 6 b7", primary: true, names: ["Thirteen Omit Eleven Chord"]},
   "RLat":  { scaleDegreeTypeString: "2 3 5 b6 7", primary: true, names: ["Raga Latika"]},
   "RYK":  { scaleDegreeTypeString: "2 3 b5 5 6", primary: false, names: ["Raga Yamuna Kalyani", "Ancient Chinese", "Kalyani Keseri"]},
   "Ratna":  { scaleDegreeTypeString: "2 3 b5 5 7", primary: false, names: ["Ratnakanthi", "Raga Caturangini"]},
   "RMru":  { scaleDegreeTypeString: "2 3 b5 6 7", primary: false, names: ["Raga Mruganandana"]},
   "Prom":  { scaleDegreeTypeString: "2 3 b5 6 b7", primary: true, names: ["Prometheus", "Raga Barbara"]},
   "PHEH":  { scaleDegreeTypeString: "2 3 b5 b6 7", primary: false, names: ["Point Hope Eskimo Hexatonic"]},
   "WT":  { scaleDegreeTypeString: "2 3 b5 b6 b7", primary: true, names: ["Whole Tone", "Auxiliary Augmented", "Anhemitonic Hexatonic", "Messiaen One", "Raga Gopriya"]},
   "RNag":  { scaleDegreeTypeString: "2 4 5 6 7", primary: false, names: ["Raga Nagandhari"]},
   "Pyon":  { scaleDegreeTypeString: "2 4 5 6 b7", primary: false, names: ["Pyongjo", "Dominant Seventh", "Yosen", "Raga Darbar", "Narayani", "Suposhini", "Andolika", "Gorakh Kalyan", "Mixolydian Hexatonic"]},
   "RBhi":  { scaleDegreeTypeString: "2 4 5 b6 7", primary: true, names: ["Raga Bhinna Pancama"]},
   "RNav":  { scaleDegreeTypeString: "2 4 5 b6 b7", primary: false, names: ["Raga Navamanohari"]},
   "Megh":  { scaleDegreeTypeString: "2 4 5 b7 7", primary: false, names: ["Megh", "Raga Sarang"]},
   "RSuddhaB":  { scaleDegreeTypeString: "2 b3 4 5 6", primary: false, names: ["Raga Suddha Bangala", "Gauri Velavali"]},
   "-M11":  { scaleDegreeTypeString: "2 b3 4 5 7", primary: true, names: ["Minor Major Eleven"]},
   "-Hex":  { scaleDegreeTypeString: "2 b3 4 5 b7", primary: false, names: ["Minor Hexatonic", "Aeolian Dorian", "Minor Eleven Chord", "Manirangu", "Raga Palasi", "Manirangu", "Nayaki", "Pushpalithika", "Yo", "King Island Eskimo Hexatonic"]},
   "Kap":  { scaleDegreeTypeString: "2 b3 4 6 b7", primary: false, names: ["Kapijingla", "Raga Bagesri", "Sriranjani"]},
   "PH":  { scaleDegreeTypeString: "2 b3 4 b5 6", primary: false, names: ["Pyramid Hexatonic"]},
   "Blues":  { scaleDegreeTypeString: "2 b3 4 b5 b7", primary: false, names: ["Blues Scale"]},
   "RGhant":  { scaleDegreeTypeString: "2 b3 4 b6 7", primary: false, names: ["Raga Ghantana", "Kaushiranjani", "Kaishikiranjani"]},
   "HH":  { scaleDegreeTypeString: "2 b3 5 6 7", primary: true, names: ["Hawaiian Hexatonic", "Minor Major Thirteen Omit Eleven Chord"]},
   "RMana":  { scaleDegreeTypeString: "2 b3 5 6 b7", primary: true, names: ["Raga Manavi", "Minor Thirteen Omit Eleven Chord"]},
   "RTri":  { scaleDegreeTypeString: "2 b3 5 b6 b7", primary: false, names: ["Raga Trimurti"]},
   "RVij":  { scaleDegreeTypeString: "2 b3 b5 5 6", primary: false, names: ["Raga Vijayanagari"]},
   "RKK":  { scaleDegreeTypeString: "2 b3 b5 5 7", primary: false, names: ["Raga Kai Kavasi", "Raga Amarasenapriya"]},
   "RSya":  { scaleDegreeTypeString: "2 b3 b5 5 b6", primary: false, names: ["Raga Syamalam"]},
   "RSim":  { scaleDegreeTypeString: "2 b3 b5 5 b7", primary: false, names: ["Raga Simharava", "Raga Sinharavam"]},
   "RRanj":  { scaleDegreeTypeString: "2 b3 b5 6 7", primary: false, names: ["Raga Ranjani"]},
   "RSar":  { scaleDegreeTypeString: "2 b5 5 6 b7", primary: false, names: ["Raga Sarasvati"]},
   "RJag":  { scaleDegreeTypeString: "2 b5 5 b6 b7", primary: true, names: ["Raga Jaganmohanam"]},
   "RMR":  { scaleDegreeTypeString: "2 b5 5 b7 7", primary: true, names: ["Raga Malarani"]},
   "RHN":  { scaleDegreeTypeString: "3 4 5 6 7", primary: true, names: ["Raga Hari Nata", "Major Thirteen Omit Nine Chord", "Genus Secundum"]},
   "RKhamas":  { scaleDegreeTypeString: "3 4 5 6 b7", primary: false, names: ["Raga Khamas", "Thirteen Omit Nine Chord", "Baduhari"]},
   "RSV":  { scaleDegreeTypeString: "3 4 5 b6 6", primary: true, names: ["Raga Saravati", "Raga Sharavati"]},
   "RPar":  { scaleDegreeTypeString: "3 4 5 b6 7", primary: true, names: ["Raga Paraju", "Ramamanohari", "Simhavahini", "Sindhu Ramakriya", "Kamalamanohari"]},
   "RKamal":  { scaleDegreeTypeString: "3 4 5 b6 b7", primary: false, names: ["Raga Kamalamanohari"]},
   "RTil":  { scaleDegreeTypeString: "3 4 5 b7 7", primary: true, names: ["Raga Tilang", "Brindavani-Tilang"]},
   "MM5i":  { scaleDegreeTypeString: "3 4 b5 b7 7", primary: false, names: ["Messiaen Mode Five Inverse"]},
   "RVut":  { scaleDegreeTypeString: "3 b5 5 6 b7", primary: true, names: ["Raga Vutari"]},
   "RJyo":  { scaleDegreeTypeString: "3 b5 5 b6 b7", primary: true, names: ["Raga Jyoti"]},
   "RVV":  { scaleDegreeTypeString: "3 b5 5 b7 7", primary: true, names: ["Raga Vijayavasanta"]},
   "RSM":  { scaleDegreeTypeString: "b2 2 4 b6 6", primary: false, names: ["Raga Suddha Mukhari"]},
   "RCha":  { scaleDegreeTypeString: "b2 2 b5 5 6", primary: false, names: ["Raga Chandrajyoti"]},
   "MM5":  { scaleDegreeTypeString: "b2 2 b5 5 b6", primary: true, names: ["Messiaen Mode Five"]},
   "RKalaV":  { scaleDegreeTypeString: "b2 3 4 5 6", primary: false, names: ["Raga Kalavati", "Ragamalini"]},
   "RGaul":  { scaleDegreeTypeString: "b2 3 4 5 7", primary: true, names: ["Raga Gaula"]},
   "Mal":  { scaleDegreeTypeString: "b2 3 4 5 b6", primary: true, names: ["Malahari", "Geyahejjajji", "Raga Purna Pancama"]},
   "RVas":  { scaleDegreeTypeString: "b2 3 4 6 7", primary: false, names: ["Raga Vasanta"]},
   "RRP":  { scaleDegreeTypeString: "b2 3 4 6 b7", primary: false, names: ["Raga Rudra Pancama"]},
   "P6":  { scaleDegreeTypeString: "b2 3 4 b5 7", primary: true, names: ["Persian Hexatonic"]},
   "STS":  { scaleDegreeTypeString: "b2 32 4 b6 6", primary: false, names: ["Six Tone Symmetrical", "Messiaen Truncated Mode Three"]},
   "Soh":  { scaleDegreeTypeString: "b2 3 4 b6 7", primary: false, names: ["Sohini", "Raga Lalita Hexatonic", "Lalit Bhairav", "Hamsanandi"]},
   "RVasB":  { scaleDegreeTypeString: "b2 3 4 b6 b7", primary: false, names: ["Raga Vasantabhairavi"]},
   "RMY":  { scaleDegreeTypeString: "b2 3 5 6 b7", primary: true, names: ["Raga Malayamarutam"]},
   "RKalaG":  { scaleDegreeTypeString: "b2 3 5 b6 6", primary: true, names: ["Raga Kalagada"]},
   "RBaul":  { scaleDegreeTypeString: "b2 3 5 b6 7", primary: true, names: ["Raga Bauli"]},
   "Gam":  { scaleDegreeTypeString: "b2 3 b5 5 7", primary: true, names: ["Gamakakriya", "Raga Mandari", "Hamsanarayani"]},
   "RDha":  { scaleDegreeTypeString: "b2 3 b5 5 b6", primary: true, names: ["Raga Dhavalangam"]},
   "Puri":  { scaleDegreeTypeString: "b2 3 b5 6 7", primary: true, names: ["Puriya", "Marva", "Pancama", "Raga Hamsanandi"]},
   "PN":  { scaleDegreeTypeString: "b2 3 b5 6 b7", primary: true, names: ["Prometheus Neapolitani", "Prometheus Neapolitan"]},
   "RHejj":  { scaleDegreeTypeString: "b2 3 b5 b6 6", primary: false, names: ["Raga Hejjajji"]},
   "RJiv":  { scaleDegreeTypeString: "b2 4 5 6 7", primary: true, names: ["Raga Jivantika"]},
   "RRasav":  { scaleDegreeTypeString: "b2 4 5 6 b7", primary: false, names: ["Raga Rasavali"]},
   "RPad":  { scaleDegreeTypeString: "b2 4 5 b6 7", primary: false, names: ["Raga Padi", "Mela Ganamurti"]},
   "Ins":  { scaleDegreeTypeString: "b2 4 5 b6 b7", primary: false, names: ["Insen", "Raga Phenadyuti"]},
   "RSuddhaS":  { scaleDegreeTypeString: "b2 b3 4 5 b6", primary: false, names: ["Raga Suddha Simantini"]},
   "RGandh":  { scaleDegreeTypeString: "b2 b3 4 5 b7", primary: false, names: ["Raga Gandharavam"]},
   "DPH":  { scaleDegreeTypeString: "b2 b3 4 b5 6", primary: false, names: ["Double Phrygian Hexatonic"]},
   "Ritsu":  { scaleDegreeTypeString: "b2 b3 4 b6 b7", primary: false, names: ["Ritsu", "Honchoshi Plagal Form", "Raga Suddha Todi"]},
   "RSal":  { scaleDegreeTypeString: "b2 b3 5 6 b7", primary: false, names: ["Raga Salagavarali"]},
   "MT2":  { scaleDegreeTypeString: "b2 b3 b5 5 6", primary: true, names: ["Messiaen Truncated Mode Two"]},
   "RVS":  { scaleDegreeTypeString: "b2 b3 b5 5 7", primary: true, names: ["Raga Vijayasri"]},
   "RGT":  { scaleDegreeTypeString: "b2 b3 b5 b6 7", primary: false, names: ["Raga Gurjari Todi"]},
   "RBH":  { scaleDegreeTypeString: "b2 b3 b5 b6 b7", primary: false, names: ["Raga Bhavani Hexatonic"]},
   "Jog":  { scaleDegreeTypeString: "b3 3 4 5 b7", primary: true, names: ["Jog", "Raga Bhanumanjari"]},
   "Aug":  { scaleDegreeTypeString: "b3 3 5 b6 7", primary: true, names: ["Augmented", "Messiaen Truncated Mode Three Inv.", "Genus Tertium"]},
   "RRasam":  { scaleDegreeTypeString: "b3 3 b5 5 7", primary: false, names: ["Raga Rasamanjari"]},
   "-M13om9":  { scaleDegreeTypeString: "b3 4 5 6 7", primary: true, names: ["Minor Major 13 Omit 9"]},
   "RMano":  { scaleDegreeTypeString: "b3 4 5 6 b7", primary: false, names: ["Raga Manohari", "Minor Thirteen Omit Nine Chord", "Raga Bhimpalasi Desc"]},
   "RTak":  { scaleDegreeTypeString: "b3 4 5 b6 7", primary: true, names: ["Raga Takka"]},
   "RGop":  { scaleDegreeTypeString: "b3 4 5 b6 b7", primary: false, names: ["Raga Gopikavasantam", "Desya Todi", "Phrygian Hexatonic"]},
   "B1":  { scaleDegreeTypeString: "b3 4 b5 5 b7", primary: true, names: ["Blues One", "Raga Nileshwari"]},
   "RMH":  { scaleDegreeTypeString: "b3 b5 5 6 b7", primary: true, names: ["Raga Madhukauns Hexatonic"]},
   "Gaur":  { scaleDegreeTypeString: "b3 b5 5 b7 7", primary: false, names: ["Gaurikriya", "Raga Jivantini"]},

   "Maj":  { scaleDegreeTypeString: "2 3 4 5 6 7", primary: true, names: ["Major", "Ionian", "A Raray", "Bilaval Theta", "Mela Dhirasankarabharana", "4th Plagal Byzantine", "Ghana Heptatonic", "Greek Lydian", "Medieval Hypolydian"]},
   "ML":  { scaleDegreeTypeString: "2 3 4 5 6 b7", primary: false, names: ["Mixolydian", "Mela Harikambhoji", "Khamaj Theta", "Ching", "Greek Hypophrygian", "Iastian", "Khamaj Theta. Medieval Hypoionian"]},
   "MMar":  { scaleDegreeTypeString: "2 3 4 5 b6 6", primary: false, names: ["Mela Mararanjani"]},
   "MHarm":  { scaleDegreeTypeString: "2 3 4 5 b6 7", primary: true, names: ["Harmonic Major", "Mela Sarasangi"]},
   "MAeo":  { scaleDegreeTypeString: "2 3 4 5 b6 b7", primary: true, names: ["Aeolian Major", "Hindu", "Hindustan", "Mela Charukesi", "Mela Carukesi"]},
   "MNag":  { scaleDegreeTypeString: "2 3 4 5 b7 7", primary: false, names: ["Mela Naganandini"]},
   "RRagSri":  { scaleDegreeTypeString: "2 3 4 6 b7 7", primary: true, names: ["Raga Ragesri"]},
   "MLoc":  { scaleDegreeTypeString: "2 3 4 b5 b6 b7", primary: false, names: ["Locrian Major", "Arabian Septatonic"]},
   "MLA":  { scaleDegreeTypeString: "2 3 4 b6 6 b7", primary: false, names: ["Mixolydian Augmented"]},
   "Lyd":  { scaleDegreeTypeString: "2 3 b5 5 6 7", primary: false, names: ["Lydian", "Kalyan Theta", "Mela Mechakalyani", "Fourth Plagal Byzantine", "Greek Hypolydian", "Kalyan Theta", "Yaman"]},
   "OT":  { scaleDegreeTypeString: "2 3 b5 5 6 b7", primary: false, names: ["Overtone", "Lydian Dominant", "Overtone Dominant", "Mela Vaschaspati", "Lydian Diminished"]},
   "MKant":  { scaleDegreeTypeString: "2 3 b5 5 b6 6", primary: true, names: ["Mela Kantamani"]},
   "MLat":  { scaleDegreeTypeString: "2 3 b5 5 b6 7", primary: false, names: ["Mela Latangi"]},
   "-Lyd":  { scaleDegreeTypeString: "2 3 b5 5 b6 b7", primary: false, names: ["Lydian Minor", "Mela Risabhapriya"]},
   "-Nea":  { scaleDegreeTypeString: "2 3 b5 5 b7 7", primary: false, names: ["Neapolitan Minor", "Mela Chitrambari", "Mela Citrambari"]},
   "LydAug":  { scaleDegreeTypeString: "2 3 b5 b6 6 7", primary: false, names: ["Lydian Augmented", "Lydian Sharp Five"]},
   "LWT":  { scaleDegreeTypeString: "2 3 b5 b6 b7 7", primary: false, names: ["Leading Whole Tone"]},
   "RSor":  { scaleDegreeTypeString: "2 4 5 6 b7 7", primary: true, names: ["Raga Sorati"]},
   "CMi":  { scaleDegreeTypeString: "2 4 b5 5 b7 7", primary: false, names: ["Chromatic Mixolydian Inv."]},
   "Ethi":  { scaleDegreeTypeString: "2 3 4 b6 6 7", primary: false, names: ["Ethiopian", "Ionian Augmented", "Ionian Sharp Five"]},
   "CHD":  { scaleDegreeTypeString: "2 b3 3 5 b6 6", primary: false, names: ["Chromatic Hypodorian", "Double Harmonic Two"]},
   "Haw":  { scaleDegreeTypeString: "2 b3 4 5 6 7", primary: false, names: ["Hawaiian", "Melodic Minor Asc", "Mela Gaurimanohari", "Jazz Minor"]},
   "Dor":  { scaleDegreeTypeString: "2 b3 4 5 6 b7", primary: false, names: ["Dorian", "Kafi Theta", "Mela Kharaharapriya", "Eskimo Heptatonic", "Greek Phrygian", "Kafi Theta", "Medieval Hypomixolydian"]},
   "MJha":  { scaleDegreeTypeString: "2 b3 4 5 b6 6", primary: true, names: ["Mela Jhankaradhvani"]},
   "Har":  { scaleDegreeTypeString: "2 b3 4 5 b6 7", primary: false, names: ["Harmonic", "Harmonic Minor", "Mohammedan", "Mela Kiravani", "Maqam Bayat-e-Esfahan"]},
   "Aeo":  { scaleDegreeTypeString: "2 b3 4 5 b6 b7", primary: false, names: ["Aeolian", "Pure Minor", "Geez & Ezel", "Asavari Theta", "Mela Natabhairavi", "Greek Hyperphrygian", "Medieval Hypodorian"]},
   "MVar":  { scaleDegreeTypeString: "2 b3 4 5 b7 7", primary: false, names: ["Mela Varunapriya"]},
   "BM":  { scaleDegreeTypeString: "2 b3 4 b5 5 b7", primary: true, names: ["Modified Blues"]},
   "MqKar":  { scaleDegreeTypeString: "2 b3 4 b5 6 b7", primary: false, names: ["Maqam Karcigar", "Dorian Flat Five", "Locrian Natural Two Natural Six"]},
   "Locn2":  { scaleDegreeTypeString: "2 b3 4 b5 b6 7", primary: false, names: ["Locrian Natural Two", "Aeolian b5"]},
   "-Loc":  { scaleDegreeTypeString: "2 b3 4 b5 b6 b7", primary: false, names: ["Minor Locrian", "Locrian Sharp Two", "Half Diminished Sharp Two", "Locrian Natural Two"]},
   "Amb":  { scaleDegreeTypeString: "2 b3 b5 5 6 7", primary: false, names: ["Ambika", "Mela Dharmavati", "Dumyaraga", "Lydian Diminished", "Madhuvanti"]},
   "-Roum":  { scaleDegreeTypeString: "2 b3 b5 5 6 b7", primary: false, names: ["Roumanian Minor", "Mela Hemavati", "Dorian Sharp Four", "Hedjaz", "Maqam Nakriz"]},
   "MSya":  { scaleDegreeTypeString: "2 b3 b5 5 b6 6", primary: false, names: ["Mela Syamalangi"]},
   "Alg":  { scaleDegreeTypeString: "2 b3 b5 5 b6 7", primary: false, names: ["Algerian", "Hungarian Minor", "Hungarian Gypsy", "Minor Gypsy", "Mela Simhendramadhyama", "Double Harmonic Minor", "Maqam Suzdil"]},
   "MSan":  { scaleDegreeTypeString: "2 b3 b5 5 b6 b7", primary: false, names: ["Mela Sanmukhapriya", "Hungarian Gypsy Two"]},
   "MNit":  { scaleDegreeTypeString: "2 b3 b5 5 b7 7", primary: false, names: ["Mela Nitimati"]},
   "RMadh":  { scaleDegreeTypeString: "3 4 5 6 b7 7", primary: true, names: ["Raga Madhuri"]},
   "CP":  { scaleDegreeTypeString: "b2 2 3 5 b6 6", primary: false, names: ["Chromatic Phrygian"]},
   "MMan":  { scaleDegreeTypeString: "b2 2 4 5 6 7", primary: false, names: ["Mela Manavati"]},
   "MVan":  { scaleDegreeTypeString: "b2 2 4 5 6 b7", primary: false, names: ["Mela Vanaspati"]},
   "Kal":  { scaleDegreeTypeString: "b2 2 4 5 b6 6", primary: false, names: ["Kalamurti", "Mela Kanakangi", "Chromatic Dorian", "Mela Bhavapriya"]},
   "MGana":  { scaleDegreeTypeString: "b2 2 4 5 b6 7", primary: false, names: ["Mela Ganamurti"]},
   "MRat":  { scaleDegreeTypeString: "b2 2 4 5 b6 b7", primary: false, names: ["Mela Ratnangi"]},
   "MTan":  { scaleDegreeTypeString: "b2 2 4 5 b7 7", primary: true, names: ["Mela Tanarupi"]},
   "CHPi":  { scaleDegreeTypeString: "b2 2 4 b5 5 6", primary: false, names: ["Chromatic Hypophrygian Inv"]},
   "CM":  { scaleDegreeTypeString: "b2 2 4 b5 5 b7", primary: false, names: ["Chromatic Mixolydian"]},
   "MPav":  { scaleDegreeTypeString: "b2 2 b5 5 6 7", primary: false, names: ["Mela Pavani", "Raga Kumbhini"]},
   "MNav":  { scaleDegreeTypeString: "b2 2 b5 5 6 b7", primary: true, names: ["Mela Navanitam"]},
   "MSal":  { scaleDegreeTypeString: "b2 2 b5 5 b6 6", primary: true, names: ["Mela Salaga", "Mela Salagam"]},
   "MJR":  { scaleDegreeTypeString: "b2 2 b5 5 b6 7", primary: true, names: ["Mela Jhalavarali"]},
   "MJ":  { scaleDegreeTypeString: "b2 2 b5 5 b6 b7", primary: true, names: ["Mela Jalarnava"]},
   "MRagh":  { scaleDegreeTypeString: "b2 2 b5 5 b7 7", primary: true, names: ["Mela Raghupriya", "Ghandarva"]},
   "MSur":  { scaleDegreeTypeString: "b2 3 4 5 6 7", primary: true, names: ["Mela Suryakantam", "Mela Suryakanta", "Bhairubahar That"]},
   "MChakrava":  { scaleDegreeTypeString: "b2 3 4 5 6 b7", primary: false, names: ["Mela Chakravakam", "Dorian Flat Two", "Bindumalini", "Harmonic Minor Inv.", "Maqam Hicaz"]},
   "MGaya":  { scaleDegreeTypeString: "b2 3 4 5 b6 6", primary: true, names: ["Mela Gayakapriya", "Mela Mayamalavagaula", "Gypsy Heptatonic"]},
   "DH":  { scaleDegreeTypeString: "b2 3 4 5 b6 7", primary: true, names: ["Double Harmonic", "Major Gypsy", "Byzantine", "Bhairav Theta", "Charhargah", "Gypsy", "Hijaz Kar", "Maqam Zengule"]},
   "SG":  { scaleDegreeTypeString: "b2 3 4 5 b6 b7", primary: true, names: ["Spanish Gypsy", "Phygian Dominant", "Ahaba Rabba", "Mela Vakulabharanam", "Flamenco Two", "Ahaba Rabba", "Major Phrygian"]},
   "MHat":  { scaleDegreeTypeString: "b2 3 4 5 b7 7", primary: true, names: ["Mela Hatakambari"]},
   "ChromL":  { scaleDegreeTypeString: "b2 3 4 b5 6 7", primary: false, names: ["Chromatic Lydian", "Oriental Three"]},
   "Per":  { scaleDegreeTypeString: "b2 3 4 b5 b6 7", primary: false, names: ["Persian", "Raga Lalita"]},
   "Ori":  { scaleDegreeTypeString: "b2 3 4 b5 b6 b7", primary: false, names: ["Oriental"]},
   "VED":  { scaleDegreeTypeString: "b2 3 4 b6 b7 7", primary: false, names: ["Verdi Enigmatic Descending"]},
   "MT":  { scaleDegreeTypeString: "b2 3 b5 5 6 7", primary: false, names: ["Marva Theta", "Marva That", "Mela Gamanasrama"]},
   "MRama":  { scaleDegreeTypeString: "b2 3 b5 5 6 b7", primary: true, names: ["Mela Ramapriya", "Oriental2"]},
   "MDha":  { scaleDegreeTypeString: "b2 3 b5 5 b6 6", primary: true, names: ["Mela Dhavalambari"]},
   "Bas":  { scaleDegreeTypeString: "b2 3 b5 5 b6 7", primary: true, names: ["Basant", "Double Harmonic Three", "Mela Kamavarardhani", "Purvi Theta", "Chromatic Hypolydian", "Kasiramakriya"]},
   "MNam":  { scaleDegreeTypeString: "b2 3 b5 5 b6 b7", primary: true, names: ["Mela Namanarayani"]},
   "MVis":  { scaleDegreeTypeString: "b2 3 b5 5 b7 7", primary: true, names: ["Mela Visvambari"]},
   "VEA":  { scaleDegreeTypeString: "b2 3 b5 b6 b7 7", primary: false, names: ["Verdi Enigmatic Ascending", "Enigmatic"]},
   "JA":  { scaleDegreeTypeString: "b2 b3 3 b5 b6 b7", primary: false, names: ["Jazz Altered", "Altered Dominant Scale", "ADS", "Diminished Whole Tone", "Super Locrian", "Altered", "Locrian Flat Four"]},
   "MNea":  { scaleDegreeTypeString: "b2 b3 4 5 6 7", primary: true, names: ["Neapolitan Major", "Mela Kokilapriya"]},
   "Jav":  { scaleDegreeTypeString: "b2 b3 4 5 6 b7", primary: false, names: ["Javanese", "Adonai Malakh", "Mela Natakapriya", "Jazz Minor Inv."]},
   "MSen":  { scaleDegreeTypeString: "b2 b3 4 5 b6 6", primary: false, names: ["Malini", "Mela Senavati"]},
   "Nea":  { scaleDegreeTypeString: "b2 b3 4 5 b6 7", primary: false, names: ["Neapolitan", "Mela Dhenuka"]},
   "Phr":  { scaleDegreeTypeString: "b2 b3 4 5 b6 b7", primary: false, names: ["Phrygian", "Neapolitan Minor Two", "Bhairav Theta", "Bhairavi Theta", "Mela Hanumattodi", "Greek Dorian", "In", "Major Inv.", "Maqam Kurd", "Maqam Shahnaz Kurdi", "Mechung", "Medieval Hypoaeolian"]},
   "MRup":  { scaleDegreeTypeString: "b2 b3 4 5 b7 7", primary: true, names: ["Mela Rupavati"]},
   "Locn6":  { scaleDegreeTypeString: "b2 b3 4 b5 6 b7", primary: false, names: ["Locrian Natural Six"]},
   "Loc":  { scaleDegreeTypeString: "b2 b3 4 b5 b6 b7", primary: false, names: ["Locrian", "Half Diminished", "Greek Hyperdorian", "Greek Mixolydian", "Half Diminished", "Locrian Minor", "Medieval Hypophrygian"]},
   "MSuv":  { scaleDegreeTypeString: "b2 b3 b5 5 6 7", primary: true, names: ["Mela Suvarnangi", "Raga Sauviram"]},
   "MSad":  { scaleDegreeTypeString: "b2 b3 b5 5 6 b7", primary: false, names: ["Mela Sadvidhamargini"]},
   "MGav":  { scaleDegreeTypeString: "b2 b3 b5 5 b6 6", primary: false, names: ["Mela Gavambodhi"]},
   "TodiT":  { scaleDegreeTypeString: "b2 b3 b5 5 b6 7", primary: false, names: ["Todi Theta", "Todi That", "Mela Subhapantuvarali"]},
   "MBha":  { scaleDegreeTypeString: "b2 b3 b5 5 b6 b7", primary: false, names: ["Mela Bhavapriya"]},
   "MDiv":  { scaleDegreeTypeString: "b2 b3 b5 5 b7 7", primary: true, names: ["Mela Divyamani"]},
   "MSul":  { scaleDegreeTypeString: "b3 3 4 5 6 7", primary: true, names: ["Mela Sulini"]},
   "MVag":  { scaleDegreeTypeString: "b3 3 4 5 6 b7", primary: true, names: ["Mela Vagadhisvari", "Bluesy R&R"]},
   "MYag":  { scaleDegreeTypeString: "b3 3 4 5 b6 6", primary: true, names: ["Mela Yagapriya"]},
   "MGang":  { scaleDegreeTypeString: "b3 3 4 5 b6 7", primary: true, names: ["Mela Gangeyabhusani"]},
   "MRaga":  { scaleDegreeTypeString: "b3 3 4 5 b6 b7", primary: true, names: ["Mela Ragavardhani", "Ahavoh Rabboh", "Alhijaz", "Harmonic Major Inv.", "Maqam Humaayun"]},
   "MCha":  { scaleDegreeTypeString: "b3 3 4 5 b7 7", primary: true, names: ["Mela Chalanata"]},
   "CHDi":  { scaleDegreeTypeString: "b3 3 4 b6 6 b7", primary: false, names: ["Chromatic Hypodorian Inv."]},
   "CPi":  { scaleDegreeTypeString: "b3 3 4 b6 b7 7", primary: false, names: ["Chromatic Phrygian Inv"]},
   "MKos":  { scaleDegreeTypeString: "b3 3 b5 5 6 7", primary: false, names: ["Mela Kosalam", "Lydian Sharp Two"]},
   "MHung":  { scaleDegreeTypeString: "b3 3 b5 5 6 b7", primary: true, names: ["Major Hungarian", "Mela Nasikabhusani", "Lydian Sharp Two"]},
   "MSuch":  { scaleDegreeTypeString: "b3 3 b5 5 b6 6", primary: true, names: ["Mela Sucharitra"]},
   "Dev":  { scaleDegreeTypeString: "b3 3 b5 5 b6 7", primary: false, names: ["Devarashtra", "Mela Dhatuvardhani"]},
   "MJyo":  { scaleDegreeTypeString: "b3 3 b5 5 b6 b7", primary: true, names: ["Mela Jyotisvarupini"]},
   "MRas":  { scaleDegreeTypeString: "b3 3 b5 5 b7 7", primary: false, names: ["Mela Rasikapriya"]},
   "Enigma":  { scaleDegreeTypeString: "b3 3 b5 b6 b7 7", primary: false, names: ["Enigmatic"]},
   "CHP":  { scaleDegreeTypeString: "b3 4 b5 5 b7 7", primary: false, names: ["Chromatic Hypophrgian"]},
   "GenD":  { scaleDegreeTypeString: "2 3 4 5 6 b7 7", primary: false, names: ["Genus Diatonicum", "Bebop Dominant", "Chinese Eight Tone"]},
   "MBebop":  { scaleDegreeTypeString: "2 3 4 5 b6 6 7", primary: false, names: ["Major Bebop"]},
   "Ich":  { scaleDegreeTypeString: "2 3 4 b5 5 6 7", primary: false, names: ["Ichikotsucho", "Genus Diatonicum Veterum Correctum"]},
   "MM6i":  { scaleDegreeTypeString: "2 3 4 b5 b6 b7 7", primary: true, names: ["Messiaen Mode Six Inv."]},
   "-Bebop":  { scaleDegreeTypeString: "2 b3 3 4 5 6 b7", primary: true, names: ["Minor Bebop"]},
   "RMKM":  { scaleDegreeTypeString: "2 b3 4 5 6 b7 7", primary: true, names: ["Raga Mian Ki Malhar"]},
   "Ziraf":  { scaleDegreeTypeString: "2 b3 4 5 b6 6 7", primary: true, names: ["Zirafkend"]},
   "RMuk":  { scaleDegreeTypeString: "2 b3 4 5 b6 6 b7", primary: false, names: ["Raga Mukhari"]},
   "MqNah":  { scaleDegreeTypeString: "2 b3 4 5 b6 b7 7", primary: false, names: ["Maqam Nahawand", "Major Minor Mixed"]},
   "B4":  { scaleDegreeTypeString: "2 b3 4 b5 5 6 b7", primary: false, names: ["Blues Scale Four"]},
   "AO":  { scaleDegreeTypeString: "2 b3 4 b5 5 b6 7", primary: false, names: ["Algerian Octatonic"]},
   "Dim":  { scaleDegreeTypeString: "2 b3 4 b5 b6 6 7", primary: false, names: ["Diminished", "Auxiliary Diminished", "Arabian Octatonic", "Diminished Minor"]},
   "RCint":  { scaleDegreeTypeString: "2 b3 b5 5 b6 6 b7", primary: true, names: ["Raga Cintamani"]},
   "MM6":  { scaleDegreeTypeString: "b2 2 3 b5 5 b6 7", primary: true, names: ["Messiaen Mode Six"]},
   "AM":  { scaleDegreeTypeString: "b2 2 b3 4 5 6 b7", primary: true, names: ["Adonai Malakh"]},
   "M4":  { scaleDegreeTypeString: "b2 2 b3 b5 5 b6 6", primary: true, names: ["Messiaen Mode Four"]},
   "RSaur":  { scaleDegreeTypeString: "b2 3 4 5 b6 6 7", primary: true, names: ["Raga Saurastra"]},
   "MqHij":  { scaleDegreeTypeString: "b2 3 4 5 b6 b7 7", primary: true, names: ["Maqam Hijaz"]},
   "RBhat":  { scaleDegreeTypeString: "b2 3 4 b5 5 6 7", primary: true, names: ["Raga Bhatiyar"]},
   "RRam":  { scaleDegreeTypeString: "b2 3 4 b5 5 b6 7", primary: false, names: ["Raga Ramkali"]},
   "MqSha":  { scaleDegreeTypeString: "b2 3 4 b5 6 b7", primary: false, names: ["Maqam Shaddaraban"]},
   "VE":  { scaleDegreeTypeString: "b2 3 4 b5 b6 b7 7", primary: true, names: ["Verdi Enigmatica"]},
   "Flam":  { scaleDegreeTypeString: "b2 b3 3 4 5 b6 b7", primary: true, names: ["Flamenco", "Spanish Phrygian"]},
   "Espla":  { scaleDegreeTypeString: "b2 b3 3 4 b5 b6 7", primary: false, names: ["Espla"]},
   "ETS":  { scaleDegreeTypeString: "b2 b3 3 4 b5 b6 b7", primary: false, names: ["Eight Tone Spanish"]},
   "Oct":  { scaleDegreeTypeString: "b2 b3 3 b5 5 6 b7", primary: true, names: ["Octatonic", "Auxiliary Diminished Blues", "Composite", "Diminished Inv.", "Diminished Dominant", "Half-Whole Step"]},
   "MA":  { scaleDegreeTypeString: "b2 b3 3 b5 b6 6 7", primary: false, names: ["Magen Abot"]},
   "BHDO":  { scaleDegreeTypeString: "b2 b3 4 b5 6 b7 7", primary: false, names: ["Bebop Half-diminished Oct"]},
   "B5":  { scaleDegreeTypeString: "b3 3 4 b5 5 b7 7", primary: true, names: ["Blues v.5"]},
   "M4i":  { scaleDegreeTypeString: "b3 3 4 b5 6 b7 7", primary: false, names: ["Messiaen Mode Four Inv."]},
   "Taish":  { scaleDegreeTypeString: "2 3 4 b5 5 6 b7 7", primary: true, names: ["Taishikicho"]},
   "B9":  { scaleDegreeTypeString: "2 b3 3 4 b5 5 6 b7", primary: true, names: ["Blues Nonatonic"]},
   "9T":  { scaleDegreeTypeString: "2 b3 3 4 b5 b6 6 7", primary: true, names: ["Nine Tone"]},
   "Mess3i":  { scaleDegreeTypeString: "2 b3 3 b5 5 b6 7", primary: false, names: ["Messiaen Mode Three Inv"]},
   "RRM":  { scaleDegreeTypeString: "2 b3 3 b5 b6 6 b7 7", primary: true, names: ["Raga Ramdasi Malhar"]},
   "RPil":  { scaleDegreeTypeString: "2 b3 4 5 b6 6 b7 7", primary: true, names: ["Raga Pilu"]},
   "Mess3":  { scaleDegreeTypeString: "b2 2 3 4 5 b6 6 b7", primary: false, names: ["Messiaen Mode Three"]},
   "Youl":  { scaleDegreeTypeString: "b2 2 3 4 b5 5 6 b7", primary: true, names: ["Youlan"]},
   "GenC":  { scaleDegreeTypeString: "b2 b3 3 4 5 b6 6 7", primary: true, names: ["Genus Chromaticum"]},
   "Moor":  { scaleDegreeTypeString: "b2 b3 3 4 5 b6 b7 7", primary: true, names: ["Moorish Phrygian"]},
   "B6":  { scaleDegreeTypeString: "b3 3 4 b5 5 6 b7 7", primary: true, names: ["Blues v6"]},
   "-MMix":  { scaleDegreeTypeString: "2 b3 3 4 5 b6 6 b7 7", primary: true, names: ["Minor Major Mixed"]},
   "-PentL":  { scaleDegreeTypeString: "2 b3 3 4 b5 5 6 b7 7", primary: false, names: ["Minor Pentatonic with Leading"]},
   "MM7i":  { scaleDegreeTypeString: "2 b3 3 4 b5 b6 6 b7 7", primary: false, names: ["Messiaen Mode Seven Inv"]},
   "SD":  { scaleDegreeTypeString: "b2 2 3 4 b5 5 b6 b7 7", primary: true, names: ["Symmetrical Diatonic"]},
   "RSB":  { scaleDegreeTypeString: "b2 2 b3 3 4 5 b6 6 7", primary: true, names: ["Raga Sindhi Bhairavi"]},
   "MM7":  { scaleDegreeTypeString: "b2 2 b3 3 b5 5 b6 6 b7", primary: false, names: ["Messiaen Mode Seven"]},
   "Chrom":  { scaleDegreeTypeString: "b2 2 b3 3 4 b5 5 b6 6 b7 7", primary: true, names: ["Chromatic"]},
   "Norw":  { scaleDegreeTypeString: "2 3 4 5 b6", primary: false, names: ["Norwegian"]},
   "GT":  { scaleDegreeTypeString: "b2 3 4", primary: true, names: ["Gypsy Tetrachord", "Ahava Raba", "Odessa Bulgar", "Hijaz", "Suzidil", "Shahnaz", "Shadd Araban", "Chromatic Mezotetrachord", "Arabian Tetramirror"]},
   "-Tet":  { scaleDegreeTypeString: "2 b3 4", primary: true, names: ["Minor Tetrachord", "Busalik", "Nahawand", "Phrygian Tetrachord", "MInor Tetramirror"]},
   "Ajam":  { scaleDegreeTypeString: "2 3 4", primary: false, names: ["Ajam", "Jahar Kah", "Major Tetrachord", "Lydian Tetrachord"]},
   "His":  { scaleDegreeTypeString: "2 b3 b5", primary: true, names: ["Hisar", "Dim Add Two"]},
   "Kurd":  { scaleDegreeTypeString: "b2 b3 4", primary: true, names: ["Kurdi", "Dorian Tetrachord"]},
   "I6":  { scaleDegreeTypeString: "3 6", primary: false, names: ["Italian Six", "Raga Bilwadala"]},
   "Gow":  { scaleDegreeTypeString: "b2 4 b6", primary: false, names: ["Gowleeswari", "Raga Lavangi"]},
   "RHari":  { scaleDegreeTypeString: "2 4 b6", primary: false, names: ["Raga Haripriya"]},
   "RSum":  { scaleDegreeTypeString: "2 b5 7", primary: true, names: ["Raga Sumukam"]},
   "BH":  { scaleDegreeTypeString: "b2 b3 4 b5 b6 7", primary: false, names: ["Bebob Half-diminished"]},
   "Bib":  { scaleDegreeTypeString: "b2 3 b5 6", primary: false, names: ["Bibhas"]},
   "BTriM":  { scaleDegreeTypeString: "b2 2", primary: true, names: ["Bach Trimirror", "Chromatic Trimirror"]},
   "PTC":  { scaleDegreeTypeString: "b2 b3", primary: true, names: ["Phrygian Trichord"]},
   "-TC":  { scaleDegreeTypeString: "2 b3", primary: true, names: ["Minor Trichord"]},
   "BTetM":  { scaleDegreeTypeString: "b2 2 b3", primary: true, names: ["Bach Tetramirror", "Chromatic Tetramirror"]},
   "-MTC":  { scaleDegreeTypeString: "b2 3", primary: true, names: ["Major-Minor Trichord"]},
   "M2TetC2":  { scaleDegreeTypeString: "b2 2 3", primary: true, names: ["Major-second Tetracluster"]},
   "ATetM":  { scaleDegreeTypeString: "b2 b3 3", primary: true, names: ["Alternating Tetramirror"]},
   "M2TetC1":  { scaleDegreeTypeString: "2 b3 3", primary: true, names: ["Major Second Tetracluster"]},
   "C5PentM":  { scaleDegreeTypeString: "b2 2 b3 3", primary: true, names: ["Chromatic Pentamirror"]},
   "-7inc":  { scaleDegreeTypeString: "2 4", primary: false, names: ["Incomplete Minor Seventh"]},
   "-3TetC":  { scaleDegreeTypeString: "b2 2 4", primary: true, names: ["Minor Third Tetracluster 1"]},
   "M2Pent":  { scaleDegreeTypeString: "b2 2 b3 4", primary: true, names: ["Major Second Pentacluster"]},
   "-2M5":  { scaleDegreeTypeString: "b2 2 3 4", primary: true, names: ["Minor Second Major Pentachord"]},
   "Chaio":  { scaleDegreeTypeString: "2 4 b6 b7", primary: false, names: ["Chaio"]},
   "Chan":  { scaleDegreeTypeString: "b3 b5 b6 b7", primary: false, names: ["Chan", "Chin", "Raga Harikauns"]},
   "CDi":  { scaleDegreeTypeString: "2 b3 3 4 5 b7 7", primary: true, names: ["Chromatic Dorian Inverse"]},
   "HK":  { scaleDegreeTypeString: "2 4 5 b6", primary: false, names: ["Han-Kumoi", "Japanese Two,Raga Shobhavari", "Sutradhari"]},
   "Hin":  { scaleDegreeTypeString: "3 4 6 7", primary: false, names: ["Hindolita", "Kaushikdhvani", "Raga Bhinna Shadja", "Kaushikdhvani"]},
   "HPF":  { scaleDegreeTypeString: "b2 b3 4 b5 b7", primary: false, names: ["Honchoshi Plagal Form"]},
   "Jan":  { scaleDegreeTypeString: "2 3 5 b6", primary: false, names: ["Janasammodini", "Raga Bhupeshwari"]},
   "RJay":  { scaleDegreeTypeString: "b3 4 b5 b7", primary: false, names: ["Raga Jayakauns", "Kumoi Two"]},
   "Kyem":  { scaleDegreeTypeString: "b3 4 5 6", primary: false, names: ["Kyemyonjo"]},
   "Locb4bb7":  { scaleDegreeTypeString: "b2 b3 3 b5 b6 6", primary: false, names: ["Locrian Flat 4 Double Flat 7"]},
   "MqHuz":  { scaleDegreeTypeString: "b2 b3 3 5 b6 b7", primary: false, names: ["Maqam Huzzam"]},
   "RBud":  { scaleDegreeTypeString: "2 3 4 5", primary: true, names: ["Raga Budhamanohari"]},
   "Raj":  { scaleDegreeTypeString: "b3 4 6 7", primary: true, names: ["Rajeshwari", "Raga Chandrakauns Modern", "Marga Hindola"]},
   "Sur":  { scaleDegreeTypeString: "b3 4 6 b7", primary: false, names: ["Surya", "Varamu", "Raga Chandrakauns Kafi"]},
   "RCK":  { scaleDegreeTypeString: "b3 4 b6 7", primary: false, names: ["Raga Chaundrakauns Kiravani"]},
   "RChi":  { scaleDegreeTypeString: "b2 b3 4 b6", primary: false, names: ["Raga Chitthakarshini"]},
   "RDesh":  { scaleDegreeTypeString: "2 4 5 7", primary: false, names: ["Raga Desh"]},
   "RDev":  { scaleDegreeTypeString: "4 5 b6 7", primary: true, names: ["Raga Devaranjani", "Devaranji"]},
   "RDS":  { scaleDegreeTypeString: "3 b5 5 6", primary: false, names: ["Raga Dhavalashri"]},
   "Bac":  { scaleDegreeTypeString: "3 4 b6 7", primary: false, names: ["Bacovia", "Raga Girija"]},
   "RGuh":  { scaleDegreeTypeString: "2 4 6 b7", primary: false, names: ["Raga Guhamanohari"]},
   "RKD":  { scaleDegreeTypeString: "3 4 6 b7", primary: false, names: ["Raga Khamaj Durga"]},
   "RKP":  { scaleDegreeTypeString: "b3 4 5 b6", primary: false, names: ["Raga Kokil Pancham"]},
   "RKumarP":  { scaleDegreeTypeString: "b2 2 b6 7", primary: true, names: ["Raga Kumarpriya"]},
   "RKunt":  { scaleDegreeTypeString: "4 5 6 b7", primary: false, names: ["Raga Kunkvarali", "Kuntavarali"]},
   "RMK":  { scaleDegreeTypeString: "2 5 6 b7", primary: true, names: ["Raga Matha Kokila", "Matkokil"]},
   "RMoh":  { scaleDegreeTypeString: "b3 3 5 6", primary: false, names: ["Raga Mohanangi"]},
   "RMult":  { scaleDegreeTypeString: "b3 b5 5 7", primary: false, names: ["Raga Multani"]},
   "RMand":  { scaleDegreeTypeString: "3 4 5 6", primary: false, names: ["Raga Mand", "Raga Nagasvaravali"]},
   "RNer":  { scaleDegreeTypeString: "2 3 6 7", primary: false, names: ["Raga Neroshta"]},
   "RHind":  { scaleDegreeTypeString: "3 b5 6 7", primary: false, names: ["Raga Hindol", "Sunada Vinodini", "Sanjh ka Hindol"]},
   "RPri":  { scaleDegreeTypeString: "2 4 b6 7", primary: true, names: ["Raga Priyadarshini"]},
   "Purv":  { scaleDegreeTypeString: "4 5 6 7", primary: true, names: ["Purvaholika", "Raga Puruhutika"]},
   "RPut":  { scaleDegreeTypeString: "b2 2 b6 6", primary: false, names: ["Raga Putrika"]},
   "RRasran":  { scaleDegreeTypeString: "2 4 6 7", primary: false, names: ["Raga Rasranjani"]},
   "MP":  { scaleDegreeTypeString: "b3 b5 5 b7", primary: true, names: ["Madhukauns Pentatonic", "Raga Samudhra Priya"]},
   "Var":  { scaleDegreeTypeString: "b3 5 b6 b7", primary: false, names: ["Varini", "Raga Shailaja"]},
   "RSK":  { scaleDegreeTypeString: "2 b5 5 6", primary: false, names: ["Raga Shri Kalyan"]},
   "RShu":  { scaleDegreeTypeString: "2 b5 6 7", primary: false, names: ["Raga Shubravarni"]},
   "Ham":  { scaleDegreeTypeString: "2 b5 5 7", primary: false, names: ["Hamsanada", "Raga Vaijayanti"]},
   "RZil":  { scaleDegreeTypeString: "3 4 5 b6", primary: false, names: ["Raga Zilaf"]},
   "RKash":  { scaleDegreeTypeString: "b2 b3 5 b6 b7", primary: false, names: ["Raga Kashyapi"]},
   "RKalaK":  { scaleDegreeTypeString: "b2 4 5 b6 6", primary: true, names: ["Raga Kalakanthi"]},
   "RNil":  { scaleDegreeTypeString: "2 b3 b5 b6 6", primary: true, names: ["Raga Nilangi"]},
   "RNish":  { scaleDegreeTypeString: "2 b5 5 6 7", primary: false, names: ["Raga Nishadi"]},
   "n7sus4":  { scaleDegreeTypeString: "4 5 7", primary: true, names: ["Natural Seven Sus Four"]},
   "Trans":  { scaleDegreeTypeString: "b5 5 b7", primary: true, names: ["Transformative"]},
   "Chaos":  { scaleDegreeTypeString: "b2 5 b6", primary: true, names: ["Chaos"]},
   "F6":  { scaleDegreeTypeString: "3 b5 6", primary: false, names: ["French Six"]},
   "Ser":  { scaleDegreeTypeString: "4 b6 7", primary: true, names: ["Serotonin"]},
   "Dop":  { scaleDegreeTypeString: "b3 b5 7", primary: true, names: ["Dopamine"]},
   "Nora":  { scaleDegreeTypeString: "2 b6 7", primary: true, names: ["Noradrenaline"]},
   "P7":  { scaleDegreeTypeString: "5 7", primary: true, names: ["Perfect Seventh"]},
   "M7om5":  { scaleDegreeTypeString: "3 7", primary: true, names: ["Major Seven Omit Five"]},
   "7om5":  { scaleDegreeTypeString: "3 b7", primary: true, names: ["Seven Omit Five"]},
   "T7":  { scaleDegreeTypeString: "b5 7", primary: true, names: ["Tritone Seven"]},
   "aug9":  { scaleDegreeTypeString: "b3 3 b7", primary: false, names: ["Aug9"]},
   "oaddb6":  { scaleDegreeTypeString: "b3 b5 b6", primary: false, names: ["Dim Add Flat Six"]},
   "sus2add6":  { scaleDegreeTypeString: "2 5 6", primary: false, names: ["Sus Two Add Six"]},
   "sus2add7":  { scaleDegreeTypeString: "2 5 7", primary: false, names: ["Sus Two Add Seven"]},
   "-M":  { scaleDegreeTypeString: "b3 3 5", primary: true, names: ["Minor Major Chord"]},
   "Myst":  { scaleDegreeTypeString: "b2 b3 b5", primary: true, names: ["Mysterious"]},
   "Murd":  { scaleDegreeTypeString: "b2 5 6", primary: true, names: ["Murder"]},
   "Fel":  { scaleDegreeTypeString: "4 6 7", primary: true, names: ["Feline"]},
   "GM":  { scaleDegreeTypeString: "5 b7 7", primary: true, names: ["GermanMovie"]},
   "WM":  { scaleDegreeTypeString: "2 3", primary: true, names: ["Windy Morning"]},
   "Con":  { scaleDegreeTypeString: "2 3 b7", primary: true, names: ["Conception"]},
   "-MT":  { scaleDegreeTypeString: "b3 3", primary: true, names: ["Minor Major Triad"]},
   "Molo":  { scaleDegreeTypeString: "b2 4 7", primary: true, names: ["Molokai"]},
   "BigI":  { scaleDegreeTypeString: "b2 b5 7", primary: true, names: ["BigIsland"]},
   "Kau":  { scaleDegreeTypeString: "b2 5 7", primary: true, names: ["Kauai"]},
   "WF":  { scaleDegreeTypeString: "b2 5 6 b7", primary: true, names: ["Waterfall"]},
   "Tsu":  { scaleDegreeTypeString: "b5 5 6 7", primary: true, names: ["Tsunami"]},
   "Psy":  { scaleDegreeTypeString: "b5 5 6 b7", primary: true, names: ["Psychic"]},
   "Liq":  { scaleDegreeTypeString: "b2 b3 3 6", primary: true, names: ["Liquid"]},
   "Dram":  { scaleDegreeTypeString: "b2 b5 5 b7", primary: true, names: ["Drama"]},
   "LT":  { scaleDegreeTypeString: "2 5 b6 7", primary: true, names: ["Lifetime"]},
   "Fe":  { scaleDegreeTypeString: "b2 b5 5 6", primary: true, names: ["Iron"]},
   "Bardo":  { scaleDegreeTypeString: "b2 b3 3 5", primary: true, names: ["Bardo"]},
   "Fiji":  { scaleDegreeTypeString: "3 5 b6 b7", primary: true, names: ["Fiji"]},
   "Twi":  { scaleDegreeTypeString: "b2 b3 5 6", primary: true, names: ["Twilight"]},
   "Suave":  { scaleDegreeTypeString: "b3 3 5 b6", primary: true, names: ["Suave"]},
   "Pra":  { scaleDegreeTypeString: "b2 b5 5 6 b7", primary: true, names: ["Prana"]},
   "Ethe":  { scaleDegreeTypeString: "b3 3 5 6 b7", primary: true, names: ["Ethereal"]},
   "Perf":  { scaleDegreeTypeString: "b2 5 6 7", primary: true, names: ["Perfection"]},
   "Azure":  { scaleDegreeTypeString: "b2 b6 6 7", primary: true, names: ["Azure"]},
   "Coc":  { scaleDegreeTypeString: "b2 b3 6 7", primary: true, names: ["Coconut"]},
   "Tong":  { scaleDegreeTypeString: "b2 b5 b6 7", primary: true, names: ["Tonga"]},
   "Astral":  { scaleDegreeTypeString: "b2 b5 b6 6 7", primary: true, names: ["Astral"]},
   "Sum":  { scaleDegreeTypeString: "b2 3 6 7", primary: true, names: ["Sumatra"]},
   "And":  { scaleDegreeTypeString: "b2 b3 3 6 7", primary: true, names: ["Andaman"]},
   "Tim":  { scaleDegreeTypeString: "b2 b5 5 7", primary: true, names: ["Timor"]},
   "Lom":  { scaleDegreeTypeString: "b2 b5 5 6 7", primary: true, names: ["Lombok"]},
   "Borneo":  { scaleDegreeTypeString: "b2 b3 b6 6 7", primary: true, names: ["Borneo"]},
   "Put":  { scaleDegreeTypeString: "b2 3 b5 7", primary: true, names: ["Putri"]},
   "Hal":  { scaleDegreeTypeString: "b2 b3 b5 7", primary: true, names: ["Halmahera"]},
   "Gal":  { scaleDegreeTypeString: "b2 b3 4 b5 7", primary: true, names: ["Galangal"]},
   "Luz":  { scaleDegreeTypeString: "b2 b3 3 b5 7", primary: true, names: ["Luzon"]},
   "Pal":  { scaleDegreeTypeString: "b2 4 6 7", primary: true, names: ["Palawan"]},
   "Sam":  { scaleDegreeTypeString: "b2 b3 5 7", primary: true, names: ["Samar"]},
   "Bora":  { scaleDegreeTypeString: "b2 4 b6 7", primary: true, names: ["Bora Bora"]},
   "Nic":  { scaleDegreeTypeString: "b2 b3 3 b6 7", primary: true, names: ["Nicobar"]},
   "Sky":  { scaleDegreeTypeString: "b2 4 b6 6 7", primary: true, names: ["Skyros"]},
   "Pax":  { scaleDegreeTypeString: "b2 b3 3 b6 6 7", primary: true, names: ["Paxos"]},
   "Ler":  { scaleDegreeTypeString: "b2 3 5 7", primary: true, names: ["Leros"]},
   "Gom":  { scaleDegreeTypeString: "b2 b3 3 5 7", primary: true, names: ["Gomera"]},
   "Baltra":  { scaleDegreeTypeString: "b2 b3 3 b5 5 7", primary: true, names: ["Baltra"]},
   "Gug":  { scaleDegreeTypeString: "b2 3 5 6 7", primary: true, names: ["Guguan"]},
   "Guam":  { scaleDegreeTypeString: "b2 b3 b5 6 7", primary: true, names: ["Guam"]},
   "Tob":  { scaleDegreeTypeString: "b2 b3 4 b6 7", primary: true, names: ["Tobago"]},
   "Such":  { scaleDegreeTypeString: "b2 3 b5 b6 7", primary: true, names: ["Suchness"]},
   "Hua":  { scaleDegreeTypeString: "b2 b3 3 5 6 7", primary: true, names: ["Huahine"]},
   "Sul":  { scaleDegreeTypeString: "b2 b3 b5 b6 6 7", primary: true, names: ["Sulawesi"]},
   "Sib":  { scaleDegreeTypeString: "b2 b3 3 b5 6 7", primary: true, names: ["Siberut"]},
   "Nii":  { scaleDegreeTypeString: "b2 b5 6 7", primary: true, names: ["Niihau"]},
   "Mak":  { scaleDegreeTypeString: "b2 b3 b6 7", primary: true, names: ["Makira"]},
   "H":  { scaleDegreeTypeString: "b2 b3 4 7", primary: true, names: ["Hydrogen"]},
   "He":  { scaleDegreeTypeString: "2 b3 3 4", primary: true, names: ["Helium"]},
   "Lith":  { scaleDegreeTypeString: "b2 2 4 7", primary: true, names: ["Lithium"]},
   "Ber":  { scaleDegreeTypeString: "b2 2 5 7", primary: true, names: ["Beryllium"]},
   "Bor":  { scaleDegreeTypeString: "b2 2 b5 7", primary: true, names: ["Boron"]},
   "Cf":  { scaleDegreeTypeString: "b2 2 b3 3 7", primary: true, names: ["Californium"]},
   "Nit":  { scaleDegreeTypeString: "b2 2 b3 6 7", primary: true, names: ["Nitrogen"]},
   "Oxy":  { scaleDegreeTypeString: "b2 2 b6 6 7", primary: true, names: ["Oxygen"]},
   "Es":  { scaleDegreeTypeString: "b2 b3 3 4 7", primary: true, names: ["Einsteinium"]},
   "Ne":  { scaleDegreeTypeString: "b2 2 3 4 7", primary: true, names: ["Neon"]},
   "NA":  { scaleDegreeTypeString: "b2 2 3 b7 7", primary: true, names: ["Sodium"]},
   "Mg":  { scaleDegreeTypeString: "b2 2 5 b7 7", primary: true, names: ["Magnesium"]},
   "Al":  { scaleDegreeTypeString: "b2 2 3 6 7", primary: true, names: ["Aluminum"]},
   "Sil":  { scaleDegreeTypeString: "b2 2 5 b6 7", primary: true, names: ["Silicon"]},
   "Pho":  { scaleDegreeTypeString: "b2 2 4 b5 7", primary: true, names: ["Phosphorus"]},
   "S":  { scaleDegreeTypeString: "b2 2 3 b5 7", primary: true, names: ["Sulfur"]},
   "Cl":  { scaleDegreeTypeString: "b2 2 4 b7 7", primary: true, names: ["Chlorine"]},
   "Mn":  { scaleDegreeTypeString: "b2 2 b3 5 7", primary: true, names: ["Manganese"]},
   "Co":  { scaleDegreeTypeString: "b2 2 b5 6 7", primary: true, names: ["Cobalt"]},
   "Ni":  { scaleDegreeTypeString: "b2 2 3 b6 7", primary: true, names: ["Nickel"]},
   "Cu":  { scaleDegreeTypeString: "b2 2 4 6 7", primary: true, names: ["Copper"]},
   "Ar":  { scaleDegreeTypeString: "b2 2 4 b6 7", primary: true, names: ["Argon"]},
   "K":  { scaleDegreeTypeString: "b2 2 3 5 7", primary: true, names: ["Potassium"]},
   "Ca":  { scaleDegreeTypeString: "b2 2 b5 b6 7", primary: true, names: ["Calcium"]},
   "Sc":  { scaleDegreeTypeString: "b2 2 3 b6 b7", primary: true, names: ["Scandium"]},
   "Ti":  { scaleDegreeTypeString: "b2 2 b5 5 7", primary: true, names: ["Titanium"]},
   "V":  { scaleDegreeTypeString: "b2 2 4 5 7", primary: true, names: ["Vanadium"]},
   "Cr":  { scaleDegreeTypeString: "b2 2 b3 3 4 7", primary: true, names: ["Chromium"]},
   "Zn":  { scaleDegreeTypeString: "b2 2 b3 3 6 7", primary: true, names: ["Zinc"]},
   "Ga":  { scaleDegreeTypeString: "b2 2 b3 b6 6 7", primary: true, names: ["Gallium"]},
   "Ge":  { scaleDegreeTypeString: "b2 2 5 b6 6 7", primary: true, names: ["Germanium"]},
   "As":  { scaleDegreeTypeString: "b2 2 3 4 b5 7", primary: true, names: ["Arsenic"]},
   "Se":  { scaleDegreeTypeString: "b2 2 b3 4 b5 7", primary: true, names: ["Selenium"]},
   "Br":  { scaleDegreeTypeString: "b2 2 b3 3 b5 7", primary: true, names: ["Bromine"]},
   "Kr":  { scaleDegreeTypeString: "b2 2 b3 3 b6 7", primary: true, names: ["Krypton"]},
   "Rb":  { scaleDegreeTypeString: "b2 2 b3 5 6 7", primary: true, names: ["Rubidium"]},
   "Sr":  { scaleDegreeTypeString: "b2 2 b5 b6 6 7", primary: true, names: ["Strontium"]},
   "Y":  { scaleDegreeTypeString: "b2 4 5 b6 6 7", primary: true, names: ["Yttrium"]},
   "Zr":  { scaleDegreeTypeString: "b2 2 3 4 6 7", primary: true, names: ["Zirconium"]},
   "Nb":  { scaleDegreeTypeString: "b2 2 b3 4 6 7", primary: true, names: ["Niobium"]},
   "Mo":  { scaleDegreeTypeString: "b2 2 3 b6 6 7", primary: true, names: ["Molybdenum"]},
   "Tc":  { scaleDegreeTypeString: "b2 b3 5 b6 6 7", primary: true, names: ["Technetium"]},
   "Ru":  { scaleDegreeTypeString: "b2 2 3 4 5 7", primary: true, names: ["Ruthenium"]},
   "Rh":  { scaleDegreeTypeString: "b2 2 b3 b5 5 7", primary: true, names: ["Rhodium"]},
   "Pd":  { scaleDegreeTypeString: "b2 2 b3 4 5 7", primary: true, names: ["Palladium"]},
   "Ag":  { scaleDegreeTypeString: "b2 2 b3 3 5 7", primary: true, names: ["Silver"]},
   "Cd":  { scaleDegreeTypeString: "b2 2 b3 b5 6 7", primary: true, names: ["Cadmium"]},
   "In":  { scaleDegreeTypeString: "b2 2 3 4 b6 7", primary: true, names: ["Indium"]},
   "Sn":  { scaleDegreeTypeString: "b2 2 b3 4 b6 7", primary: true, names: ["Tin"]},
   "Sb":  { scaleDegreeTypeString: "b2 2 3 b5 6 7", primary: true, names: ["Antimony"]},
   "Te":  { scaleDegreeTypeString: "b2 2 b3 3 4 b5 7", primary: true, names: ["Tellurium"]},
   "I":  { scaleDegreeTypeString: "b2 2 b3 3 4 6 7", primary: true, names: ["Iodine"]},
   "Xe":  { scaleDegreeTypeString: "b2 2 b3 3 b6 6 7", primary: true, names: ["Xenon"]},
   "Cs":  { scaleDegreeTypeString: "b2 b3 3 4 b5 5 7", primary: true, names: ["Cesium"]},
   "Ba":  { scaleDegreeTypeString: "b2 2 3 4 b5 5 7", primary: true, names: ["Barium"]},
   "La":  { scaleDegreeTypeString: "b2 2 b3 4 b5 5 7", primary: true, names: ["Lanthanum"]},
   "Ce":  { scaleDegreeTypeString: "b2 2 b3 3 b5 5 7", primary: true, names: ["Cerium"]},
   "Pr":  { scaleDegreeTypeString: "b2 2 b3 3 4 5 7", primary: true, names: ["Praseodymium"]},
   "Nd":  { scaleDegreeTypeString: "b2 2 b3 3 4 b6 7", primary: true, names: ["Neodymium"]},
   "Pm":  { scaleDegreeTypeString: "b2 2 b3 3 5 6 7", primary: true, names: ["Prometheum"]},
   "Sm":  { scaleDegreeTypeString: "b2 2 b3 b5 b6 6 7", primary: true, names: ["Samarium"]},
   "Eu":  { scaleDegreeTypeString: "b2 2 4 5 b6 6 7", primary: true, names: ["Europium"]},
   "Gd":  { scaleDegreeTypeString: "b2 3 b5 5 b6 6 7", primary: true, names: ["Gadolineum"]},
   "Tb":  { scaleDegreeTypeString: "b2 2 b3 4 b5 6 7", primary: true, names: ["Terbium"]},
   "Dy":  { scaleDegreeTypeString: "b2 2 b3 3 b5 6 7", primary: true, names: ["Dysprosium"]},
   "Ho":  { scaleDegreeTypeString: "b2 2 b3 3 5 b6 7", primary: true, names: ["Holmium"]},
   "Er":  { scaleDegreeTypeString: "b2 2 b3 b5 5 6 7", primary: true, names: ["Erbium"]},
   "Tm":  { scaleDegreeTypeString: "b2 2 3 4 b6 6 7", primary: true, names: ["Thulium"]},
   "Yb":  { scaleDegreeTypeString: "b2 2 b3 4 b6 6 7", primary: true, names: ["Ytterbium"]},
   "Lu":  { scaleDegreeTypeString: "b2 b3 3 b5 5 b6 7", primary: true, names: ["Lutetium"]},
   "Hf":  { scaleDegreeTypeString: "b2 b3 3 4 5 b6 7", primary: true, names: ["Halfnium"]},
   "Ta":  { scaleDegreeTypeString: "b2 2 3 4 5 b6 7", primary: true, names: ["Tantalum"]},
   "W":  { scaleDegreeTypeString: "b2 b3 b5 5 b6 6 7", primary: true, names: ["Tungsten"]},
   "Re":  { scaleDegreeTypeString: "b2 2 b3 4 b5 b6 7", primary: true, names: ["Rhenium"]},
   "Os":  { scaleDegreeTypeString: "b2 2 b3 3 b5 b6 7", primary: true, names: ["Osmium"]},
   "Ir":  { scaleDegreeTypeString: "b2 2 b3 4 5 6 7", primary: true, names: ["Iridium"]},
   "Pt":  { scaleDegreeTypeString: "b2 b3 3 4 5 6 7", primary: true, names: ["Platinum"]},
   "Au":  { scaleDegreeTypeString: "b2 b3 4 b5 b6 6 7", primary: true, names: ["Gold"]},
   "Hg":  { scaleDegreeTypeString: "b2 2 b3 3 4 b5 5 7", primary: true, names: ["Mercury"]},
   "Tl":  { scaleDegreeTypeString: "b2 2 b3 3 4 b5 6 7", primary: true, names: ["Thalium"]},
   "Pb":  { scaleDegreeTypeString: "b2 2 b3 3 4 b6 6 7", primary: true, names: ["Lead"]},
   "Bi":  { scaleDegreeTypeString: "b2 b3 3 4 b5 5 b6 7", primary: true, names: ["Bismuth"]},
   "Po":  { scaleDegreeTypeString: "b2 2 3 4 b5 5 b6 7", primary: true, names: ["Polonium"]},
   "At":  { scaleDegreeTypeString: "b2 2 b3 3 b5 5 b6 7", primary: true, names: ["Astatine"]},
   "Rn":  { scaleDegreeTypeString: "b2 2 b3 3 4 5 b6 7", primary: true, names: ["Radon"]},
   "Fr":  { scaleDegreeTypeString: "b2 2 b3 3 4 b5 b6 7", primary: true, names: ["Francium"]},
   "Ra":  { scaleDegreeTypeString: "b2 2 b3 3 4 5 6 7", primary: true, names: ["Radium"]},
   "Ac":  { scaleDegreeTypeString: "b2 b3 3 4 b5 5 b6 b7", primary: true, names: ["Actinium"]},
   "Th":  { scaleDegreeTypeString: "b2 b3 3 4 b5 5 6 7", primary: true, names: ["Thorium"]},
   "Pa":  { scaleDegreeTypeString: "b2 2 b3 3 4 b5 5 b6 7", primary: true, names: ["Protactinium"]},
   "U":  { scaleDegreeTypeString: "b2 2 b3 3 4 b5 5 6 7", primary: true, names: ["Uranium"]},
   "Np":  { scaleDegreeTypeString: "b2 b3 3 4 b5 5 b6 6 b7", primary: true, names: ["Neptunium"]},
   "Bk":  { scaleDegreeTypeString: "b2 2 b3 3 4 b5 5 b6 6 7", primary: true, names: ["Berkelium"]}
  }
});

/*
SELECT * FROM `tblscitype` WHERE 1
SELECT+concat("++++\"")+FROM+`tblscitype`+WHERE+1
SELECT concat("    \"", `txtCode`,  "\":  { scaleDegreeTypeString: \"", replace(`txtSpelling`, ",", " "), "\", primary:", if(`booPrefer`, 'true', 'false'), ", names: [\"", txtName, (if(txtAltNames, replace(txtAltNames, ' ', '", "), '')), "\"]}, ") FROM `tblscitype` WHERE 1;

names: [\"", txtName, if(txtAltNames is not null, concat("\", \"", replace(txtAltNames, ", ", "\", \""), ""), "\"]}, ") as str, txtAltNames FROM `tblscitype` WHERE 1


names: [\"", txtName, if(txtAltNames is not null, concat("\", \"", replace(txtAltNames, ", ", "\", \""), ""), "\"]}, ") as str, txtAltNames FROM `tblscitype` WHERE 1

SELECT concat(
"    \"", 
`txtCode`,  
"\":  { scaleDegreeTypeString: \"", 
replace(`txtSpelling`, ",", " "), 
"\", primary:", 
if(`booPrefer`, 'true', 'false'), 
", names: [\"", txtName, 
  if(txtAltNames is not null, concat("\", \"", replace(txtAltNames, ", ", "\", \"")), ""), "\"]}, ") as str, txtAltNames FROM `tblscitype` WHERE 1

CREATE TABLE `tblscitype` (
  `id` bigint(20) unsigned NOT NULL auto_increment,
  `txtName` varchar(30) NOT NULL default '',
  `txtCode` varchar(10) NOT NULL default '',
  `booPrefer` tinyint(4) NOT NULL default '0',
  `numNote` int(10) unsigned NOT NULL default '0',
  `txtSpelling` varchar(30) NOT NULL default '',
  `numOrdering` bigint(20) NOT NULL default '0',
  `numSymForms` int(10) unsigned NOT NULL default '0',
  `numHalfStepsInRow` int(11) NOT NULL default '0',
  `txtNumIntervalForm` varchar(100) NOT NULL default '',
  `txtAltNames` varchar(255) NOT NULL default '',
  PRIMARY KEY  (`id`),
  UNIQUE KEY `idxCode` (`txtCode`),
  UNIQUE KEY `idxName` (`txtName`),
  UNIQUE KEY `idxSpelling` (`txtSpelling`)
) TYPE=MyISAM COMMENT='intervals, chords, scales, modes' AUTO_INCREMENT=582 ;


INSERT INTO `tblscitype` VALUES (14, 'Major Flat Five', 'Mb5', 1, 3, '3,b5', 160, 0, 1, '4 2', '');
INSERT INTO `tblscitype` VALUES (15, 'Aug Chord', '+', 1, 3, '3,b6', 136, 1, 1, '4 4', 'Semitone Scale, Four Semitone, Major Sharp Five');
INSERT INTO `tblscitype` VALUES (16, 'Sus Four', 'sus4', 1, 3, '4,5', 80, 0, 1, '5 2', 'Raga Sarvasri');
INSERT INTO `tblscitype` VALUES (17, 'Sansagari', 'Sans', 0, 3, '4,b7', 66, 0, 1, '5 5', '');
INSERT INTO `tblscitype` VALUES (18, 'Minor Chord', '-', 1, 3, 'b3,5', 272, 0, 1, '3 4', 'Peruvian Tritonic Two');
INSERT INTO `tblscitype` VALUES (19, 'Peruvian Tritonic', 'Peru3', 0, 3, 'b3,6', 260, 0, 1, '3 6', 'Ute Tritonic');
INSERT INTO `tblscitype` VALUES (20, 'Dim Chord', 'o', 1, 3, 'b3,b5', 288, 0, 1, '3 3', '');
INSERT INTO `tblscitype` VALUES (21, 'Ute Tritonic', 'Ute', 1, 3, 'b3,b7', 258, 0, 1, '3 7', '');
INSERT INTO `tblscitype` VALUES (22, 'Raga Ongkari', 'ROng', 1, 3, 'b5,5', 48, 0, 2, '6 1', 'Sharp Eleven Chord');
INSERT INTO `tblscitype` VALUES (23, 'Two', '2', 1, 4, '2,3,5', 656, 0, 1, '2 2 3', 'Eskimo Tetratonic, Add Two, Sus Two Add Three, Add Nine Omit Three');
INSERT INTO `tblscitype` VALUES (24, 'Genus Primum', 'GP', 0, 4, '2,4,5', 592, 0, 1, '2 3 2', 'Sus Two Four');
INSERT INTO `tblscitype` VALUES (25, 'Raga Bhavani', 'RBha', 0, 4, '2,4,6', 580, 0, 1, '2 3 4', '');
INSERT INTO `tblscitype` VALUES (26, 'Seventh Sus Two', '7sus2', 0, 4, '2,5,b7', 530, 0, 1, '2 5 3', '');
INSERT INTO `tblscitype` VALUES (27, 'Minor Two', '-2', 1, 4, '2,b3,5', 784, 0, 2, '2 1 4', 'Minor Add Nine');
INSERT INTO `tblscitype` VALUES (28, 'Warao Tetratonic', 'WTet', 1, 4, '2,b3,b7', 770, 0, 2, '2 1 7', '');
INSERT INTO `tblscitype` VALUES (29, 'Messiaen Six', 'M6', 0, 4, '2,b5,b6', 552, 2, 1, '2 4 2', '');
INSERT INTO `tblscitype` VALUES (30, 'Four', '4', 1, 4, '3,4,5', 208, 0, 2, '4 1 2', 'Add 4');
INSERT INTO `tblscitype` VALUES (31, 'Six Chord', '6', 0, 4, '3,5,6', 148, 0, 1, '4 3 2', 'German Six');
INSERT INTO `tblscitype` VALUES (32, 'Major Seven', 'M7', 1, 4, '3,5,7', 145, 0, 2, '4 3 4', '');
INSERT INTO `tblscitype` VALUES (33, 'Seven', '7', 1, 4, '3,5,b7', 146, 0, 1, '4 3 3', 'Raga Mahathi, Antara Kaishiaki');
INSERT INTO `tblscitype` VALUES (34, 'Raga Nigamagamini', 'RNig', 1, 4, '3,b5,7', 161, 0, 2, '4 2 5', 'Major Seven Flat Five');
INSERT INTO `tblscitype` VALUES (35, 'Seven Flat Five', '7b5', 1, 4, '3,b5,b7', 162, 2, 1, '4 2 4', 'Messiaen Truncated Mode 6 Inv.');
INSERT INTO `tblscitype` VALUES (36, 'Aug Seven', '+7', 1, 4, '3,b6,b7', 138, 0, 1, '4 4 2', 'Seven Sharp Five Chord');
INSERT INTO `tblscitype` VALUES (37, 'Major Seven Sharp Five', 'M7#5', 1, 4, '3,b6,7', 137, 0, 2, '4 4 3', '');
INSERT INTO `tblscitype` VALUES (39, 'Seven Sus Four', '7sus4', 1, 4, '4,5,b7', 82, 0, 1, '5 2 3', 'Genus Primum Inverse');
INSERT INTO `tblscitype` VALUES (40, 'Messiaen Five Inv.', 'M5i', 0, 4, '4,b5,7', 97, 2, 2, '5 1 5', '');
INSERT INTO `tblscitype` VALUES (41, 'Raga Lavangi', 'RLav', 1, 4, 'b2,5,b7', 1042, 0, 2, '1 6 3', '');
INSERT INTO `tblscitype` VALUES (42, 'Messiaen Five', 'M5', 1, 4, 'b2,b5,5', 1072, 2, 2, '1 5 1', '');
INSERT INTO `tblscitype` VALUES (44, 'Minor Four Chord', '-4', 1, 4, 'b3,4,5', 336, 0, 1, '3 2 2', 'Minor Add Four');
INSERT INTO `tblscitype` VALUES (45, 'Minor Six', '-6', 1, 4, 'b3,5,6', 276, 0, 1, '3 4 2', '');
INSERT INTO `tblscitype` VALUES (46, 'Minor Major Seventh', '-M7', 1, 4, 'b3,5,7', 273, 0, 2, '3 4 4', '');
INSERT INTO `tblscitype` VALUES (47, 'Minor Seven', '-7', 1, 4, 'b3,5,b7', 274, 0, 1, '3 4 3', 'Bi Yu');
INSERT INTO `tblscitype` VALUES (48, 'Dim Seven', 'o7', 1, 4, 'b3,b5,6', 292, 1, 1, '3 3 3', 'Three Semitone, French Six');
INSERT INTO `tblscitype` VALUES (49, 'Half Dim', 'ob7', 0, 4, 'b3,b5,b7', 290, 0, 1, '3 3 4', 'Minor Seven Flat Five, Tristan Chord');
INSERT INTO `tblscitype` VALUES (50, 'Major Pentatonic', 'MPent', 1, 5, '2,3,5,6', 660, 0, 1, '2 2 3 2', 'Six Nine Chord, Mongolian, Diatonic,  Chinese 1, Ghana Pentatonic, Ryosen, Yona Nuki Major, Man Jue, Gong, Raga Bhopali, Bhup, Mohanam, Deskar, Bilahari, Kokila, Jait Kalyan, Peruvian Pentatonic One');
INSERT INTO `tblscitype` VALUES (51, 'Major Nine', 'M9', 1, 5, '2,3,5,7', 657, 0, 2, '2 2 3 4', 'Raga Hamsadhvani, Raga Hansadhvani');
INSERT INTO `tblscitype` VALUES (52, 'Nine', '9', 1, 5, '2,3,5,b7', 658, 0, 1, '2 2 3 3', 'Dominant Pentatonic');
INSERT INTO `tblscitype` VALUES (53, 'Kung', 'Kung', 0, 5, '2,3,b5,6', 676, 0, 1, '2 2 2 3', 'Six Nine Flat Five');
INSERT INTO `tblscitype` VALUES (54, 'Raga Kumardaki', 'RKumarD', 1, 5, '2,3,b5,7', 673, 0, 2, '2 2 2 5', 'Major Nine Flat Five, Kumudki');
INSERT INTO `tblscitype` VALUES (55, 'Nine Flat Five', '9b5', 1, 5, '2,3,b5,b7', 674, 0, 1, '2 2 2 4', '');
INSERT INTO `tblscitype` VALUES (56, 'Nine Sharp Five', '9#5', 0, 5, '2,3,b6,b7', 650, 0, 1, '2 2 4 2', '');
INSERT INTO `tblscitype` VALUES (57, 'Ritusen', 'Ritusen', 0, 5, '2,4,5,6', 596, 0, 1, '2 3 2 2', 'Arabhi, Durga, Major Complementary, Ritusen, Ritsu, Zhi, Zheng, Raga Devakriya, Suddha Saveri, Arabhi, Scottish Pentatonic, Ujo, P''yongjo, Major complement');
INSERT INTO `tblscitype` VALUES (58, 'Egyptian', 'Egypt', 0, 5, '2,4,5,b7', 594, 0, 1, '2 3 2 3', 'Elevent Omit Three, Aeolian Pentatonic, Jin Yu, Madhmat Sarang, Yo, Suspended Pentatonic, Raga Madhyamavati, Madhmat Sarang, Egyptian, Shang, Rui Bin, Qing Yu');
INSERT INTO `tblscitype` VALUES (59, 'Chad Gadyo', 'Chad', 0, 5, '2,b3,4,5', 848, 0, 2, '2 1 2 2', 'Raga Purnalalita, Ghana Pentatonic One, Nando-kyemyonjo');
INSERT INTO `tblscitype` VALUES (60, 'Raga Abhogi', 'RAbh', 0, 5, '2,b3,4,6', 836, 0, 2, '2 1 2 4', '');
INSERT INTO `tblscitype` VALUES (61, 'Raga Audav Tukhari', 'RAT', 0, 5, '2,b3,4,b6', 840, 0, 2, '2 1 2 3', '');
INSERT INTO `tblscitype` VALUES (62, 'Kumoi', 'Kum', 1, 5, '2,b3,5,6', 788, 0, 2, '2 1 4 2', 'Minor Six Nine Chord, Minor Six Add Nine Chord, Akebono One, Raga Sivaranjini, Shivranjani, Dorian Pentatonic \r\n');
INSERT INTO `tblscitype` VALUES (63, 'Minor Major Nine', '-M9', 1, 5, '2,b3,5,7', 785, 0, 2, '2 1 4 4', '');
INSERT INTO `tblscitype` VALUES (64, 'Hira-joshi', 'Hir', 1, 5, '2,b3,5,b6', 792, 0, 2, '2 1 4 1', 'Kata-kumoi, Yona Nuki mineur, Hon-kumoi-joshi, Sakura, Akebono II');
INSERT INTO `tblscitype` VALUES (65, 'Minor Nine Chord', '-9', 1, 5, '2,b3,5,b7', 786, 0, 2, '2 1 4 3', '');
INSERT INTO `tblscitype` VALUES (66, 'Ryukyu', 'Ryu', 1, 5, '3,4,5,7', 209, 0, 2, '4 1 2 4', 'Hirajoshi Two, Major Eleven Omit Nine, Raga Gambhiranata');
INSERT INTO `tblscitype` VALUES (67, 'Seven Eleven', '7/11', 1, 5, '3,4,5,b7', 210, 0, 2, '4 1 2 3', 'Eleven Omit Nine, Mixolydian Pentatonic, Raga Savethri');
INSERT INTO `tblscitype` VALUES (68, 'Raga Mamata', 'RMam', 0, 5, '3,5,6,7', 149, 0, 2, '4 3 2 2', 'Major Thirteen Omit 9 Omit 11');
INSERT INTO `tblscitype` VALUES (69, 'Seven Six', '7/6', 1, 5, '3,5,6,b7', 150, 0, 2, '4 3 2 1', 'Thirteen Omit Nine Omit Eleven, Raga Valaji');
INSERT INTO `tblscitype` VALUES (70, 'Seven Sharp Eleven', '7#11', 0, 5, '3,b5,5,b7', 178, 0, 2, '4 2 1 3', '');
INSERT INTO `tblscitype` VALUES (71, 'Chinese', 'Chin', 0, 5, '3,b5,5,7', 177, 0, 2, '4 2 1 4', 'Major Seven Sharp Eleven Chord, Chinese 2, Raga Amritavarshini, Malashri, Shilangi');
INSERT INTO `tblscitype` VALUES (72, 'Raga Nabhomani', 'RNab', 0, 5, 'b2,2,b5,5', 1584, 0, 3, '1 1 4 1', '');
INSERT INTO `tblscitype` VALUES (73, 'Mangal-Bairo', 'MB', 1, 5, 'b2,3,4,7', 1217, 0, 3, '1 3 1 6', 'Raga Megharanji');
INSERT INTO `tblscitype` VALUES (74, 'Syrian Pentatonic', 'SPent', 1, 5, 'b2,3,4,b6', 1224, 0, 2, '1 3 1 3', 'Raga Megharanjani');
INSERT INTO `tblscitype` VALUES (75, 'Scriabin', 'Scri', 1, 5, 'b2,3,5,6', 1172, 0, 2, '1 3 3 2', 'Raga Rasika Ranjani, Jait, Marva, Vibhas Marva');
INSERT INTO `tblscitype` VALUES (76, 'Raga Reva', 'RRev', 1, 5, 'b2,3,5,b6', 1176, 0, 2, '1 3 3 1', 'Bhairava, Revagupti, Ramkali, Vibhas Bhairava');
INSERT INTO `tblscitype` VALUES (77, 'Seven Flat Nine', '7b9', 1, 5, 'b2,3,5,b7', 1170, 0, 2, '1 3 3 3', 'Raga Manaranjani I');
INSERT INTO `tblscitype` VALUES (78, 'Seven Flat Five Flat Nine', '7b5b9', 0, 5, 'b2,3,b5,b7', 1186, 0, 2, '1 3 2 4', '');
INSERT INTO `tblscitype` VALUES (79, 'Raga Kshanika', 'RKsha', 1, 5, 'b2,3,b6,7', 1161, 0, 3, '1 3 4 3', '');
INSERT INTO `tblscitype` VALUES (80, 'Aug Seven Flat Nine', 'aug7b9', 0, 5, 'b2,3,b6,b7', 1162, 0, 2, '1 3 4 2', 'Seven Sharp Five Flat Nine');
INSERT INTO `tblscitype` VALUES (81, 'Altered Pentatonic', 'APent', 1, 5, 'b2,4,5,6', 1108, 0, 2, '1 4 2 2', 'Raga Manaranjani Two');
INSERT INTO `tblscitype` VALUES (82, 'Raga Gauri', 'RGaur', 1, 5, 'b2,4,5,7', 1105, 0, 3, '1 4 2 4', '');
INSERT INTO `tblscitype` VALUES (83, 'Saveri', 'Sav', 0, 5, 'b2,4,5,b6', 1112, 0, 2, '1 4 2 1', 'Japanese One, Hon-kumoi-joshi, Gunakri, Gunakali, Kumoi One, Raga Salanganata, Latantapriya');
INSERT INTO `tblscitype` VALUES (84, 'Baira', 'Baira', 0, 5, 'b2,4,5,b7', 1106, 0, 2, '1 4 2 3', 'Kokin-Joshi, Miyakobushi, Han-Iwato, In Sen: Japan, Raga Vibhavari, Revati, Bairagi, Lasaki');
INSERT INTO `tblscitype` VALUES (85, 'Iwato', 'Iwa', 0, 5, 'b2,4,b5,b7', 1122, 0, 2, '1 4 1 4', '');
INSERT INTO `tblscitype` VALUES (86, 'Raga Deshgaur', 'RDeshG', 1, 5, 'b2,5,b6,7', 1049, 0, 3, '1 6 1 3', '');
INSERT INTO `tblscitype` VALUES (87, 'Balinese Pelog', 'BP', 0, 5, 'b2,b3,5,b6', 1304, 0, 2, '1 2 4 1', 'Balinese, Bhupal Todi, Bhupala Todi, Bibhas, Raga Bhupalam');
INSERT INTO `tblscitype` VALUES (88, 'Pelog', 'Pelog', 0, 5, 'b2,b3,5,b7', 1298, 0, 2, '1 2 4 3', 'Raga Rukmangi');
INSERT INTO `tblscitype` VALUES (89, 'Raga Chhaya Todi', 'RCT', 0, 5, 'b2,b3,b5,b6', 1320, 0, 2, '1 2 3 2', '');
INSERT INTO `tblscitype` VALUES (90, 'Yashranjani', 'Yash', 1, 5, 'b2,b5,5,b6', 1080, 0, 3, '1 5 1 1', 'Raga Saugandhini');
INSERT INTO `tblscitype` VALUES (91, 'Seven Sharp Nine', '7#9', 0, 5, 'b3,3,5,b7', 402, 0, 2, '3 1 3 3', '');
INSERT INTO `tblscitype` VALUES (92, 'Aug Seven Sharp Nine', 'aug7#9', 0, 5, 'b3,3,b6,b7', 394, 0, 2, '3 1 4 2', 'Seven Sharp Five Sharp Nine Chord');
INSERT INTO `tblscitype` VALUES (93, 'Madhuranjani', 'MR', 1, 5, 'b3,4,5,7', 337, 0, 2, '3 2 2 4', 'Minor Major Eleven Omit Nine, Raga Nata, Udayaravicandrika');
INSERT INTO `tblscitype` VALUES (94, 'Minor Pentatonic', '-Pent', 0, 5, 'b3,4,5,b7', 338, 0, 1, '3 2 2 3', 'Minor 7/11, Minor 11 Omit 9, Phrygian Pentatonic, Blues Pentatonic, Abheri, Gu Xian, Jia Zhong, Kyenmyonjo, Raga Dhani, Suddha Dhanyasi, Udhayaravi Chandrika, Qing Shang, Yu, Pyongjo-kyenmyonjo, Minyo');
INSERT INTO `tblscitype` VALUES (95, 'Locrian Pentatonic', 'LocPent', 0, 5, 'b3,4,b6,b7', 330, 0, 1, '3 2 3 2', 'Raga Mallkauns, Malakosh, Raga Hindola, Man Gong, Quan Ming, Yi Ze, Jiao');
INSERT INTO `tblscitype` VALUES (96, 'Minor Major Thirteen Omit 9,11', '-M13om911', 1, 5, 'b3,5,6,7', 277, 0, 2, '3 4 2 2', '');
INSERT INTO `tblscitype` VALUES (97, 'Minor Thirteen Omit 9, 11', '-13om911', 1, 5, 'b3,5,6,b7', 278, 0, 2, '3 4 2 1', '');
INSERT INTO `tblscitype` VALUES (98, 'Mixolydian Ionian', 'MI', 0, 6, '2,3,4,5,6', 724, 0, 2, '2 2 1 2 2', 'Arezzo Major Diatonic Hexachord, Devarangini, Raga Kambhoji, Schottish Hexatonic');
INSERT INTO `tblscitype` VALUES (99, 'Kendaram', 'Kend', 1, 6, '2,3,4,5,7', 721, 0, 2, '2 2 1 2 4', 'Major Eleven Chord, Raga Nalinakanti, Vilasini');
INSERT INTO `tblscitype` VALUES (100, 'Raga Siva Kambhoji', 'RSiv', 1, 6, '2,3,4,5,b7', 722, 0, 2, '2 2 1 2 3', 'Eleven Chord');
INSERT INTO `tblscitype` VALUES (101, 'Raga Hamsa Vinodini', 'RHV', 0, 6, '2,3,4,6,7', 709, 0, 2, '2 2 1 4 2', '');
INSERT INTO `tblscitype` VALUES (102, 'Raga Rageshri', 'RRagShri', 0, 6, '2,3,4,6,b7', 710, 0, 2, '2 2 1 4 1', '');
INSERT INTO `tblscitype` VALUES (103, 'Raga Dipak', 'RDip', 1, 6, '2,3,4,b5,5', 752, 0, 4, '2 2 1 1 1', '');
INSERT INTO `tblscitype` VALUES (104, 'Raga Sarasanana', 'RSS', 1, 6, '2,3,4,b6,7', 713, 0, 2, '2 2 1 3 3', '');
INSERT INTO `tblscitype` VALUES (105, 'Raga Kumud', 'RKumud', 1, 6, '2,3,5,6,7', 661, 0, 2, '2 2 3 2 2', 'Ionian Lydian Scale, Major Thirteen Omit Eleven Chord, Lydian Hexatonic, Sankara, Shankara');
INSERT INTO `tblscitype` VALUES (106, 'Thirteen Omit Eleven Chord', '13om11', 1, 6, '2,3,5,6,b7', 662, 0, 2, '2 2 3 2 1', '');
INSERT INTO `tblscitype` VALUES (107, 'Raga Latika', 'RLat', 1, 6, '2,3,5,b6,7', 665, 0, 2, '2 2 3 1 3', '');
INSERT INTO `tblscitype` VALUES (108, 'Raga Yamuna Kalyani', 'RYK', 0, 6, '2,3,b5,5,6', 692, 0, 2, '2 2 2 1 2', 'Ancient Chinese, Kalyani Keseri');
INSERT INTO `tblscitype` VALUES (109, 'Ratnakanthi', 'Ratna', 0, 6, '2,3,b5,5,7', 689, 0, 2, '2 2 2 1 4', 'Raga Caturangini');
INSERT INTO `tblscitype` VALUES (110, 'Raga Mruganandana', 'RMru', 0, 6, '2,3,b5,6,7', 677, 0, 2, '2 2 2 3 2', '');
INSERT INTO `tblscitype` VALUES (111, 'Prometheus', 'Prom', 1, 6, '2,3,b5,6,b7', 678, 0, 2, '2 2 2 3 1', 'Raga Barbara');
INSERT INTO `tblscitype` VALUES (112, 'Point Hope Eskimo Hexatonic', 'PHEH', 0, 6, '2,3,b5,b6,7', 681, 0, 2, '2 2 2 2 3', '');
INSERT INTO `tblscitype` VALUES (114, 'Whole Tone', 'WT', 1, 6, '2,3,b5,b6,b7', 682, 1, 1, '2 2 2 2 2', 'Auxiliary Augmented, Anhemitonic Hexatonic, Messiaen One, Raga Gopriya');
INSERT INTO `tblscitype` VALUES (115, 'Raga Nagandhari', 'RNag', 0, 6, '2,4,5,6,7', 597, 0, 2, '2 3 2 2 2', '');
INSERT INTO `tblscitype` VALUES (116, 'Pyongjo', 'Pyon', 0, 6, '2,4,5,6,b7', 598, 0, 2, '2 3 2 2 1', 'Dominant Seventh, Yosen, Raga Darbar, Narayani, Suposhini, Andolika, Gorakh Kalyan, Mixolydian Hexatonic');
INSERT INTO `tblscitype` VALUES (117, 'Raga Bhinna Pancama', 'RBhi', 1, 6, '2,4,5,b6,7', 601, 0, 2, '2 3 2 1 3', '');
INSERT INTO `tblscitype` VALUES (118, 'Raga Navamanohari', 'RNav', 0, 6, '2,4,5,b6,b7', 602, 0, 2, '2 3 2 1 2', '');
INSERT INTO `tblscitype` VALUES (119, 'Megh', 'Megh', 0, 6, '2,4,5,b7,7', 595, 0, 3, '2 3 2 3 1', 'Raga Sarang');
INSERT INTO `tblscitype` VALUES (120, 'Raga Suddha Bangala', 'RSuddhaB', 0, 6, '2,b3,4,5,6', 852, 0, 2, '2 1 2 2 2', 'Gauri Velavali');
INSERT INTO `tblscitype` VALUES (121, 'Minor Major Eleven', '-M11', 1, 6, '2,b3,4,5,7', 849, 0, 2, '2 1 2 2 4', '');
INSERT INTO `tblscitype` VALUES (122, 'Minor Hexatonic', '-Hex', 0, 6, '2,b3,4,5,b7', 850, 0, 2, '2 1 2 2 3', 'Aeolian Dorian, Minor Eleven Chord, Manirangu, Raga Palasi, Manirangu, Nayaki, Pushpalithika, Yo, King Island Eskimo Hexatonic');
INSERT INTO `tblscitype` VALUES (123, 'Kapijingla', 'Kap', 0, 6, '2,b3,4,6,b7', 838, 0, 2, '2 1 2 4 1', 'Raga Bagesri, Sriranjani');
INSERT INTO `tblscitype` VALUES (124, 'Pyramid Hexatonic', 'PH', 0, 6, '2,b3,4,b5,6', 868, 0, 2, '2 1 2 1 3', '');
INSERT INTO `tblscitype` VALUES (125, 'Blues Scale', 'Blues', 0, 6, '2,b3,4,b5,b7', 866, 0, 2, '2 1 2 1 4', '');
INSERT INTO `tblscitype` VALUES (126, 'Raga Ghantana', 'RGhant', 0, 6, '2,b3,4,b6,7', 841, 0, 2, '2 1 2 3 3', 'Kaushiranjani, Kaishikiranjani');
INSERT INTO `tblscitype` VALUES (127, 'Hawaiian Hexatonic', 'HH', 1, 6, '2,b3,5,6,7', 789, 0, 2, '2 1 4 2 2', 'Minor Major Thirteen Omit Eleven Chord');
INSERT INTO `tblscitype` VALUES (128, 'Raga Manavi', 'RMana', 1, 6, '2,b3,5,6,b7', 790, 0, 2, '2 1 4 2 1', 'Minor Thirteen Omit Eleven Chord');
INSERT INTO `tblscitype` VALUES (129, 'Raga Trimurti', 'RTri', 0, 6, '2,b3,5,b6,b7', 794, 0, 2, '2 1 4 1 2', '');
INSERT INTO `tblscitype` VALUES (130, 'Raga Vijayanagari', 'RVij', 0, 6, '2,b3,b5,5,6', 820, 0, 2, '2 1 3 1 2', '');
INSERT INTO `tblscitype` VALUES (131, 'Raga Kai Kavasi', 'RKK', 0, 6, '2,b3,b5,5,7', 817, 0, 2, '2 1 3 1 4', 'Raga Amarasenapriya');
INSERT INTO `tblscitype` VALUES (132, 'Raga Syamalam', 'RSya', 0, 6, '2,b3,b5,5,b6', 824, 0, 3, '2 1 3 1 1', '');
INSERT INTO `tblscitype` VALUES (133, 'Raga Simharava', 'RSim', 0, 6, '2,b3,b5,5,b7', 818, 0, 2, '2 1 3 1 3', 'Raga Sinharavam');
INSERT INTO `tblscitype` VALUES (134, 'Raga Ranjani', 'RRanj', 0, 6, '2,b3,b5,6,7', 805, 0, 2, '2 1 3 3 2', '');
INSERT INTO `tblscitype` VALUES (135, 'Raga Sarasvati', 'RSar', 0, 6, '2,b5,5,6,b7', 566, 0, 2, '2 4 1 2 1', '');
INSERT INTO `tblscitype` VALUES (136, 'Raga Jaganmohanam', 'RJag', 1, 6, '2,b5,5,b6,b7', 570, 0, 3, '2 4 1 1 2', '');
INSERT INTO `tblscitype` VALUES (137, 'Raga Malarani', 'RMR', 1, 6, '2,b5,5,b7,7', 563, 0, 3, '2 4 1 3 1', '');
INSERT INTO `tblscitype` VALUES (138, 'Raga Hari Nata', 'RHN', 1, 6, '3,4,5,6,7', 213, 0, 2, '4 1 2 2 2', 'Major Thirteen Omit Nine Chord, Genus Secundum');
INSERT INTO `tblscitype` VALUES (139, 'Raga Khamas', 'RKhamas', 0, 6, '3,4,5,6,b7', 214, 0, 2, '4 1 2 2 1', 'Thirteen Omit Nine Chord, Baduhari');
INSERT INTO `tblscitype` VALUES (140, 'Raga Saravati', 'RSV', 1, 6, '3,4,5,b6,6', 220, 0, 3, '4 1 2 1 1', 'Raga Sharavati');
INSERT INTO `tblscitype` VALUES (141, 'Raga Paraju', 'RPar', 1, 6, '3,4,5,b6,7', 217, 0, 2, '4 1 2 1 3', 'Ramamanohari, Simhavahini, Sindhu Ramakriya, Kamalamanohari');
INSERT INTO `tblscitype` VALUES (142, 'Raga Kamalamanohari', 'RKamal', 0, 6, '3,4,5,b6,b7', 218, 0, 2, '4 1 2 1 2', '');
INSERT INTO `tblscitype` VALUES (143, 'Raga Tilang', 'RTil', 1, 6, '3,4,5,b7,7', 211, 0, 3, '4 1 2 3 1', 'Brindavani-Tilang');
INSERT INTO `tblscitype` VALUES (144, 'Messiaen Mode Five Inverse', 'MM5i', 0, 6, '3,4,b5,b7,7', 227, 3, 3, '4 1 1 4 1', '');
INSERT INTO `tblscitype` VALUES (145, 'Raga Vutari', 'RVut', 1, 6, '3,b5,5,6,b7', 182, 0, 2, '4 2 1 2 1', '');
INSERT INTO `tblscitype` VALUES (146, 'Raga Jyoti', 'RJyo', 1, 6, '3,b5,5,b6,b7', 186, 0, 3, '4 2 1 1 2', '');
INSERT INTO `tblscitype` VALUES (147, 'Raga Vijayavasanta', 'RVV', 1, 6, '3,b5,5,b7,7', 179, 0, 3, '4 2 1 3 1', '');
INSERT INTO `tblscitype` VALUES (148, 'Raga Suddha Mukhari', 'RSM', 0, 6, 'b2,2,4,b6,6', 1612, 0, 3, '1 1 3 3 1', '');
INSERT INTO `tblscitype` VALUES (149, 'Raga Chandrajyoti', 'RCha', 0, 6, 'b2,2,b5,5,6', 1588, 0, 3, '1 1 4 1 2', '');
INSERT INTO `tblscitype` VALUES (150, 'Messiaen Mode Five', 'MM5', 1, 6, 'b2,2,b5,5,b6', 1592, 3, 3, '1 1 4 1 1', '');
INSERT INTO `tblscitype` VALUES (151, 'Raga Kalavati', 'RKalaV', 0, 6, 'b2,3,4,5,6', 1236, 0, 2, '1 3 1 2 2', 'Ragamalini');
INSERT INTO `tblscitype` VALUES (152, 'Raga Gaula', 'RGaul', 1, 6, 'b2,3,4,5,7', 1233, 0, 3, '1 3 1 2 4', '');
INSERT INTO `tblscitype` VALUES (153, 'Malahari', 'Mal', 1, 6, 'b2,3,4,5,b6', 1240, 0, 2, '1 3 1 2 1', 'Geyahejjajji, Raga Purna Pancama');
INSERT INTO `tblscitype` VALUES (154, 'Raga Vasanta', 'RVas', 0, 6, 'b2,3,4,6,7', 1221, 0, 3, '1 3 1 4 2', '');
INSERT INTO `tblscitype` VALUES (155, 'Raga Rudra Pancama', 'RRP', 0, 6, 'b2,3,4,6,b7', 1222, 0, 2, '1 3 1 4 1', '');
INSERT INTO `tblscitype` VALUES (156, 'Persian Hexatonic', 'P6', 1, 6, 'b2,3,4,b5,7', 1249, 0, 3, '1 3 1 1 5', '');
INSERT INTO `tblscitype` VALUES (157, 'Six Tone Symmetrical', 'STS', 0, 6, 'b2,32,4,b6,6', 1228, 2, 2, '1 3 1 3 1', 'Messiaen Truncated Mode Three');
INSERT INTO `tblscitype` VALUES (158, 'Sohini', 'Soh', 0, 6, 'b2,3,4,b6,7', 1225, 0, 3, '1 3 1 3 3', 'Raga Lalita Hexatonic, Lalit Bhairav, Hamsanandi');
INSERT INTO `tblscitype` VALUES (159, 'Raga Vasantabhairavi', 'RVasB', 0, 6, 'b2,3,4,b6,b7', 1226, 0, 2, '1 3 1 3 2', '');
INSERT INTO `tblscitype` VALUES (160, 'Raga Malayamarutam', 'RMY', 1, 6, 'b2,3,5,6,b7', 1174, 0, 2, '1 3 3 2 1', '');
INSERT INTO `tblscitype` VALUES (161, 'Raga Kalagada', 'RKalaG', 1, 6, 'b2,3,5,b6,6', 1180, 0, 3, '1 3 3 1 1', '');
INSERT INTO `tblscitype` VALUES (162, 'Raga Bauli', 'RBaul', 1, 6, 'b2,3,5,b6,7', 1177, 0, 3, '1 3 3 1 3', '');
INSERT INTO `tblscitype` VALUES (163, 'Gamakakriya', 'Gam', 1, 6, 'b2,3,b5,5,7', 1201, 0, 3, '1 3 2 1 4', 'Raga Mandari, Hamsanarayani');
INSERT INTO `tblscitype` VALUES (164, 'Raga Dhavalangam', 'RDha', 1, 6, 'b2,3,b5,5,b6', 1208, 0, 3, '1 3 2 1 1', '');
INSERT INTO `tblscitype` VALUES (165, 'Puriya', 'Puri', 1, 6, 'b2,3,b5,6,7', 1189, 0, 3, '1 3 2 3 2', 'Marva, Pancama, Raga Hamsanandi');
INSERT INTO `tblscitype` VALUES (166, 'Prometheus Neapolitani', 'PN', 1, 6, 'b2,3,b5,6,b7', 1190, 0, 2, '1 3 2 3 1', 'Prometheus Neapolitan');
INSERT INTO `tblscitype` VALUES (167, 'Raga Hejjajji', 'RHejj', 0, 6, 'b2,3,b5,b6,6', 1196, 0, 2, '1 3 2 2 1', '');
INSERT INTO `tblscitype` VALUES (168, 'Raga Jivantika', 'RJiv', 1, 6, 'b2,4,5,6,7', 1109, 0, 3, '1 4 2 2 2', '');
INSERT INTO `tblscitype` VALUES (169, 'Raga Rasavali', 'RRasav', 0, 6, 'b2,4,5,6,b7', 1110, 0, 2, '1 4 2 2 1', '');
INSERT INTO `tblscitype` VALUES (170, 'Raga Padi', 'RPad', 0, 6, 'b2,4,5,b6,7', 1113, 0, 3, '1 4 2 1 3', 'Mela Ganamurti');
INSERT INTO `tblscitype` VALUES (171, 'Insen', 'Ins', 0, 6, 'b2,4,5,b6,b7', 1114, 0, 2, '1 4 2 1 2', 'Raga Phenadyuti');
INSERT INTO `tblscitype` VALUES (172, 'Raga Suddha Simantini', 'RSuddhaS', 0, 6, 'b2,b3,4,5,b6', 1368, 0, 2, '1 2 2 2 1', '');
INSERT INTO `tblscitype` VALUES (173, 'Raga Gandharavam', 'RGandh', 0, 6, 'b2,b3,4,5,b7', 1362, 0, 2, '1 2 2 2 3', '');
INSERT INTO `tblscitype` VALUES (174, 'Double Phrygian Hexatonic', 'DPH', 0, 6, 'b2,b3,4,b5,6', 1380, 0, 2, '1 2 2 1 3', '');
INSERT INTO `tblscitype` VALUES (175, 'Ritsu', 'Ritsu', 0, 6, 'b2,b3,4,b6,b7', 1354, 0, 2, '1 2 2 3 2', 'Honchoshi Plagal Form, Raga Suddha Todi');
INSERT INTO `tblscitype` VALUES (176, 'Raga Salagavarali', 'RSal', 0, 6, 'b2,b3,5,6,b7', 1302, 0, 2, '1 2 4 2 1', '');
INSERT INTO `tblscitype` VALUES (177, 'Messiaen Truncated Mode Two', 'MT2', 1, 6, 'b2,b3,b5,5,6', 1332, 3, 2, '1 2 3 1 2', '');
INSERT INTO `tblscitype` VALUES (178, 'Raga Vijayasri', 'RVS', 1, 6, 'b2,b3,b5,5,7', 1329, 0, 3, '1 2 3 1 4', '');
INSERT INTO `tblscitype` VALUES (179, 'Raga Gurjari Todi', 'RGT', 0, 6, 'b2,b3,b5,b6,7', 1321, 0, 3, '1 2 3 2 3', '');
INSERT INTO `tblscitype` VALUES (180, 'Raga Bhavani Hexatonic', 'RBH', 0, 6, 'b2,b3,b5,b6,b7', 1322, 0, 2, '1 2 3 2 2', '');
INSERT INTO `tblscitype` VALUES (181, 'Jog', 'Jog', 1, 6, 'b3,3,4,5,b7', 466, 0, 3, '3 1 1 2 3', 'Raga Bhanumanjari');
INSERT INTO `tblscitype` VALUES (182, 'Augmented', 'Aug', 1, 6, 'b3,3,5,b6,7', 409, 2, 2, '3 1 3 1 3', 'Messiaen Truncated Mode Three Inv., Genus Tertium');
INSERT INTO `tblscitype` VALUES (183, 'Raga Rasamanjari', 'RRasam', 0, 6, 'b3,3,b5,5,7', 433, 0, 2, '3 1 2 1 4', '');
INSERT INTO `tblscitype` VALUES (184, 'Minor Major 13 Omit 9', '-M13om9', 1, 6, 'b3,4,5,6,7', 341, 0, 2, '3 2 2 2 2', '');
INSERT INTO `tblscitype` VALUES (185, 'Raga Manohari', 'RMano', 0, 6, 'b3,4,5,6,b7', 342, 0, 2, '3 2 2 2 1', 'Minor Thirteen Omit Nine Chord, Raga Bhimpalasi Desc');
INSERT INTO `tblscitype` VALUES (186, 'Raga Takka', 'RTak', 1, 6, 'b3,4,5,b6,7', 345, 0, 2, '3 2 2 1 3', '');
INSERT INTO `tblscitype` VALUES (187, 'Raga Gopikavasantam', 'RGop', 0, 6, 'b3,4,5,b6,b7', 346, 0, 2, '3 2 2 1 2', 'Desya Todi, Phrygian Hexatonic');
INSERT INTO `tblscitype` VALUES (188, 'Blues One', 'B1', 1, 6, 'b3,4,b5,5,b7', 370, 0, 3, '3 2 1 1 3', 'Raga Nileshwari');
INSERT INTO `tblscitype` VALUES (189, 'Raga Madhukauns Hexatonic', 'RMH', 1, 6, 'b3,b5,5,6,b7', 310, 0, 2, '3 3 1 2 1', '');
INSERT INTO `tblscitype` VALUES (190, 'Gaurikriya', 'Gaur', 0, 6, 'b3,b5,5,b7,7', 307, 0, 3, '3 3 1 3 1', 'Raga Jivantini');
INSERT INTO `tblscitype` VALUES (191, 'Major', 'Maj', 1, 7, '2,3,4,5,6,7', 725, 0, 2, '2 2 1 2 2 2', 'Ionian, A Raray, Bilaval Theta, Mela Dhirasankarabharana, 4th Plagal Byzantine, Ghana Heptatonic, Greek Lydian, Medieval Hypolydian');
INSERT INTO `tblscitype` VALUES (192, 'Mixolydian', 'ML', 0, 7, '2,3,4,5,6,b7', 726, 0, 2, '2 2 1 2 2 1', 'Mela Harikambhoji, Khamaj Theta, Ching, Greek Hypophrygian, Iastian, Khamaj Theta. Medieval Hypoionian');
INSERT INTO `tblscitype` VALUES (193, 'Mela Mararanjani', 'MMar', 0, 7, '2,3,4,5,b6,6', 732, 0, 3, '2 2 1 2 1 1', '');
INSERT INTO `tblscitype` VALUES (194, 'Harmonic Major', 'MHarm', 1, 7, '2,3,4,5,b6,7', 729, 0, 2, '2 2 1 2 1 3', 'Mela Sarasangi');
INSERT INTO `tblscitype` VALUES (195, 'Aeolian Major', 'MAeo', 1, 7, '2,3,4,5,b6,b7', 730, 0, 2, '2 2 1 2 1 2', 'Hindu, Hindustan, Mela Charukesi, Mela Carukesi');
INSERT INTO `tblscitype` VALUES (196, 'Mela Naganandini', 'MNag', 0, 7, '2,3,4,5,b7,7', 723, 0, 3, '2 2 1 2 3 1', '');
INSERT INTO `tblscitype` VALUES (197, 'Raga Ragesri', 'RRagSri', 1, 7, '2,3,4,6,b7,7', 711, 0, 4, '2 2 1 4 1 1', '');
INSERT INTO `tblscitype` VALUES (198, 'Locrian Major', 'MLoc', 0, 7, '2,3,4,b5,b6,b7', 746, 0, 3, '2 2 1 1 2 2', 'Arabian Septatonic');
INSERT INTO `tblscitype` VALUES (199, 'Mixolydian Augmented', 'MLA', 0, 7, '2,3,4,b6,6,b7', 718, 0, 3, '2 2 1 3 1 1', '');
INSERT INTO `tblscitype` VALUES (200, 'Lydian', 'Lyd', 0, 7, '2,3,b5,5,6,7', 693, 0, 2, '2 2 2 1 2 2', 'Kalyan Theta, Mela Mechakalyani, Fourth Plagal Byzantine, Greek Hypolydian, Kalyan Theta, Yaman');
INSERT INTO `tblscitype` VALUES (201, 'Overtone', 'OT', 0, 7, '2,3,b5,5,6,b7', 694, 0, 2, '2 2 2 1 2 1', 'Lydian Dominant, Overtone Dominant, Mela Vaschaspati, Lydian Diminished');
INSERT INTO `tblscitype` VALUES (202, 'Mela Kantamani', 'MKant', 1, 7, '2,3,b5,5,b6,6', 700, 0, 4, '2 2 2 1 1 1', '');
INSERT INTO `tblscitype` VALUES (203, 'Mela Latangi', 'MLat', 0, 7, '2,3,b5,5,b6,7', 697, 0, 3, '2 2 2 1 1 3', '');
INSERT INTO `tblscitype` VALUES (204, 'Lydian Minor', '-Lyd', 0, 7, '2,3,b5,5,b6,b7', 698, 0, 3, '2 2 2 1 1 2', 'Mela Risabhapriya');
INSERT INTO `tblscitype` VALUES (205, 'Neapolitan Minor', '-Nea', 0, 7, '2,3,b5,5,b7,7', 691, 0, 3, '2 2 2 1 3 1', 'Mela Chitrambari, Mela Citrambari');
INSERT INTO `tblscitype` VALUES (206, 'Lydian Augmented', 'LydAug', 0, 7, '2,3,b5,b6,6,7', 685, 0, 2, '2 2 2 2 1 2', 'Lydian Sharp Five');
INSERT INTO `tblscitype` VALUES (207, 'Leading Whole Tone', 'LWT', 0, 7, '2,3,b5,b6,b7,7', 683, 0, 3, '2 2 2 2 2 1', '');
INSERT INTO `tblscitype` VALUES (208, 'Raga Sorati', 'RSor', 1, 7, '2,4,5,6,b7,7', 599, 0, 4, '2 3 2 2 1 1', '');
INSERT INTO `tblscitype` VALUES (209, 'Chromatic Mixolydian Inv.', 'CMi', 0, 7, '2,4,b5,5,b7,7', 627, 0, 3, '2 3 1 1 3 1', '');
INSERT INTO `tblscitype` VALUES (210, 'Ethiopian', 'Ethi', 0, 7, '2,3,4,b6,6,7', 717, 0, 2, '2 2 1 3 1 2', 'Ionian Augmented, Ionian Sharp Five');
INSERT INTO `tblscitype` VALUES (211, 'Chromatic Hypodorian', 'CHD', 0, 7, '2,b3,3,5,b6,6', 924, 0, 3, '2 1 1 3 1 1', 'Double Harmonic Two');
INSERT INTO `tblscitype` VALUES (212, 'Hawaiian', 'Haw', 0, 7, '2,b3,4,5,6,7', 853, 0, 2, '2 1 2 2 2 2', 'Melodic Minor Asc, Mela Gaurimanohari, Jazz Minor');
INSERT INTO `tblscitype` VALUES (213, 'Dorian', 'Dor', 0, 7, '2,b3,4,5,6,b7', 854, 0, 2, '2 1 2 2 2 1', 'Kafi Theta, Mela Kharaharapriya, Eskimo Heptatonic, Greek Phrygian, Kafi Theta, Medieval Hypomixolydian');
INSERT INTO `tblscitype` VALUES (214, 'Mela Jhankaradhvani', 'MJha', 1, 7, '2,b3,4,5,b6,6', 860, 0, 3, '2 1 2 2 1 1', '');
INSERT INTO `tblscitype` VALUES (215, 'Harmonic', 'Har', 0, 7, '2,b3,4,5,b6,7', 857, 0, 2, '2 1 2 2 1 3', 'Harmonic Minor, Mohammedan, Mela Kiravani, Maqam Bayat-e-Esfahan');
INSERT INTO `tblscitype` VALUES (216, 'Aeolian', 'Aeo', 0, 7, '2,b3,4,5,b6,b7', 858, 0, 2, '2 1 2 2 1 2', 'Pure Minor, Geez & Ezel, Asavari Theta, Mela Natabhairavi, Greek Hyperphrygian, Medieval Hypodorian');
INSERT INTO `tblscitype` VALUES (217, 'Mela Varunapriya', 'MVar', 0, 7, '2,b3,4,5,b7,7', 851, 0, 3, '2 1 2 2 3 1', '');
INSERT INTO `tblscitype` VALUES (218, 'Modified Blues', 'BM', 1, 7, '2,b3,4,b5,5,b7', 882, 0, 3, '2 1 2 1 1 3', '');
INSERT INTO `tblscitype` VALUES (219, 'Maqam Karcigar', 'MqKar', 0, 7, '2,b3,4,b5,6,b7', 870, 0, 2, '2 1 2 1 3 1', 'Dorian Flat Five, Locrian Natural Two Natural Six');
INSERT INTO `tblscitype` VALUES (220, 'Locrian Natural Two', 'Locn2', 0, 7, '2,b3,4,b5,b6,7', 873, 0, 2, '2 1 2 1 2 3', 'Aeolian b5');
INSERT INTO `tblscitype` VALUES (221, 'Minor Locrian', '-Loc', 0, 7, '2,b3,4,b5,b6,b7', 874, 0, 2, '2 1 2 1 2 2', 'Locrian Sharp Two, Half Diminished Sharp Two, Locrian Natural Two');
INSERT INTO `tblscitype` VALUES (222, 'Ambika', 'Amb', 0, 7, '2,b3,b5,5,6,7', 821, 0, 2, '2 1 3 1 2 2', 'Mela Dharmavati, Dumyaraga, Lydian Diminished, Madhuvanti');
INSERT INTO `tblscitype` VALUES (223, 'Roumanian Minor', '-Roum', 0, 7, '2,b3,b5,5,6,b7', 822, 0, 2, '2 1 3 1 2 1', 'Mela Hemavati, Dorian Sharp Four, Hedjaz, Maqam Nakriz');
INSERT INTO `tblscitype` VALUES (224, 'Mela Syamalangi', 'MSya', 0, 7, '2,b3,b5,5,b6,6', 828, 0, 4, '2 1 3 1 1 1', '');
INSERT INTO `tblscitype` VALUES (225, 'Algerian', 'Alg', 0, 7, '2,b3,b5,5,b6,7', 825, 0, 3, '2 1 3 1 1 3', 'Hungarian Minor, Hungarian Gypsy, Minor Gypsy, Mela Simhendramadhyama, Double Harmonic Minor, Maqam Suzdil');
INSERT INTO `tblscitype` VALUES (226, 'Mela Sanmukhapriya', 'MSan', 0, 7, '2,b3,b5,5,b6,b7', 826, 0, 3, '2 1 3 1 1 2', 'Hungarian Gypsy Two');
INSERT INTO `tblscitype` VALUES (227, 'Mela Nitimati', 'MNit', 0, 7, '2,b3,b5,5,b7,7', 819, 0, 3, '2 1 3 1 3 1', '');
INSERT INTO `tblscitype` VALUES (228, 'Raga Madhuri', 'RMadh', 1, 7, '3,4,5,6,b7,7', 215, 0, 4, '4 1 2 2 1 1', '');
INSERT INTO `tblscitype` VALUES (229, 'Chromatic Phrygian', 'CP', 0, 7, 'b2,2,3,5,b6,6', 1692, 0, 3, '1 1 2 3 1 1', '');
INSERT INTO `tblscitype` VALUES (230, 'Mela Manavati', 'MMan', 0, 7, 'b2,2,4,5,6,7', 1621, 0, 4, '1 1 3 2 2 2', '');
INSERT INTO `tblscitype` VALUES (231, 'Mela Vanaspati', 'MVan', 0, 7, 'b2,2,4,5,6,b7', 1622, 0, 3, '1 1 3 2 2 1', '');
INSERT INTO `tblscitype` VALUES (232, 'Kalamurti', 'Kal', 0, 7, 'b2,2,4,5,b6,6', 1628, 0, 3, '1 1 3 2 1 1', 'Mela Kanakangi, Chromatic Dorian, Mela Bhavapriya');
INSERT INTO `tblscitype` VALUES (233, 'Mela Ganamurti', 'MGana', 0, 7, 'b2,2,4,5,b6,7', 1625, 0, 4, '1 1 3 2 1 3', '');
INSERT INTO `tblscitype` VALUES (234, 'Mela Ratnangi', 'MRat', 0, 7, 'b2,2,4,5,b6,b7', 1626, 0, 3, '1 1 3 2 1 2', '');
INSERT INTO `tblscitype` VALUES (235, 'Mela Tanarupi', 'MTan', 1, 7, 'b2,2,4,5,b7,7', 1619, 0, 5, '1 1 3 2 3 1', '');
INSERT INTO `tblscitype` VALUES (236, 'Chromatic Hypophrygian Inv', 'CHPi', 0, 7, 'b2,2,4,b5,5,6', 1652, 0, 3, '1 1 3 1 1 2', '');
INSERT INTO `tblscitype` VALUES (237, 'Chromatic Mixolydian', 'CM', 0, 7, 'b2,2,4,b5,5,b7', 1650, 0, 3, '1 1 3 1 1 3', '');
INSERT INTO `tblscitype` VALUES (238, 'Mela Pavani', 'MPav', 0, 7, 'b2,2,b5,5,6,7', 1589, 0, 4, '1 1 4 1 2 2', 'Raga Kumbhini');
INSERT INTO `tblscitype` VALUES (239, 'Mela Navanitam', 'MNav', 1, 7, 'b2,2,b5,5,6,b7', 1590, 0, 3, '1 1 4 1 2 1', '');
INSERT INTO `tblscitype` VALUES (240, 'Mela Salaga', 'MSal', 1, 7, 'b2,2,b5,5,b6,6', 1596, 0, 4, '1 1 4 1 1 1', 'Mela Salagam');
INSERT INTO `tblscitype` VALUES (241, 'Mela Jhalavarali', 'MJR', 1, 7, 'b2,2,b5,5,b6,7', 1593, 0, 4, '1 1 4 1 1 3', '');
INSERT INTO `tblscitype` VALUES (242, 'Mela Jalarnava', 'MJ', 1, 7, 'b2,2,b5,5,b6,b7', 1594, 0, 3, '1 1 4 1 1 2', '');
INSERT INTO `tblscitype` VALUES (243, 'Mela Raghupriya', 'MRagh', 1, 7, 'b2,2,b5,5,b7,7', 1587, 0, 5, '1 1 4 1 3 1', 'Ghandarva');
INSERT INTO `tblscitype` VALUES (244, 'Mela Suryakantam', 'MSur', 1, 7, 'b2,3,4,5,6,7', 1237, 0, 3, '1 3 1 2 2 2', 'Mela Suryakanta, Bhairubahar That');
INSERT INTO `tblscitype` VALUES (245, 'Mela Chakravakam', 'MChakrava', 0, 7, 'b2,3,4,5,6,b7', 1238, 0, 2, '1 3 1 2 2 1', 'Dorian Flat Two, Bindumalini, Harmonic Minor Inv., Maqam Hicaz');
INSERT INTO `tblscitype` VALUES (246, 'Mela Gayakapriya', 'MGaya', 1, 7, 'b2,3,4,5,b6,6', 1244, 0, 3, '1 3 1 2 1 1', 'Mela Mayamalavagaula, Gypsy Heptatonic');
INSERT INTO `tblscitype` VALUES (247, 'Double Harmonic', 'DH', 1, 7, 'b2,3,4,5,b6,7', 1241, 0, 3, '1 3 1 2 1 3', 'Major Gypsy, Byzantine, Bhairav Theta, Charhargah, Gypsy, Hijaz Kar, Maqam Zengule');
INSERT INTO `tblscitype` VALUES (248, 'Spanish Gypsy', 'SG', 1, 7, 'b2,3,4,5,b6,b7', 1242, 0, 2, '1 3 1 2 1 2', 'Phygian Dominant, Ahaba Rabba, Mela Vakulabharanam, Flamenco Two, Ahaba Rabba, Major Phrygian');
INSERT INTO `tblscitype` VALUES (249, 'Mela Hatakambari', 'MHat', 1, 7, 'b2,3,4,5,b7,7', 1235, 0, 4, '1 3 1 2 3 1', '');
INSERT INTO `tblscitype` VALUES (250, 'Chromatic Lydian', 'ChromL', 0, 7, 'b2,3,4,b5,6,7', 1253, 0, 3, '1 3 1 1 3 2', 'Oriental Three');
INSERT INTO `tblscitype` VALUES (252, 'Persian', 'Per', 0, 7, 'b2,3,4,b5,b6,7', 1257, 0, 3, '1 3 1 1 2 3', 'Raga Lalita');
INSERT INTO `tblscitype` VALUES (253, 'Oriental', 'Ori', 0, 7, 'b2,3,4,b5,b6,b7', 1258, 0, 3, '1 3 1 1 2 2', '');
INSERT INTO `tblscitype` VALUES (254, 'Verdi Enigmatic Descending', 'VED', 0, 7, 'b2,3,4,b6,b7,7', 1227, 0, 4, '1 3 1 3 2 1', '');
INSERT INTO `tblscitype` VALUES (255, 'Marva Theta', 'MT', 0, 7, 'b2,3,b5,5,6,7', 1205, 0, 3, '1 3 2 1 2 2', 'Marva That, Mela Gamanasrama');
INSERT INTO `tblscitype` VALUES (256, 'Mela Ramapriya', 'MRama', 1, 7, 'b2,3,b5,5,6,b7', 1206, 0, 2, '1 3 2 1 2 1', 'Oriental2');
INSERT INTO `tblscitype` VALUES (257, 'Mela Dhavalambari', 'MDha', 1, 7, 'b2,3,b5,5,b6,6', 1212, 0, 4, '1 3 2 1 1 1', '');
INSERT INTO `tblscitype` VALUES (258, 'Basant', 'Bas', 1, 7, 'b2,3,b5,5,b6,7', 1209, 0, 3, '1 3 2 1 1 3', 'Double Harmonic Three, Mela Kamavarardhani, Purvi Theta, Chromatic Hypolydian, Kasiramakriya');
INSERT INTO `tblscitype` VALUES (259, 'Mela Namanarayani', 'MNam', 1, 7, 'b2,3,b5,5,b6,b7', 1210, 0, 3, '1 3 2 1 1 2', '');
INSERT INTO `tblscitype` VALUES (260, 'Mela Visvambari', 'MVis', 1, 7, 'b2,3,b5,5,b7,7', 1203, 0, 4, '1 3 2 1 3 1', '');
INSERT INTO `tblscitype` VALUES (261, 'Verdi Enigmatic Ascending', 'VEA', 0, 7, 'b2,3,b5,b6,b7,7', 1195, 0, 4, '1 3 2 2 2 1', 'Enigmatic');
INSERT INTO `tblscitype` VALUES (342, 'Norwegian', 'Norw', 0, 6, '2,3,4,5,b6', 728, 0, 2, '2 2 1 2 1', '');
INSERT INTO `tblscitype` VALUES (263, 'Jazz Altered', 'JA', 0, 7, 'b2,b3,3,b5,b6,b7', 1450, 0, 2, '1 2 1 2 2 2', 'Altered Dominant Scale, ADS, Diminished Whole Tone, Super Locrian, Altered, Locrian Flat Four');
INSERT INTO `tblscitype` VALUES (264, 'Neapolitan Major', 'MNea', 1, 7, 'b2,b3,4,5,6,7', 1365, 0, 3, '1 2 2 2 2 2', 'Mela Kokilapriya');
INSERT INTO `tblscitype` VALUES (265, 'Javanese', 'Jav', 0, 7, 'b2,b3,4,5,6,b7', 1366, 0, 2, '1 2 2 2 2 1', 'Adonai Malakh, Mela Natakapriya, Jazz Minor Inv.');
INSERT INTO `tblscitype` VALUES (266, 'Malini', 'MSen', 0, 7, 'b2,b3,4,5,b6,6', 1372, 0, 3, '1 2 2 2 1 1', 'Mela Senavati');
INSERT INTO `tblscitype` VALUES (267, 'Neapolitan', 'Nea', 0, 7, 'b2,b3,4,5,b6,7', 1369, 0, 3, '1 2 2 2 1 3', 'Mela Dhenuka');
INSERT INTO `tblscitype` VALUES (268, 'Phrygian', 'Phr', 0, 7, 'b2,b3,4,5,b6,b7', 1370, 0, 2, '1 2 2 2 1 2', 'Neapolitan Minor Two, Bhairav Theta, Bhairavi Theta, Mela Hanumattodi, Greek Dorian, In, Major Inv., Maqam Kurd, Maqam Shahnaz Kurdi, Mechung, Medieval Hypoaeolian');
INSERT INTO `tblscitype` VALUES (269, 'Mela Rupavati', 'MRup', 1, 7, 'b2,b3,4,5,b7,7', 1363, 0, 4, '1 2 2 2 3 1', '');
INSERT INTO `tblscitype` VALUES (270, 'Locrian Natural Six', 'Locn6', 0, 7, 'b2,b3,4,b5,6,b7', 1382, 0, 2, '1 2 2 1 3 1', '');
INSERT INTO `tblscitype` VALUES (271, 'Locrian', 'Loc', 0, 7, 'b2,b3,4,b5,b6,b7', 1386, 0, 2, '1 2 2 1 2 2', 'Half Diminished, Greek Hyperdorian, Greek Mixolydian, Half Diminished, Locrian Minor, Medieval Hypophrygian');
INSERT INTO `tblscitype` VALUES (272, 'Mela Suvarnangi', 'MSuv', 1, 7, 'b2,b3,b5,5,6,7', 1333, 0, 3, '1 2 3 1 2 2', 'Raga Sauviram');
INSERT INTO `tblscitype` VALUES (273, 'Mela Sadvidhamargini', 'MSad', 0, 7, 'b2,b3,b5,5,6,b7', 1334, 0, 2, '1 2 3 1 2 1', '');
INSERT INTO `tblscitype` VALUES (274, 'Mela Gavambodhi', 'MGav', 0, 7, 'b2,b3,b5,5,b6,6', 1340, 0, 4, '1 2 3 1 1 1', '');
INSERT INTO `tblscitype` VALUES (275, 'Todi Theta', 'TodiT', 0, 7, 'b2,b3,b5,5,b6,7', 1337, 0, 3, '1 2 3 1 1 3', 'Todi That, Mela Subhapantuvarali');
INSERT INTO `tblscitype` VALUES (276, 'Mela Bhavapriya', 'MBha', 0, 7, 'b2,b3,b5,5,b6,b7', 1338, 0, 3, '1 2 3 1 1 2', '');
INSERT INTO `tblscitype` VALUES (277, 'Mela Divyamani', 'MDiv', 1, 7, 'b2,b3,b5,5,b7,7', 1331, 0, 4, '1 2 3 1 3 1', '');
INSERT INTO `tblscitype` VALUES (278, 'Mela Sulini', 'MSul', 1, 7, 'b3,3,4,5,6,7', 469, 0, 3, '3 1 1 2 2 2', '');
INSERT INTO `tblscitype` VALUES (279, 'Mela Vagadhisvari', 'MVag', 1, 7, 'b3,3,4,5,6,b7', 470, 0, 3, '3 1 1 2 2 1', 'Bluesy R&R');
INSERT INTO `tblscitype` VALUES (280, 'Mela Yagapriya', 'MYag', 1, 7, 'b3,3,4,5,b6,6', 476, 0, 3, '3 1 1 2 1 1', '');
INSERT INTO `tblscitype` VALUES (281, 'Mela Gangeyabhusani', 'MGang', 1, 7, 'b3,3,4,5,b6,7', 473, 0, 3, '3 1 1 2 1 3', '');
INSERT INTO `tblscitype` VALUES (282, 'Mela Ragavardhani', 'MRaga', 1, 7, 'b3,3,4,5,b6,b7', 474, 0, 3, '3 1 1 2 1 2', 'Ahavoh Rabboh, Alhijaz, Harmonic Major Inv., Maqam Humaayun');
INSERT INTO `tblscitype` VALUES (283, 'Mela Chalanata', 'MCha', 1, 7, 'b3,3,4,5,b7,7', 467, 0, 3, '3 1 1 2 3 1', '');
INSERT INTO `tblscitype` VALUES (284, 'Chromatic Hypodorian Inv.', 'CHDi', 0, 7, 'b3,3,4,b6,6,b7', 462, 0, 3, '3 1 1 3 1 1', '');
INSERT INTO `tblscitype` VALUES (285, 'Chromatic Phrygian Inv', 'CPi', 0, 7, 'b3,3,4,b6,b7,7', 459, 0, 3, '3 1 1 3 2 1', '');
INSERT INTO `tblscitype` VALUES (286, 'Mela Kosalam', 'MKos', 0, 7, 'b3,3,b5,5,6,7', 437, 0, 2, '3 1 2 1 2 2', 'Lydian Sharp Two');
INSERT INTO `tblscitype` VALUES (287, 'Major Hungarian', 'MHung', 1, 7, 'b3,3,b5,5,6,b7', 438, 0, 2, '3 1 2 1 2 1', 'Mela Nasikabhusani, Lydian Sharp Two');
INSERT INTO `tblscitype` VALUES (288, 'Mela Sucharitra', 'MSuch', 1, 7, 'b3,3,b5,5,b6,6', 444, 0, 4, '3 1 2 1 1 1', '');
INSERT INTO `tblscitype` VALUES (289, 'Devarashtra', 'Dev', 0, 7, 'b3,3,b5,5,b6,7', 441, 0, 3, '3 1 2 1 1 3', 'Mela Dhatuvardhani');
INSERT INTO `tblscitype` VALUES (290, 'Mela Jyotisvarupini', 'MJyo', 1, 7, 'b3,3,b5,5,b6,b7', 442, 0, 3, '3 1 2 1 1 2', '');
INSERT INTO `tblscitype` VALUES (291, 'Mela Rasikapriya', 'MRas', 0, 7, 'b3,3,b5,5,b7,7', 435, 0, 3, '3 1 2 1 3 1', '');
INSERT INTO `tblscitype` VALUES (292, 'Enigmatic', 'Enigma', 0, 7, 'b3,3,b5,b6,b7,7', 427, 0, 3, '3 1 2 2 2 1', '');
INSERT INTO `tblscitype` VALUES (293, 'Chromatic Hypophrgian', 'CHP', 0, 7, 'b3,4,b5,5,b7,7', 371, 0, 3, '3 2 1 1 3 1', '');
INSERT INTO `tblscitype` VALUES (294, 'Genus Diatonicum', 'GenD', 0, 8, '2,3,4,5,6,b7,7', 727, 0, 4, '2 2 1 2 2 1 1', 'Bebop Dominant, Chinese Eight Tone');
INSERT INTO `tblscitype` VALUES (295, 'Major Bebop', 'MBebop', 0, 8, '2,3,4,5,b6,6,7', 733, 0, 3, '2 2 1 2 1 1 2', '');
INSERT INTO `tblscitype` VALUES (296, 'Ichikotsucho', 'Ich', 0, 8, '2,3,4,b5,5,6,7', 757, 0, 4, '2 2 1 1 1 2 2', 'Genus Diatonicum Veterum Correctum');
INSERT INTO `tblscitype` VALUES (297, 'Messiaen Mode Six Inv.', 'MM6i', 1, 8, '2,3,4,b5,b6,b7,7', 747, 4, 3, '2 2 1 1 2 2 1', '');
INSERT INTO `tblscitype` VALUES (298, 'Minor Bebop', '-Bebop', 1, 8, '2,b3,3,4,5,6,b7', 982, 0, 4, '2 1 1 1 2 2 1', '');
INSERT INTO `tblscitype` VALUES (299, 'Raga Mian Ki Malhar', 'RMKM', 1, 8, '2,b3,4,5,6,b7,7', 855, 0, 4, '2 1 2 2 2 1 1', '');
INSERT INTO `tblscitype` VALUES (300, 'Zirafkend', 'Ziraf', 1, 8, '2,b3,4,5,b6,6,7', 861, 0, 3, '2 1 2 2 1 1 2', '');
INSERT INTO `tblscitype` VALUES (301, 'Raga Mukhari', 'RMuk', 0, 8, '2,b3,4,5,b6,6,b7', 862, 0, 4, '2 1 2 2 1 1 1', '');
INSERT INTO `tblscitype` VALUES (302, 'Maqam Nahawand', 'MqNah', 0, 8, '2,b3,4,5,b6,b7,7', 859, 0, 3, '2 1 2 2 1 2 1', 'Major Minor Mixed');
INSERT INTO `tblscitype` VALUES (303, 'Blues Scale Four', 'B4', 0, 8, '2,b3,4,b5,5,6,b7', 886, 0, 3, '2 1 2 1 1 2 1', '');
INSERT INTO `tblscitype` VALUES (304, 'Algerian Octatonic', 'AO', 0, 8, '2,b3,4,b5,5,b6,7', 889, 0, 4, '2 1 2 1 1 1 3', '');
INSERT INTO `tblscitype` VALUES (305, 'Diminished', 'Dim', 0, 8, '2,b3,4,b5,b6,6,7', 877, 2, 2, '2 1 2 1 2 1 2', 'Auxiliary Diminished, Arabian Octatonic, Diminished Minor');
INSERT INTO `tblscitype` VALUES (306, 'Raga Cintamani', 'RCint', 1, 8, '2,b3,b5,5,b6,6,b7', 830, 0, 5, '2 1 3 1 1 1 1', '');
INSERT INTO `tblscitype` VALUES (307, 'Messiaen Mode Six', 'MM6', 1, 8, 'b2,2,3,b5,5,b6,7', 1721, 0, 4, '1 1 2 2 1 1 3', '');
INSERT INTO `tblscitype` VALUES (308, 'Adonai Malakh', 'AM', 1, 8, 'b2,2,b3,4,5,6,b7', 1878, 0, 4, '1 1 1 2 2 2 1', '');
INSERT INTO `tblscitype` VALUES (309, 'Messiaen Mode Four', 'M4', 1, 8, 'b2,2,b3,b5,5,b6,6', 1852, 4, 4, '1 1 1 3 1 1 1', '');
INSERT INTO `tblscitype` VALUES (310, 'Raga Saurastra', 'RSaur', 1, 8, 'b2,3,4,5,b6,6,7', 1245, 0, 3, '1 3 1 2 1 1 2', '');
INSERT INTO `tblscitype` VALUES (311, 'Maqam Hijaz', 'MqHij', 1, 8, 'b2,3,4,5,b6,b7,7', 1243, 0, 4, '1 3 1 2 1 2 1', '');
INSERT INTO `tblscitype` VALUES (312, 'Raga Bhatiyar', 'RBhat', 1, 8, 'b2,3,4,b5,5,6,7', 1269, 0, 4, '1 3 1 1 1 2 2', '');
INSERT INTO `tblscitype` VALUES (313, 'Raga Ramkali', 'RRam', 0, 8, 'b2,3,4,b5,5,b6,7', 1273, 0, 5, '1 3 1 1 1 1 3', '');
INSERT INTO `tblscitype` VALUES (314, 'Maqam Shaddaraban', 'MqSha', 0, 7, 'b2,3,4,b5,6,b7', 1254, 0, 3, '1 3 1 1 3 1', '');
INSERT INTO `tblscitype` VALUES (315, 'Verdi Enigmatica', 'VE', 1, 8, 'b2,3,4,b5,b6,b7,7', 1259, 0, 4, '1 3 1 1 2 2 1', '');
INSERT INTO `tblscitype` VALUES (316, 'Flamenco', 'Flam', 1, 8, 'b2,b3,3,4,5,b6,b7', 1498, 0, 3, '1 2 1 1 2 1 2', 'Spanish Phrygian');
INSERT INTO `tblscitype` VALUES (317, 'Espla', 'Espla', 0, 8, 'b2,b3,3,4,b5,b6,7', 1513, 0, 4, '1 2 1 1 1 2 3', '');
INSERT INTO `tblscitype` VALUES (318, 'Eight Tone Spanish', 'ETS', 0, 8, 'b2,b3,3,4,b5,b6,b7', 1514, 0, 4, '1 2 1 1 1 2 2', '');
INSERT INTO `tblscitype` VALUES (319, 'Octatonic', 'Oct', 1, 8, 'b2,b3,3,b5,5,6,b7', 1462, 2, 2, '1 2 1 2 1 2 1', 'Auxiliary Diminished Blues, Composite, Diminished Inv., Diminished Dominant, Half-Whole Step');
INSERT INTO `tblscitype` VALUES (320, 'Magen Abot', 'MA', 0, 8, 'b2,b3,3,b5,b6,6,7', 1453, 0, 3, '1 2 1 2 2 1 2', '');
INSERT INTO `tblscitype` VALUES (321, 'Bebop Half-diminished Oct', 'BHDO', 0, 8, 'b2,b3,4,b5,6,b7,7', 1383, 0, 5, '1 2 2 1 3 1 1', '');
INSERT INTO `tblscitype` VALUES (322, 'Blues v.5', 'B5', 1, 8, 'b3,3,4,b5,5,b7,7', 499, 0, 5, '3 1 1 1 1 3 1', '');
INSERT INTO `tblscitype` VALUES (323, 'Messiaen Mode Four Inv.', 'M4i', 0, 8, 'b3,3,4,b5,6,b7,7', 487, 4, 4, '3 1 1 1 3 1 1', '');
INSERT INTO `tblscitype` VALUES (324, 'Taishikicho', 'Taish', 1, 9, '2,3,4,b5,5,6,b7,7', 759, 0, 4, '2 2 1 1 1 2 1 1', '');
INSERT INTO `tblscitype` VALUES (325, 'Blues Nonatonic', 'B9', 1, 9, '2,b3,3,4,b5,5,6,b7', 1014, 0, 6, '2 1 1 1 1 1 2 1', '');
INSERT INTO `tblscitype` VALUES (326, 'Nine Tone', '9T', 1, 9, '2,b3,3,4,b5,b6,6,7', 1005, 0, 5, '2 1 1 1 1 2 1 2', '');
INSERT INTO `tblscitype` VALUES (327, 'Messiaen Mode Three Inv', 'Mess3i', 0, 8, '2,b3,3,b5,5,b6,7', 953, 0, 3, '2 1 1 2 1 1 3', '');
INSERT INTO `tblscitype` VALUES (328, 'Raga Ramdasi Malhar', 'RRM', 1, 9, '2,b3,3,b5,b6,6,b7,7', 943, 0, 5, '2 1 1 2 2 1 1 1', '');
INSERT INTO `tblscitype` VALUES (329, 'Raga Pilu', 'RPil', 1, 9, '2,b3,4,5,b6,6,b7,7', 863, 0, 6, '2 1 2 2 1 1 1 1', '');
INSERT INTO `tblscitype` VALUES (330, 'Messiaen Mode Three', 'Mess3', 0, 9, 'b2,2,3,4,5,b6,6,b7', 1758, 0, 4, '1 1 2 1 2 1 1 1', '');
INSERT INTO `tblscitype` VALUES (331, 'Youlan', 'Youl', 1, 9, 'b2,2,3,4,b5,5,6,b7', 1782, 0, 4, '1 1 2 1 1 1 2 1', '');
INSERT INTO `tblscitype` VALUES (332, 'Genus Chromaticum', 'GenC', 1, 9, 'b2,b3,3,4,5,b6,6,7', 1501, 3, 3, '1 2 1 1 2 1 1 2', '');
INSERT INTO `tblscitype` VALUES (333, 'Moorish Phrygian', 'Moor', 1, 9, 'b2,b3,3,4,5,b6,b7,7', 1499, 0, 4, '1 2 1 1 2 1 2 1', '');
INSERT INTO `tblscitype` VALUES (334, 'Blues v6', 'B6', 1, 9, 'b3,3,4,b5,5,6,b7,7', 503, 0, 5, '3 1 1 1 1 2 1 1', '');
INSERT INTO `tblscitype` VALUES (335, 'Minor Major Mixed', '-MMix', 1, 10, '2,b3,3,4,5,b6,6,b7,7', 991, 0, 6, '2 1 1 1 2 1 1 1 1', '');
INSERT INTO `tblscitype` VALUES (336, 'Minor Pentatonic with Leading', '-PentL', 0, 10, '2,b3,3,4,b5,5,6,b7,7', 1015, 0, 6, '2 1 1 1 1 1 2 1 1', '');
INSERT INTO `tblscitype` VALUES (337, 'Messiaen Mode Seven Inv', 'MM7i', 0, 10, '2,b3,3,4,b5,b6,6,b7,7', 1007, 5, 5, '2 1 1 1 1 2 1 1 1', '');
INSERT INTO `tblscitype` VALUES (338, 'Symmetrical Diatonic', 'SD', 1, 10, 'b2,2,3,4,b5,5,b6,b7,7', 1787, 5, 5, '1 1 2 1 1 1 1 2 1', '');
INSERT INTO `tblscitype` VALUES (339, 'Raga Sindhi Bhairavi', 'RSB', 1, 10, 'b2,2,b3,3,4,5,b6,6,7', 2013, 0, 7, '1 1 1 1 1 2 1 1 2', '');
INSERT INTO `tblscitype` VALUES (340, 'Messiaen Mode Seven', 'MM7', 0, 10, 'b2,2,b3,3,b5,5,b6,6,b7', 1982, 5, 5, '1 1 1 1 2 1 1 1 1', '');
INSERT INTO `tblscitype` VALUES (341, 'Chromatic', 'Chrom', 1, 12, 'b2,2,b3,3,4,b5,5,b6,6,b7,7', 2047, 1, 12, '1 1 1 1 1 1 1 1 1 1 1', '');
INSERT INTO `tblscitype` VALUES (343, 'Gypsy Tetrachord', 'GT', 1, 4, 'b2,3,4', 1216, 0, 2, '1 3 1', 'Ahava Raba, Odessa Bulgar, Hijaz, Suzidil, Shahnaz, Shadd Araban, Chromatic Mezotetrachord, Arabian Tetramirror');
INSERT INTO `tblscitype` VALUES (344, 'Minor Tetrachord', '-Tet', 1, 4, '2,b3,4', 832, 0, 2, '2 1 2', 'Busalik, Nahawand, Phrygian Tetrachord, MInor Tetramirror');
INSERT INTO `tblscitype` VALUES (345, 'Ajam', 'Ajam', 0, 4, '2,3,4', 704, 0, 2, '2 2 1', 'Jahar Kah, Major Tetrachord, Lydian Tetrachord');
INSERT INTO `tblscitype` VALUES (346, 'Hisar', 'His', 1, 4, '2,b3,b5', 800, 0, 2, '2 1 3', 'Dim Add Two');
INSERT INTO `tblscitype` VALUES (347, 'Kurdi', 'Kurd', 1, 4, 'b2,b3,4', 1344, 0, 2, '1 2 2', 'Dorian Tetrachord');
INSERT INTO `tblscitype` VALUES (348, 'Italian Six', 'I6', 0, 3, '3,6', 132, 0, 1, '4 5', 'Raga Bilwadala');
INSERT INTO `tblscitype` VALUES (349, 'Gowleeswari', 'Gow', 0, 4, 'b2,4,b6', 1096, 0, 2, '1 4 3', 'Raga Lavangi');
INSERT INTO `tblscitype` VALUES (350, 'Raga Haripriya', 'RHari', 0, 4, '2,4,b6', 584, 0, 1, '2 3 3', '');
INSERT INTO `tblscitype` VALUES (351, 'Raga Sumukam', 'RSum', 1, 4, '2,b5,7', 545, 0, 2, '2 4 5', '');
INSERT INTO `tblscitype` VALUES (353, 'Bebob Half-diminished', 'BH', 0, 7, 'b2,b3,4,b5,b6,7', 1385, 0, 3, '1 2 2 1 2 3', '');
INSERT INTO `tblscitype` VALUES (354, 'Bibhas', 'Bib', 0, 5, 'b2,3,b5,6', 1188, 0, 2, '1 3 2 3', '');
INSERT INTO `tblscitype` VALUES (355, 'Bach Trimirror', 'BTriM', 1, 3, 'b2,2', 1536, 0, 3, '1 1', 'Chromatic Trimirror');
INSERT INTO `tblscitype` VALUES (356, 'Phrygian Trichord', 'PTC', 1, 3, 'b2,b3', 1280, 0, 2, '1 2', '');
INSERT INTO `tblscitype` VALUES (357, 'Minor Trichord', '-TC', 1, 3, '2,b3', 768, 0, 2, '2 1', '');
INSERT INTO `tblscitype` VALUES (358, 'Bach Tetramirror', 'BTetM', 1, 4, 'b2,2,b3', 1792, 0, 4, '1 1 1', 'Chromatic Tetramirror');
INSERT INTO `tblscitype` VALUES (359, 'Major-Minor Trichord', '-MTC', 1, 3, 'b2,3', 1152, 0, 2, '1 3', '');
INSERT INTO `tblscitype` VALUES (360, 'Major-second Tetracluster', 'M2TetC2', 1, 4, 'b2,2,3', 1664, 0, 3, '1 1 2', '');
INSERT INTO `tblscitype` VALUES (361, 'Alternating Tetramirror', 'ATetM', 1, 4, 'b2,b3,3', 1408, 0, 2, '1 2 1', '');
INSERT INTO `tblscitype` VALUES (362, 'Major Second Tetracluster', 'M2TetC1', 1, 4, '2,b3,3', 896, 0, 3, '2 1 1', '');
INSERT INTO `tblscitype` VALUES (363, 'Chromatic Pentamirror', 'C5PentM', 1, 5, 'b2,2,b3,3', 1920, 0, 5, '1 1 1 1', '');
INSERT INTO `tblscitype` VALUES (364, 'Incomplete Minor Seventh', '-7inc', 0, 3, '2,4', 576, 0, 1, '2 3', '');
INSERT INTO `tblscitype` VALUES (365, 'Minor Third Tetracluster 1', '-3TetC', 1, 4, 'b2,2,4', 1600, 0, 3, '1 1 3', '');
INSERT INTO `tblscitype` VALUES (366, 'Seven Omit Three', '7om3', 1, 3, '5,b7', 18, 0, 1, '7 3', 'Dominant Seventh Incomplete');
INSERT INTO `tblscitype` VALUES (367, 'Major Second Pentacluster', 'M2Pent', 1, 5, 'b2,2,b3,4', 1856, 0, 4, '1 1 1 2', '');
INSERT INTO `tblscitype` VALUES (369, 'Minor Second Major Pentachord', '-2M5', 1, 5, 'b2,2,3,4', 1728, 0, 3, '1 1 2 1', '');
INSERT INTO `tblscitype` VALUES (371, 'Chaio', 'Chaio', 0, 5, '2,4,b6,b7', 586, 0, 1, '2 3 3 2', '');
INSERT INTO `tblscitype` VALUES (372, 'Chan', 'Chan', 0, 5, 'b3,b5,b6,b7', 298, 0, 1, '3 3 2 2', 'Chin, Raga Harikauns');
INSERT INTO `tblscitype` VALUES (373, 'Chromatic Dorian Inverse', 'CDi', 1, 8, '2,b3,3,4,5,b7,7', 979, 0, 4, '2 1 1 1 2 3 1', '');
INSERT INTO `tblscitype` VALUES (374, 'Han-Kumoi', 'HK', 0, 5, '2,4,5,b6', 600, 0, 2, '2 3 2 1', 'Japanese Two,Raga Shobhavari, Sutradhari');
INSERT INTO `tblscitype` VALUES (375, 'Hindolita', 'Hin', 0, 5, '3,4,6,7', 197, 0, 2, '4 1 4 2', 'Kaushikdhvani, Raga Bhinna Shadja, Kaushikdhvani');
INSERT INTO `tblscitype` VALUES (376, 'Honchoshi Plagal Form', 'HPF', 0, 6, 'b2,b3,4,b5,b7', 1378, 0, 2, '1 2 2 1 4', '');
INSERT INTO `tblscitype` VALUES (377, 'Janasammodini', 'Jan', 0, 5, '2,3,5,b6', 664, 0, 2, '2 2 3 1', 'Raga Bhupeshwari');
INSERT INTO `tblscitype` VALUES (378, 'Raga Jayakauns', 'RJay', 0, 5, 'b3,4,b5,b7', 354, 0, 2, '3 2 1 4', 'Kumoi Two');
INSERT INTO `tblscitype` VALUES (379, 'Kyemyonjo', 'Kyem', 0, 5, 'b3,4,5,6', 340, 0, 1, '3 2 2 2', '');
INSERT INTO `tblscitype` VALUES (380, 'Locrian Flat 4 Double Flat 7', 'Locb4bb7', 0, 7, 'b2,b3,3,b5,b6,6', 1452, 0, 2, '1 2 1 2 2 1', '');
INSERT INTO `tblscitype` VALUES (381, 'Maqam Huzzam', 'MqHuz', 0, 7, 'b2,b3,3,5,b6,b7', 1434, 0, 2, '1 2 1 3 1 2', '');
INSERT INTO `tblscitype` VALUES (382, 'Raga Budhamanohari', 'RBud', 1, 5, '2,3,4,5', 720, 0, 2, '2 2 1 2', '');
INSERT INTO `tblscitype` VALUES (383, 'Rajeshwari', 'Raj', 1, 5, 'b3,4,6,7', 325, 0, 2, '3 2 4 2', 'Raga Chandrakauns Modern, Marga Hindola');
INSERT INTO `tblscitype` VALUES (384, 'Surya', 'Sur', 0, 5, 'b3,4,6,b7', 326, 0, 2, '3 2 4 1', 'Varamu, Raga Chandrakauns Kafi');
INSERT INTO `tblscitype` VALUES (385, 'Raga Chaundrakauns Kiravani', 'RCK', 0, 5, 'b3,4,b6,7', 329, 0, 2, '3 2 3 3', '');
INSERT INTO `tblscitype` VALUES (386, 'Raga Chitthakarshini', 'RChi', 0, 5, 'b2,b3,4,b6', 1352, 0, 2, '1 2 2 3', '');
INSERT INTO `tblscitype` VALUES (387, 'Raga Desh', 'RDesh', 0, 5, '2,4,5,7', 593, 0, 2, '2 3 2 4', '');
INSERT INTO `tblscitype` VALUES (388, 'Raga Devaranjani', 'RDev', 1, 5, '4,5,b6,7', 89, 0, 2, '5 2 1 3', 'Devaranji');
INSERT INTO `tblscitype` VALUES (389, 'Raga Dhavalashri', 'RDS', 0, 5, '3,b5,5,6', 180, 0, 2, '4 2 1 2', '');
INSERT INTO `tblscitype` VALUES (390, 'Bacovia', 'Bac', 0, 5, '3,4,b6,7', 201, 0, 2, '4 1 3 3', 'Raga Girija');
INSERT INTO `tblscitype` VALUES (391, 'Raga Guhamanohari', 'RGuh', 0, 5, '2,4,6,b7', 582, 0, 2, '2 3 4 1', '');
INSERT INTO `tblscitype` VALUES (392, 'Raga Khamaj Durga', 'RKD', 0, 5, '3,4,6,b7', 198, 0, 2, '4 1 4 1', '');
INSERT INTO `tblscitype` VALUES (393, 'Raga Kokil Pancham', 'RKP', 0, 5, 'b3,4,5,b6', 344, 0, 2, '3 2 2 1', '');
INSERT INTO `tblscitype` VALUES (394, 'Raga Kumarpriya', 'RKumarP', 1, 5, 'b2,2,b6,7', 1545, 0, 4, '1 1 6 3', '');
INSERT INTO `tblscitype` VALUES (395, 'Raga Kunkvarali', 'RKunt', 0, 5, '4,5,6,b7', 86, 0, 2, '5 2 2 1', 'Kuntavarali');
INSERT INTO `tblscitype` VALUES (396, 'Raga Matha Kokila', 'RMK', 1, 5, '2,5,6,b7', 534, 0, 2, '2 5 2 1', 'Matkokil');
INSERT INTO `tblscitype` VALUES (397, 'Raga Mohanangi', 'RMoh', 0, 5, 'b3,3,5,6', 404, 0, 2, '3 1 3 2', '');
INSERT INTO `tblscitype` VALUES (398, 'Raga Multani', 'RMult', 0, 5, 'b3,b5,5,7', 305, 0, 2, '3 3 1 4', '');
INSERT INTO `tblscitype` VALUES (399, 'Raga Mand', 'RMand', 0, 5, '3,4,5,6', 212, 0, 2, '4 1 2 2', 'Raga Nagasvaravali');
INSERT INTO `tblscitype` VALUES (400, 'Raga Neroshta', 'RNer', 0, 5, '2,3,6,7', 645, 0, 2, '2 2 5 2', '');
INSERT INTO `tblscitype` VALUES (401, 'Raga Hindol', 'RHind', 0, 5, '3,b5,6,7', 165, 0, 2, '4 2 3 2', 'Sunada Vinodini, Sanjh ka Hindol');
INSERT INTO `tblscitype` VALUES (402, 'Raga Priyadarshini', 'RPri', 1, 5, '2,4,b6,7', 585, 0, 2, '2 3 3 3', '');
INSERT INTO `tblscitype` VALUES (403, 'Purvaholika', 'Purv', 1, 5, '4,5,6,7', 85, 0, 2, '5 2 2 2', 'Raga Puruhutika');
INSERT INTO `tblscitype` VALUES (404, 'Raga Putrika', 'RPut', 0, 5, 'b2,2,b6,6', 1548, 0, 3, '1 1 6 1', '');
INSERT INTO `tblscitype` VALUES (405, 'Raga Rasranjani', 'RRasran', 0, 5, '2,4,6,7', 581, 0, 2, '2 3 4 2', '');
INSERT INTO `tblscitype` VALUES (406, 'Madhukauns Pentatonic', 'MP', 1, 5, 'b3,b5,5,b7', 306, 0, 2, '3 3 1 3', 'Raga Samudhra Priya');
INSERT INTO `tblscitype` VALUES (407, 'Varini', 'Var', 0, 5, 'b3,5,b6,b7', 282, 0, 2, '3 4 1 2', 'Raga Shailaja');
INSERT INTO `tblscitype` VALUES (408, 'Raga Shri Kalyan', 'RSK', 0, 5, '2,b5,5,6', 564, 0, 2, '2 4 1 2', '');
INSERT INTO `tblscitype` VALUES (409, 'Raga Shubravarni', 'RShu', 0, 5, '2,b5,6,7', 549, 0, 2, '2 4 3 2', '');
INSERT INTO `tblscitype` VALUES (410, 'Hamsanada', 'Ham', 0, 5, '2,b5,5,7', 561, 0, 2, '2 4 1 4', 'Raga Vaijayanti');
INSERT INTO `tblscitype` VALUES (411, 'Raga Zilaf', 'RZil', 0, 5, '3,4,5,b6', 216, 0, 2, '4 1 2 1', '');
INSERT INTO `tblscitype` VALUES (412, 'Raga Kashyapi', 'RKash', 0, 6, 'b2,b3,5,b6,b7', 1306, 0, 2, '1 2 4 1 2', '');
INSERT INTO `tblscitype` VALUES (413, 'Raga Kalakanthi', 'RKalaK', 1, 6, 'b2,4,5,b6,6', 1116, 0, 3, '1 4 2 1 1', '');
INSERT INTO `tblscitype` VALUES (414, 'Raga Nilangi', 'RNil', 1, 6, '2,b3,b5,b6,6', 812, 3, 2, '2 1 3 2 1', '');
INSERT INTO `tblscitype` VALUES (415, 'Raga Nishadi', 'RNish', 0, 6, '2,b5,5,6,7', 565, 0, 2, '2 4 1 2 2', '');
INSERT INTO `tblscitype` VALUES (416, 'Natural Seven Sus Four', 'n7sus4', 1, 4, '4,5,7', 81, 0, 2, '5 2 4', '');
INSERT INTO `tblscitype` VALUES (417, 'Transformative', 'Trans', 1, 4, 'b5,5,b7', 50, 0, 2, '6 1 3', '');
INSERT INTO `tblscitype` VALUES (418, 'Chaos', 'Chaos', 1, 4, 'b2,5,b6', 1048, 0, 2, '1 6 1', '');
INSERT INTO `tblscitype` VALUES (419, 'French Six', 'F6', 0, 4, '3,b5,6', 164, 0, 1, '4 2 3', '');
INSERT INTO `tblscitype` VALUES (420, 'Serotonin', 'Ser', 1, 4, '4,b6,7', 73, 0, 2, '5 3 3', '');
INSERT INTO `tblscitype` VALUES (421, 'Dopamine', 'Dop', 1, 4, 'b3,b5,7', 289, 0, 2, '3 3 5', '');
INSERT INTO `tblscitype` VALUES (422, 'Noradrenaline', 'Nora', 1, 4, '2,b6,7', 521, 0, 2, '2 6 3', '');
INSERT INTO `tblscitype` VALUES (423, 'Perfect Seventh', 'P7', 1, 3, '5,7', 17, 0, 2, '7 4', '');
INSERT INTO `tblscitype` VALUES (424, 'Major Seven Omit Five', 'M7om5', 1, 3, '3,7', 129, 0, 2, '4 7', '');
INSERT INTO `tblscitype` VALUES (425, 'Seven Omit Five', '7om5', 1, 3, '3,b7', 130, 0, 1, '4 6', '');
INSERT INTO `tblscitype` VALUES (426, 'Tritone Seven', 'T7', 1, 3, 'b5,7', 33, 0, 2, '6 5', '');
INSERT INTO `tblscitype` VALUES (427, 'Aug9', 'aug9', 0, 4, 'b3,3,b7', 386, 0, 2, '3 1 6', '');
INSERT INTO `tblscitype` VALUES (428, 'Dim Add Flat Six', 'oaddb6', 0, 4, 'b3,b5,b6', 296, 0, 1, '3 3 2', '');
INSERT INTO `tblscitype` VALUES (429, 'Sus Two Add Six', 'sus2add6', 0, 4, '2,5,6', 532, 0, 1, '2 5 2', '');
INSERT INTO `tblscitype` VALUES (430, 'Sus Two Add Seven', 'sus2add7', 0, 4, '2,5,7', 529, 0, 2, '2 5 4', '');
INSERT INTO `tblscitype` VALUES (431, 'Minor Major Chord', '-M', 1, 4, 'b3,3,5', 400, 0, 2, '3 1 3', '');
INSERT INTO `tblscitype` VALUES (432, 'Mysterious', 'Myst', 1, 4, 'b2,b3,b5', 1312, 0, 2, '1 2 3', '');
INSERT INTO `tblscitype` VALUES (433, 'Murder', 'Murd', 1, 4, 'b2,5,6', 1044, 0, 2, '1 6 2', '');
INSERT INTO `tblscitype` VALUES (434, 'Feline', 'Fel', 1, 4, '4,6,7', 69, 0, 2, '5 4 2', '');
INSERT INTO `tblscitype` VALUES (435, 'GermanMovie', 'GM', 1, 4, '5,b7,7', 19, 0, 3, '7 3 1', '');
INSERT INTO `tblscitype` VALUES (436, 'Windy Morning', 'WM', 1, 3, '2,3', 640, 0, 1, '2 2', '');
INSERT INTO `tblscitype` VALUES (437, 'Conception', 'Con', 1, 4, '2,3,b7', 642, 0, 1, '2 2 6', '');
INSERT INTO `tblscitype` VALUES (438, 'Minor Major Triad', '-MT', 1, 3, 'b3,3', 384, 0, 2, '3 1', '');
INSERT INTO `tblscitype` VALUES (439, 'Molokai', 'Molo', 1, 4, 'b2,4,7', 1089, 0, 3, '1 4 6', '');
INSERT INTO `tblscitype` VALUES (440, 'BigIsland', 'BigI', 1, 4, 'b2,b5,7', 1057, 0, 3, '1 5 5', '');
INSERT INTO `tblscitype` VALUES (441, 'Kauai', 'Kau', 1, 4, 'b2,5,7', 1041, 0, 3, '1 6 4', '');
INSERT INTO `tblscitype` VALUES (447, 'Lifetime', 'LT', 1, 5, '2,5,b6,7', 537, 0, 2, '2 5 1 3', '');
INSERT INTO `tblscitype` VALUES (444, 'Psychic', 'Psy', 1, 5, 'b5,5,6,b7', 54, 0, 2, '6 1 2 1', '');
INSERT INTO `tblscitype` VALUES (442, 'Waterfall', 'WF', 1, 5, 'b2,5,6,b7', 1046, 0, 2, '1 6 2 1', '');
INSERT INTO `tblscitype` VALUES (445, 'Liquid', 'Liq', 1, 5, 'b2,b3,3,6', 1412, 0, 2, '1 2 1 5', '');
INSERT INTO `tblscitype` VALUES (446, 'Drama', 'Dram', 1, 5, 'b2,b5,5,b7', 1074, 0, 2, '1 5 1 3', '');
INSERT INTO `tblscitype` VALUES (448, 'Iron', 'Fe', 1, 5, 'b2,b5,5,6', 1076, 0, 2, '1 5 1 2', '');
INSERT INTO `tblscitype` VALUES (443, 'Tsunami', 'Tsu', 1, 5, 'b5,5,6,7', 53, 0, 2, '6 1 2 2', '');
INSERT INTO `tblscitype` VALUES (449, 'Bardo', 'Bardo', 1, 5, 'b2,b3,3,5', 1424, 0, 2, '1 2 1 3', '');
INSERT INTO `tblscitype` VALUES (450, 'Fiji', 'Fiji', 1, 5, '3,5,b6,b7', 154, 0, 2, '4 3 1 2', '');
INSERT INTO `tblscitype` VALUES (451, 'Twilight', 'Twi', 1, 5, 'b2,b3,5,6', 1300, 0, 2, '1 2 4 2', '');
INSERT INTO `tblscitype` VALUES (452, 'Suave', 'Suave', 1, 5, 'b3,3,5,b6', 408, 0, 2, '3 1 3 1', '');
INSERT INTO `tblscitype` VALUES (453, 'Prana', 'Pra', 1, 6, 'b2,b5,5,6,b7', 1078, 0, 2, '1 5 1 2 1', '');
INSERT INTO `tblscitype` VALUES (454, 'Ethereal', 'Ethe', 1, 6, 'b3,3,5,6,b7', 406, 0, 2, '3 1 3 2 1', '');
INSERT INTO `tblscitype` VALUES (455, 'Perfection', 'Perf', 1, 5, 'b2,5,6,7', 1045, 0, 3, '1 6 2 2', '');
INSERT INTO `tblscitype` VALUES (456, 'Azure', 'Azure', 1, 5, 'b2,b6,6,7', 1037, 0, 3, '1 7 1 2', '');
INSERT INTO `tblscitype` VALUES (457, 'Coconut', 'Coc', 1, 5, 'b2,b3,6,7', 1285, 0, 3, '1 2 6 2', '');
INSERT INTO `tblscitype` VALUES (458, 'Tonga', 'Tong', 1, 5, 'b2,b5,b6,7', 1065, 0, 3, '1 5 2 3', '');
INSERT INTO `tblscitype` VALUES (459, 'Astral', 'Astral', 1, 6, 'b2,b5,b6,6,7', 1069, 0, 3, '1 5 2 1 2', '');
INSERT INTO `tblscitype` VALUES (460, 'Sumatra', 'Sum', 1, 5, 'b2,3,6,7', 1157, 0, 3, '1 3 5 2', '');
INSERT INTO `tblscitype` VALUES (461, 'Andaman', 'And', 1, 6, 'b2,b3,3,6,7', 1413, 0, 3, '1 2 1 5 2', '');
INSERT INTO `tblscitype` VALUES (462, 'Timor', 'Tim', 1, 5, 'b2,b5,5,7', 1073, 0, 3, '1 5 1 4', '');
INSERT INTO `tblscitype` VALUES (463, 'Lombok', 'Lom', 1, 6, 'b2,b5,5,6,7', 1077, 0, 3, '1 5 1 2 2', '');
INSERT INTO `tblscitype` VALUES (464, 'Borneo', 'Borneo', 1, 6, 'b2,b3,b6,6,7', 1293, 0, 3, '1 2 5 1 2', '');
INSERT INTO `tblscitype` VALUES (465, 'Putri', 'Put', 1, 5, 'b2,3,b5,7', 1185, 0, 3, '1 3 2 5', '');
INSERT INTO `tblscitype` VALUES (466, 'Halmahera', 'Hal', 1, 5, 'b2,b3,b5,7', 1313, 0, 3, '1 2 3 5', '');
INSERT INTO `tblscitype` VALUES (467, 'Galangal', 'Gal', 1, 6, 'b2,b3,4,b5,7', 1377, 0, 3, '1 2 2 1 5', '');
INSERT INTO `tblscitype` VALUES (468, 'Luzon', 'Luz', 1, 6, 'b2,b3,3,b5,7', 1441, 0, 3, '1 2 1 2 5', '');
INSERT INTO `tblscitype` VALUES (469, 'Palawan', 'Pal', 1, 5, 'b2,4,6,7', 1093, 0, 3, '1 4 4 2', '');
INSERT INTO `tblscitype` VALUES (470, 'Samar', 'Sam', 1, 5, 'b2,b3,5,7', 1297, 0, 3, '1 2 4 4', '');
INSERT INTO `tblscitype` VALUES (471, 'Bora Bora', 'Bora', 1, 5, 'b2,4,b6,7', 1097, 0, 3, '1 4 3 3', '');
INSERT INTO `tblscitype` VALUES (472, 'Nicobar', 'Nic', 1, 6, 'b2,b3,3,b6,7', 1417, 0, 3, '1 2 1 4 3', '');
INSERT INTO `tblscitype` VALUES (473, 'Skyros', 'Sky', 1, 6, 'b2,4,b6,6,7', 1101, 0, 3, '1 4 3 1 2', '');
INSERT INTO `tblscitype` VALUES (474, 'Paxos', 'Pax', 1, 7, 'b2,b3,3,b6,6,7', 1421, 0, 3, '1 2 1 4 1 2', '');
INSERT INTO `tblscitype` VALUES (475, 'Leros', 'Ler', 1, 5, 'b2,3,5,7', 1169, 0, 3, '1 3 3 4', '');
INSERT INTO `tblscitype` VALUES (476, 'Gomera', 'Gom', 1, 6, 'b2,b3,3,5,7', 1425, 0, 3, '1 2 1 3 4', '');
INSERT INTO `tblscitype` VALUES (477, 'Baltra', 'Baltra', 1, 7, 'b2,b3,3,b5,5,7', 1457, 0, 3, '1 2 1 2 1 4', '');
INSERT INTO `tblscitype` VALUES (478, 'Guguan', 'Gug', 1, 6, 'b2,3,5,6,7', 1173, 0, 3, '1 3 3 2 2', '');
INSERT INTO `tblscitype` VALUES (479, 'Guam', 'Guam', 1, 6, 'b2,b3,b5,6,7', 1317, 0, 3, '1 2 3 3 2', '');
INSERT INTO `tblscitype` VALUES (480, 'Tobago', 'Tob', 1, 6, 'b2,b3,4,b6,7', 1353, 0, 3, '1 2 2 3 3', '');
INSERT INTO `tblscitype` VALUES (481, 'Suchness', 'Such', 1, 6, 'b2,3,b5,b6,7', 1193, 0, 3, '1 3 2 2 3', '');
INSERT INTO `tblscitype` VALUES (482, 'Huahine', 'Hua', 1, 7, 'b2,b3,3,5,6,7', 1429, 0, 3, '1 2 1 3 2 2', '');
INSERT INTO `tblscitype` VALUES (483, 'Sulawesi', 'Sul', 1, 7, 'b2,b3,b5,b6,6,7', 1325, 0, 3, '1 2 3 2 1 2', '');
INSERT INTO `tblscitype` VALUES (484, 'Siberut', 'Sib', 1, 7, 'b2,b3,3,b5,6,7', 1445, 0, 3, '1 2 1 2 3 2', '');
INSERT INTO `tblscitype` VALUES (485, 'Niihau', 'Nii', 1, 5, 'b2,b5,6,7', 1061, 0, 3, '1 5 3 2', '');
INSERT INTO `tblscitype` VALUES (486, 'Makira', 'Mak', 1, 5, 'b2,b3,b6,7', 1289, 0, 3, '1 2 5 3', '');
INSERT INTO `tblscitype` VALUES (487, 'Hydrogen', 'H', 1, 5, 'b2,b3,4,7', 1345, 0, 3, '1 2 2 6', '');
INSERT INTO `tblscitype` VALUES (488, 'Helium', 'He', 1, 5, '2,b3,3,4', 960, 0, 4, '2 1 1 1', '');
INSERT INTO `tblscitype` VALUES (489, 'Lithium', 'Lith', 1, 5, 'b2,2,4,7', 1601, 0, 4, '1 1 3 6', '');
INSERT INTO `tblscitype` VALUES (490, 'Beryllium', 'Ber', 1, 5, 'b2,2,5,7', 1553, 0, 4, '1 1 5 4', '');
INSERT INTO `tblscitype` VALUES (491, 'Boron', 'Bor', 1, 5, 'b2,2,b5,7', 1569, 0, 4, '1 1 4 5', '');
INSERT INTO `tblscitype` VALUES (492, 'Californium', 'Cf', 1, 6, 'b2,2,b3,3,7', 1921, 0, 6, '1 1 1 1 7', '');
INSERT INTO `tblscitype` VALUES (493, 'Nitrogen', 'Nit', 1, 6, 'b2,2,b3,6,7', 1797, 0, 5, '1 1 1 6 2', '');
INSERT INTO `tblscitype` VALUES (494, 'Oxygen', 'Oxy', 1, 6, 'b2,2,b6,6,7', 1549, 0, 4, '1 1 6 1 2', '');
INSERT INTO `tblscitype` VALUES (495, 'Einsteinium', 'Es', 1, 6, 'b2,b3,3,4,7', 1473, 0, 3, '1 2 1 1 6', '');
INSERT INTO `tblscitype` VALUES (496, 'Neon', 'Ne', 1, 6, 'b2,2,3,4,7', 1729, 0, 4, '1 1 2 1 6', '');
INSERT INTO `tblscitype` VALUES (497, 'Sodium', 'NA', 1, 6, 'b2,2,3,b7,7', 1667, 0, 5, '1 1 2 6 1', '');
INSERT INTO `tblscitype` VALUES (498, 'Magnesium', 'Mg', 1, 6, 'b2,2,5,b7,7', 1555, 0, 5, '1 1 5 3 1', '');
INSERT INTO `tblscitype` VALUES (499, 'Aluminum', 'Al', 1, 6, 'b2,2,3,6,7', 1669, 0, 4, '1 1 2 5 2', '');
INSERT INTO `tblscitype` VALUES (500, 'Silicon', 'Sil', 1, 6, 'b2,2,5,b6,7', 1561, 0, 4, '1 1 5 1 3', '');
INSERT INTO `tblscitype` VALUES (501, 'Phosphorus', 'Pho', 1, 6, 'b2,2,4,b5,7', 1633, 0, 4, '1 1 3 1 5', '');
INSERT INTO `tblscitype` VALUES (502, 'Sulfur', 'S', 1, 6, 'b2,2,3,b5,7', 1697, 0, 4, '1 1 2 2 5', '');
INSERT INTO `tblscitype` VALUES (503, 'Chlorine', 'Cl', 1, 6, 'b2,2,4,b7,7', 1603, 0, 5, '1 1 3 5 1', '');
INSERT INTO `tblscitype` VALUES (504, 'Manganese', 'Mn', 1, 6, 'b2,2,b3,5,7', 1809, 0, 5, '1 1 1 4 4', '');
INSERT INTO `tblscitype` VALUES (505, 'Cobalt', 'Co', 1, 6, 'b2,2,b5,6,7', 1573, 0, 4, '1 1 4 3 2', '');
INSERT INTO `tblscitype` VALUES (506, 'Nickel', 'Ni', 1, 6, 'b2,2,3,b6,7', 1673, 0, 4, '1 1 2 4 3', '');
INSERT INTO `tblscitype` VALUES (507, 'Copper', 'Cu', 1, 6, 'b2,2,4,6,7', 1605, 0, 4, '1 1 3 4 2', '');
INSERT INTO `tblscitype` VALUES (508, 'Argon', 'Ar', 1, 6, 'b2,2,4,b6,7', 1609, 0, 4, '1 1 3 3 3', '');
INSERT INTO `tblscitype` VALUES (509, 'Potassium', 'K', 1, 6, 'b2,2,3,5,7', 1681, 0, 4, '1 1 2 3 4', '');
INSERT INTO `tblscitype` VALUES (510, 'Calcium', 'Ca', 1, 6, 'b2,2,b5,b6,7', 1577, 0, 4, '1 1 4 2 3', '');
INSERT INTO `tblscitype` VALUES (511, 'Scandium', 'Sc', 1, 6, 'b2,2,3,b6,b7', 1674, 0, 3, '1 1 2 4 2', '');
INSERT INTO `tblscitype` VALUES (512, 'Titanium', 'Ti', 1, 6, 'b2,2,b5,5,7', 1585, 0, 4, '1 1 4 1 4', '');
INSERT INTO `tblscitype` VALUES (513, 'Vanadium', 'V', 1, 6, 'b2,2,4,5,7', 1617, 0, 4, '1 1 3 2 4', '');
INSERT INTO `tblscitype` VALUES (514, 'Chromium', 'Cr', 1, 7, 'b2,2,b3,3,4,7', 1985, 0, 7, '1 1 1 1 1 6', '');
INSERT INTO `tblscitype` VALUES (515, 'Zinc', 'Zn', 1, 7, 'b2,2,b3,3,6,7', 1925, 0, 6, '1 1 1 1 5 2', '');
INSERT INTO `tblscitype` VALUES (516, 'Gallium', 'Ga', 1, 7, 'b2,2,b3,b6,6,7', 1805, 0, 5, '1 1 1 5 1 2', '');
INSERT INTO `tblscitype` VALUES (517, 'Germanium', 'Ge', 1, 7, 'b2,2,5,b6,6,7', 1565, 0, 4, '1 1 5 1 1 2', '');
INSERT INTO `tblscitype` VALUES (518, 'Arsenic', 'As', 1, 7, 'b2,2,3,4,b5,7', 1761, 0, 4, '1 1 2 1 1 5', '');
INSERT INTO `tblscitype` VALUES (519, 'Selenium', 'Se', 1, 7, 'b2,2,b3,4,b5,7', 1889, 0, 5, '1 1 1 2 1 5', '');
INSERT INTO `tblscitype` VALUES (520, 'Bromine', 'Br', 1, 7, 'b2,2,b3,3,b5,7', 1953, 0, 6, '1 1 1 1 2 5', '');
INSERT INTO `tblscitype` VALUES (521, 'Krypton', 'Kr', 1, 7, 'b2,2,b3,3,b6,7', 1929, 0, 6, '1 1 1 1 4 3', '');
INSERT INTO `tblscitype` VALUES (522, 'Rubidium', 'Rb', 1, 7, 'b2,2,b3,5,6,7', 1813, 0, 5, '1 1 1 4 2 2', '');
INSERT INTO `tblscitype` VALUES (523, 'Strontium', 'Sr', 1, 7, 'b2,2,b5,b6,6,7', 1581, 0, 4, '1 1 4 2 1 2', '');
INSERT INTO `tblscitype` VALUES (524, 'Yttrium', 'Y', 1, 7, 'b2,4,5,b6,6,7', 1117, 0, 3, '1 4 2 1 1 2', '');
INSERT INTO `tblscitype` VALUES (525, 'Zirconium', 'Zr', 1, 7, 'b2,2,3,4,6,7', 1733, 0, 4, '1 1 2 1 4 2', '');
INSERT INTO `tblscitype` VALUES (526, 'Niobium', 'Nb', 1, 7, 'b2,2,b3,4,6,7', 1861, 0, 5, '1 1 1 2 4 2', '');
INSERT INTO `tblscitype` VALUES (527, 'Molybdenum', 'Mo', 1, 7, 'b2,2,3,b6,6,7', 1677, 0, 4, '1 1 2 4 1 2', '');
INSERT INTO `tblscitype` VALUES (528, 'Technetium', 'Tc', 1, 7, 'b2,b3,5,b6,6,7', 1309, 0, 3, '1 2 4 1 1 2', '');
INSERT INTO `tblscitype` VALUES (529, 'Ruthenium', 'Ru', 1, 7, 'b2,2,3,4,5,7', 1745, 0, 4, '1 1 2 1 2 4', '');
INSERT INTO `tblscitype` VALUES (530, 'Rhodium', 'Rh', 1, 7, 'b2,2,b3,b5,5,7', 1841, 0, 5, '1 1 1 3 1 4', '');
INSERT INTO `tblscitype` VALUES (531, 'Palladium', 'Pd', 1, 7, 'b2,2,b3,4,5,7', 1873, 0, 5, '1 1 1 2 2 4', '');
INSERT INTO `tblscitype` VALUES (532, 'Silver', 'Ag', 1, 7, 'b2,2,b3,3,5,7', 1937, 0, 6, '1 1 1 1 3 4', '');
INSERT INTO `tblscitype` VALUES (533, 'Cadmium', 'Cd', 1, 7, 'b2,2,b3,b5,6,7', 1829, 0, 5, '1 1 1 3 3 2', '');
INSERT INTO `tblscitype` VALUES (534, 'Indium', 'In', 1, 7, 'b2,2,3,4,b6,7', 1737, 0, 4, '1 1 2 1 3 3', '');
INSERT INTO `tblscitype` VALUES (535, 'Tin', 'Sn', 1, 7, 'b2,2,b3,4,b6,7', 1865, 0, 5, '1 1 1 2 3 3', '');
INSERT INTO `tblscitype` VALUES (536, 'Antimony', 'Sb', 1, 7, 'b2,2,3,b5,6,7', 1701, 0, 4, '1 1 2 2 3 2', '');
INSERT INTO `tblscitype` VALUES (537, 'Tellurium', 'Te', 1, 8, 'b2,2,b3,3,4,b5,7', 2017, 0, 8, '1 1 1 1 1 1 5', '');
INSERT INTO `tblscitype` VALUES (538, 'Iodine', 'I', 1, 8, 'b2,2,b3,3,4,6,7', 1989, 0, 7, '1 1 1 1 1 4 2', '');
INSERT INTO `tblscitype` VALUES (539, 'Xenon', 'Xe', 1, 8, 'b2,2,b3,3,b6,6,7', 1933, 0, 6, '1 1 1 1 4 1 2', '');
INSERT INTO `tblscitype` VALUES (540, 'Cesium', 'Cs', 1, 8, 'b2,b3,3,4,b5,5,7', 1521, 0, 5, '1 2 1 1 1 1 4', '');
INSERT INTO `tblscitype` VALUES (541, 'Barium', 'Ba', 1, 8, 'b2,2,3,4,b5,5,7', 1777, 0, 4, '1 1 2 1 1 1 4', '');
INSERT INTO `tblscitype` VALUES (542, 'Lanthanum', 'La', 1, 8, 'b2,2,b3,4,b5,5,7', 1905, 0, 5, '1 1 1 2 1 1 4', '');
INSERT INTO `tblscitype` VALUES (543, 'Cerium', 'Ce', 1, 8, 'b2,2,b3,3,b5,5,7', 1969, 0, 6, '1 1 1 1 2 1 4', '');
INSERT INTO `tblscitype` VALUES (544, 'Praseodymium', 'Pr', 1, 8, 'b2,2,b3,3,4,5,7', 2001, 0, 7, '1 1 1 1 1 2 4', '');
INSERT INTO `tblscitype` VALUES (545, 'Neodymium', 'Nd', 1, 8, 'b2,2,b3,3,4,b6,7', 1993, 0, 7, '1 1 1 1 1 3 3', '');
INSERT INTO `tblscitype` VALUES (546, 'Prometheum', 'Pm', 1, 8, 'b2,2,b3,3,5,6,7', 1941, 0, 6, '1 1 1 1 3 2 2', '');
INSERT INTO `tblscitype` VALUES (547, 'Samarium', 'Sm', 1, 8, 'b2,2,b3,b5,b6,6,7', 1837, 0, 5, '1 1 1 3 2 1 2', '');
INSERT INTO `tblscitype` VALUES (548, 'Europium', 'Eu', 1, 8, 'b2,2,4,5,b6,6,7', 1629, 0, 4, '1 1 3 2 1 1 2', '');
INSERT INTO `tblscitype` VALUES (549, 'Gadolineum', 'Gd', 1, 8, 'b2,3,b5,5,b6,6,7', 1213, 0, 4, '1 3 2 1 1 1 2', '');
INSERT INTO `tblscitype` VALUES (550, 'Terbium', 'Tb', 1, 8, 'b2,2,b3,4,b5,6,7', 1893, 0, 5, '1 1 1 2 1 3 2', '');
INSERT INTO `tblscitype` VALUES (551, 'Dysprosium', 'Dy', 1, 8, 'b2,2,b3,3,b5,6,7', 1957, 0, 6, '1 1 1 1 2 3 2', '');
INSERT INTO `tblscitype` VALUES (552, 'Holmium', 'Ho', 1, 8, 'b2,2,b3,3,5,b6,7', 1945, 0, 6, '1 1 1 1 3 1 3', '');
INSERT INTO `tblscitype` VALUES (553, 'Erbium', 'Er', 1, 8, 'b2,2,b3,b5,5,6,7', 1845, 0, 5, '1 1 1 3 1 2 2', '');
INSERT INTO `tblscitype` VALUES (554, 'Thulium', 'Tm', 1, 8, 'b2,2,3,4,b6,6,7', 1741, 0, 4, '1 1 2 1 3 1 2', '');
INSERT INTO `tblscitype` VALUES (555, 'Ytterbium', 'Yb', 1, 8, 'b2,2,b3,4,b6,6,7', 1869, 0, 5, '1 1 1 2 3 1 2', '');
INSERT INTO `tblscitype` VALUES (556, 'Lutetium', 'Lu', 1, 8, 'b2,b3,3,b5,5,b6,7', 1465, 0, 3, '1 2 1 2 1 1 3', '');
INSERT INTO `tblscitype` VALUES (557, 'Halfnium', 'Hf', 1, 8, 'b2,b3,3,4,5,b6,7', 1497, 0, 3, '1 2 1 1 2 1 3', '');
INSERT INTO `tblscitype` VALUES (558, 'Tantalum', 'Ta', 1, 8, 'b2,2,3,4,5,b6,7', 1753, 0, 4, '1 1 2 1 2 1 3', '');
INSERT INTO `tblscitype` VALUES (559, 'Tungsten', 'W', 1, 8, 'b2,b3,b5,5,b6,6,7', 1341, 0, 4, '1 2 3 1 1 1 2', '');
INSERT INTO `tblscitype` VALUES (560, 'Rhenium', 'Re', 1, 8, 'b2,2,b3,4,b5,b6,7', 1897, 0, 5, '1 1 1 2 1 2 3', '');
INSERT INTO `tblscitype` VALUES (561, 'Osmium', 'Os', 1, 8, 'b2,2,b3,3,b5,b6,7', 1961, 0, 6, '1 1 1 1 2 2 3', '');
INSERT INTO `tblscitype` VALUES (562, 'Iridium', 'Ir', 1, 8, 'b2,2,b3,4,5,6,7', 1877, 0, 5, '1 1 1 2 2 2 2', '');
INSERT INTO `tblscitype` VALUES (563, 'Platinum', 'Pt', 1, 8, 'b2,b3,3,4,5,6,7', 1493, 0, 3, '1 2 1 1 2 2 2', '');
INSERT INTO `tblscitype` VALUES (564, 'Gold', 'Au', 1, 8, 'b2,b3,4,b5,b6,6,7', 1389, 0, 3, '1 2 2 1 2 1 2', '');
INSERT INTO `tblscitype` VALUES (565, 'Mercury', 'Hg', 1, 9, 'b2,2,b3,3,4,b5,5,7', 2033, 0, 9, '1 1 1 1 1 1 1 4', '');
INSERT INTO `tblscitype` VALUES (566, 'Thalium', 'Tl', 1, 9, 'b2,2,b3,3,4,b5,6,7', 2021, 0, 8, '1 1 1 1 1 1 3 2', '');
INSERT INTO `tblscitype` VALUES (567, 'Lead', 'Pb', 1, 9, 'b2,2,b3,3,4,b6,6,7', 1997, 0, 7, '1 1 1 1 1 3 1 2', '');
INSERT INTO `tblscitype` VALUES (568, 'Bismuth', 'Bi', 1, 9, 'b2,b3,3,4,b5,5,b6,7', 1529, 0, 6, '1 2 1 1 1 1 1 3', '');
INSERT INTO `tblscitype` VALUES (569, 'Polonium', 'Po', 1, 9, 'b2,2,3,4,b5,5,b6,7', 1785, 0, 5, '1 1 2 1 1 1 1 3', '');
INSERT INTO `tblscitype` VALUES (570, 'Astatine', 'At', 1, 9, 'b2,2,b3,3,b5,5,b6,7', 1977, 0, 6, '1 1 1 1 2 1 1 3', '');
INSERT INTO `tblscitype` VALUES (571, 'Radon', 'Rn', 1, 9, 'b2,2,b3,3,4,5,b6,7', 2009, 0, 7, '1 1 1 1 1 2 1 3', '');
INSERT INTO `tblscitype` VALUES (572, 'Francium', 'Fr', 1, 9, 'b2,2,b3,3,4,b5,b6,7', 2025, 0, 8, '1 1 1 1 1 1 2 3', '');
INSERT INTO `tblscitype` VALUES (573, 'Radium', 'Ra', 1, 9, 'b2,2,b3,3,4,5,6,7', 2005, 0, 7, '1 1 1 1 1 2 2 2', '');
INSERT INTO `tblscitype` VALUES (574, 'Actinium', 'Ac', 1, 9, 'b2,b3,3,4,b5,5,b6,b7', 1530, 0, 6, '1 2 1 1 1 1 1 2', '');
INSERT INTO `tblscitype` VALUES (575, 'Thorium', 'Th', 1, 9, 'b2,b3,3,4,b5,5,6,7', 1525, 0, 5, '1 2 1 1 1 1 2 2', '');
INSERT INTO `tblscitype` VALUES (576, 'Protactinium', 'Pa', 1, 10, 'b2,2,b3,3,4,b5,5,b6,7', 2041, 0, 10, '1 1 1 1 1 1 1 1 3', '');
INSERT INTO `tblscitype` VALUES (577, 'Uranium', 'U', 1, 10, 'b2,2,b3,3,4,b5,5,6,7', 2037, 0, 9, '1 1 1 1 1 1 1 2 2', '');
INSERT INTO `tblscitype` VALUES (578, 'Neptunium', 'Np', 1, 10, 'b2,b3,3,4,b5,5,b6,6,b7', 1534, 0, 8, '1 2 1 1 1 1 1 1 1', '');
INSERT INTO `tblscitype` VALUES (579, 'Berkelium', 'Bk', 1, 11, 'b2,2,b3,3,4,b5,5,b6,6,7', 2045, 0, 11, '1 1 1 1 1 1 1 1 1 2', '');
INSERT INTO `tblscitype` VALUES (580, 'Perfect Union', 'PU', 1, 1, '', 0, 0, 1, '', '');
INSERT INTO `tblscitype` VALUES (581, 'Minor-Third Tetracluster', '-3Tet', 0, 4, 'b3,3,4', 448, 0, 3, '', '');
*/