const xSize = 500;
const ySize = 500;
const threshold = 0.3;
const scale = 0.01;
const speed = 0.02;
// let OSNoise;

function setup() {
  // put setup code here
  createCanvas(xSize, ySize);
  // frameRate(1);
  pixelDensity(1);
  frameRate(60);
  OSNoise = new OpenSimplexNoise(Date.now());
  loadPixels();
  rorschach(xSize, ySize);
  updatePixels();
}

/**
 * Converts an HSL color value to RGB. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes h, s, and l are contained in the set [0, 1] and
 * returns r, g, and b in the set [0, 255].
 *
 * @param   {number}  h       The hue
 * @param   {number}  s       The saturation
 * @param   {number}  l       The lightness
 * @return  {Array}           The RGB representation
 */
function hslToRgb(h, s, l) {
  var r, g, b;

  if (s == 0) {
    r = g = b = l; // achromatic
  } else {
    var hue2rgb = function hue2rgb(p, q, t) {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    var p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

function rorschach(width, height) {
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      const base = (x + y * height) * 4;
      // black = noise(x*scale, y*scale, pos*scale) > threshold ? 255 : 0; //Threshold
      // if (base % resolution === 0){
      //   black = OSNoise.noise3D(x*scale,y*scale,pos*speed) > threshold ? 255 : 0;
      // }
      //
      const xGrad = Math.abs(
        OSNoise.noise2D((x - 1) * scale, y * scale) -
          OSNoise.noise2D((x + 1) * scale, y * scale)
      );
      const yGrad = Math.abs(
        OSNoise.noise2D(x * scale, (y - 1) * scale) -
          OSNoise.noise2D(x * scale, (y + 1) * scale)
      );
      const grad = 1 - (xGrad + yGrad) / 2;

      const col = hslToRgb(OSNoise.noise2D(x * scale, y * scale), 1, grad);

      pixels[base] = col[0]; // R
      pixels[base + 1] = col[1]; // G
      pixels[base + 2] = col[2]; // B
      pixels[base + 3] = 255; //col.levels[3];
    }
  }
}

let frameNum = 0;

function draw() {
  // fill(color(hslToRgb(frameNum%360/360, 1, 0.5)))
  // rect(0, 0, xSize,ySize)
  frameNum++;
}
