// Try to read a range out of the URL. This is helpful for testing.
function getParameterByName(name) {
  name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
  var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
      results = regex.exec(location.search);
  return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}
var pos = getParameterByName('pos');

if (pos) {
  var m = /(.*):([0-9,]+)-([0-9,]+)/.exec(pos);
  if (!m) { throw 'Invalid range: ' + pos; }
  var makeNum = function(x) { return Number(x.replace(/,/g, '')); };
  range = {contig: m[1], start: makeNum(m[2]), stop: makeNum(m[3])};
} else {
  // use default range from, e.g. data.js
}

// this adds the feature that if you add a url parameter colorByStrand
// and set it to some value (looks like pretty much any value
// counts as true at this point), this causes the gene "strands"
// displayed to be colored red and blue; I'm not sure what it signifies;
// update this if you figure it out
var colorByStrand = getParameterByName('colorByStrand');
if (colorByStrand) {
  sources.forEach(source => {
    if (source.viz.options) {
      source.viz.options.colorByStrand = true;
    }
  });
}

// here a pileup element is created and added to the document in the
// #pileup div; see /src/main/pileup.js for more information
var p = pileup.create(document.getElementById('pileup'), { //'pileup' object is elOrId
  range: range,
  tracks: sources
});

// it looks like the rest of this file is this "jiggling" stuff
// which basically just does some simple test for the FPS
// with which the website is rendering; it does this by
// "jiggling" the genome displayed.
// not relevant beyond testing
function jiggle() {
  var r = p.getRange();
  if (r.start % 10 == 0) {
    r.start -= 9;
    r.stop -= 9;
  } else {
    r.start += 1;
    r.stop += 1;
  }

  p.setRange(r);
}

var isJiggling = false;
document.getElementById('jiggle').onclick = function() {
  if (isJiggling) {
    isJiggling = false;
    this.innerHTML = 'FPS test';
    return;
  }

  var repeatedlyJiggle = function() {
    jiggle();
    if (isJiggling) {
      window.requestAnimationFrame(repeatedlyJiggle);
    }
  };

  isJiggling = true;
  this.innerHTML = 'Stop!';
  repeatedlyJiggle();
};

// Measure the frame rate. Chrome devtools can do this, but having the devtools
// open has a dramatic effect on frame rates.
var stats = new Stats();
stats.setMode(0); // 0: fps, 1: ms
document.body.appendChild(stats.domElement);

var update = function() {
  stats.end();
  stats.begin();
  requestAnimationFrame(update);
};
stats.begin();
requestAnimationFrame(update);
