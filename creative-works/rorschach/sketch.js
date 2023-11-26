const xSize = 500;
const ySize = 500;
const threshold = 0.3;
const scale = 0.0125;
const speed = 0.02
// let OSNoise;

function setup() {
  // put setup code here
  createCanvas(xSize, ySize);
  // frameRate(1);
  pixelDensity(1);
  frameRate(60)
  OSNoise = new OpenSimplexNoise(Date.now());
}

function rorschach (width, height, pos, resolution) {
  let black;
  for (let x = 0; x < Math.floor((width+2)/2); x++) {
    for (let y = 0; y < height; y++) {
      const base = (x + y*height) * 4;
      // black = noise(x*scale, y*scale, pos*scale) > threshold ? 255 : 0; //Threshold
      if (base % resolution === 0){
        black = OSNoise.noise3D(x*scale,y*scale,pos*speed) > threshold ? 255 : 0;
      }
      pixels[base] = 0;   // R
      pixels[base+1] = 0; // G
      pixels[base+2] = 0; // B
      pixels[base+3] = black; // A
      
    }    
  }
  
  for (let x = Math.floor(width/2); x < width; x++) {
    for (let y = 0; y < height; y++) {
      const base = ((x + y*height) * 4);
      const mirrorPixel = (((width-x) + y*height) * 4);
      pixels[base] = 0;   // R
      pixels[base+1] = 0; // G
      pixels[base+2] = 0; // B
      pixels[base+3] = pixels[mirrorPixel+3]
      
    }  
  }
}

let frameNum = 0;

function draw() {
  loadPixels();
  // 12 is surprisingly good
  rorschach(xSize, ySize, frameNum, 4)
  updatePixels();
  frameNum ++;
}