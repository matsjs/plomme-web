
let WIDTH = 500;
let HEIGHT = 500;
let TILESIZE = 1;
let SCALE = 0.005;
let DISTORTION = 0.100;

function setup() {
  // noiseSeed(0);
  createCanvas(WIDTH, HEIGHT);
  OSnoise = new OpenSimplexNoise(Date.now());
  pixelDensity(1);
  noiseDetail(8, 0.5);
  paintPixels(WIDTH, HEIGHT, 1, 1);
}

function createMap(valueFunction) {
  let mapMatrix = [];
  for (let y = 0; y < HEIGHT; y++) {
    let row = [];
    for (let x = 0; x < WIDTH; x++) {
      row.push(valueFunction(y,x))
    }
    mapMatrix.push(row);
  }
  return mapMatrix;
}

function colorByHeight(value) {
  if (value < 0.5) {
    return color('#058ED9')
  } else if (value < 0.52) {
    return color('#F6FEDB')
  } else if (value < 0.8) {
    return color('#709255')
  } else {
    return color('#6B5E62')
  }
}

function paintPixels(width, height, pos, resolution) {
  loadPixels();
  let firstLayer;
  let secondLayer;
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      const base = (x + y*height) * 4;
      if (base % resolution === 0){
        firstLayer = noise(x*SCALE,y*SCALE);
        secondLayer = noise(firstLayer*DISTORTION, pos*SCALE);
      }

      const {levels} = colorByHeight((firstLayer*0.75 + secondLayer*0.25))
      // const {levels} = colorByHeight(firstLayer)

      pixels[base] = levels[0];   // R
      pixels[base+1] = levels[1]; // G
      pixels[base+2] = levels[2]; // B
      pixels[base+3] = levels[3]; // A
    }
  }
  updatePixels();
}



function draw() {
}
