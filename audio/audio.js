console.log('success');

var context;
window.addEventListener('load', init, false);
function init() {
//  try {
    // Fix up for prefixing
    window.AudioContext = window.AudioContext||window.webkitAudioContext;



    var c = new AudioContext;
    var context = new AudioContext;




oscillator1 = context.createOscillator(); // Create sound source 1
oscillator2 = context.createOscillator(); // Create sound source 2
gainNode2 = context.createGainNode(); // Create gain node 2
 
oscillator1.type = 0; // Sine wave
oscillator1.frequency.value = 200; // Default frequency in hertz 
oscillator1.frequency.setValueAtTime(880, c.currentTime);
oscillator1.connect(context.destination); // Connect sound source 1 to output
//oscillator1.noteOn(1); // Play sound source 1 instantly 
    

//oscillator2.type = 1; // Square wave
//oscillator2.frequency.value = 100; // Frequency in hertz 
//oscillator2.connect(gainNode2); // Connect sound source 2 to gain node 2
//gainNode2.connect(context.destination); // Connect gain node 2 to output
//gainNode2.gain.value = 0.3; // Set gain node 2 to 30 percent
//oscillator2.noteOn(2); // Play sound source 2 after two seconds

//    return;

    var o = c.createOscillator();
    var o2 = c.createOscillator();
    o.connect(c.destination);
    o.type = o.SINE;
    o2.connect(c.destination);
    o.type = o.SINE;
    o.frequency.value = 440;

    o.frequency.value = 440;
    o.frequency.setValueAtTime(440, c.currentTime);

//    o.frequency.setValueCurveAtTime(new Float32Array([440, 500, 560, 700, 880]), c.currentTime, c.currentTime + 4);

    var duration = 4;
    var cycles = 80;
    highF = 880 / 2;
    lowF = 440 / 4;

    o.frequency.setValueAtTime(lowF, c.currentTime);

    for (var i = 0; i < cycles /2; i+=2) {
	o.frequency.exponentialRampToValueAtTime(highF + i*4, c.currentTime + (i + .5)  / cycles * duration);
	o.frequency.exponentialRampToValueAtTime(lowF + i*4, c.currentTime + (i + 1) / cycles * duration);      
	o.frequency.exponentialRampToValueAtTime(highF *2  + i*4, c.currentTime + (i + 1.5)  / cycles * duration);
	o.frequency.exponentialRampToValueAtTime(lowF * 2 + i*4, c.currentTime + (i + 2) / cycles * duration);      
    }
    j = cycles /2;
    for (var i = cycles/2; i < cycles; i+=2) {
	o.frequency.exponentialRampToValueAtTime(highF + j*4, c.currentTime + (i + .5)  / cycles * duration);
	o.frequency.exponentialRampToValueAtTime(lowF + j*4, c.currentTime + (i + 1) / cycles * duration);      
	o.frequency.exponentialRampToValueAtTime(highF *2  + j*4, c.currentTime + (i + 1.5)  / cycles * duration);
	o.frequency.exponentialRampToValueAtTime(lowF * 2 + j*4, c.currentTime + (i + 2) / cycles * duration);      
	j -= 2;

    }

/* 
    o.frequency.exponentialRampToValueAtTime(880, c.currentTime + 0.5);
    o.frequency.exponentialRampToValueAtTime(440, c.currentTime + 1);   
    o.frequency.exponentialRampToValueAtTime(880, c.currentTime + 1.5);
    o.frequency.exponentialRampToValueAtTime(440, c.currentTime + 2);
    o.frequency.exponentialRampToValueAtTime(880, c.currentTime + 2.5);
    o.frequency.exponentialRampToValueAtTime(440, c.currentTime + 3);
    o.frequency.exponentialRampToValueAtTime(880, c.currentTime + 3.5);
    o.frequency.exponentialRampToValueAtTime(440, c.currentTime + 4);
*/
    o.start(c.currentTime);
    o.stop(c.currentTime + 4);
//    o2.start(c.currentTime + 2);
//    o2.stop(c.currentTime + 4);

    return;



var d = c.createDelayNode();
var df = c.createBiquadFilter();
var dg = c.createGainNode();
var dgo = c.createGainNode();


d.delayTime.value = 0.35;
d.connect(df);
d.connect(dgo);
df.connect(dg);
dg.connect(d);
dgo.connect(c.destination);
df.type = df.HIGHPASS;
df.frequency.value = 500;
df.Q = 2;

dg.gain.value = 0.6;
dgo.gain.value = 0.6;


var i = 0;

    var o = c.createOscillator();
    var g = c.createGainNode();
    var f = c.createBiquadFilter();

    var highF = 880.0 * Math.pow(2, i+1);
    var lowF = highF / 2;

    g.connect(d);
    g.connect(c.destination);
    o.connect(f);
    f.connect(g);
    o.type = o.SAWTOOTH;
    o.frequency.value = highF / 16;

    f.type = f.LOWPASS;

    f.frequency.setValueAtTime(lowF, c.currentTime);
    f.frequency.linearRampToValueAtTime(highF, c.currentTime + 0.1);
    f.frequency.setValueAtTime(highF, c.currentTime + 0.40);
    f.frequency.linearRampToValueAtTime(lowF, c.currentTime + 0.5);
    f.Q.value = 10;

    g.gain.setValueAtTime(0.0, c.currentTime);
    g.gain.linearRampToValueAtTime(0.2, c.currentTime + 0.05);
    g.gain.setValueAtTime(0.2, c.currentTime + 0.45);
    g.gain.linearRampToValueAtTime(0.0, c.currentTime + 0.5);
    o.noteOn(0);
    o.noteOff(c.currentTime + 0.5);
    i = (i + 1) % 5;



 // }
  //catch(e) {
  //  alert('Web Audio API is not supported in this browser');
 // }
}