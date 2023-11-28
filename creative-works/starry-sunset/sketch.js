// const HEIGHT = 750;
// const WIDTH = 675;
const FPS = 30;
let HEIGHT;
let WIDTH;

class Star {
  constructor(size, x, y, color, noiseVal) {
    this.size = size;
    this.pos = createVector(x, y);
    this.color = color;
    this.noiseVal = noiseVal;
  }

  twinkle(x) {
    let a = (Math.sin(x) + 1.2) * 255;
    let r = red(this.color);
    let g = green(this.color);
    let b = blue(this.color);
    this.color = color(r, g, b, a);
    this.noiseVal += 0.1;
  }

  draw() {
    this.twinkle(this.noiseVal);
    stroke(this.color);
    strokeWeight(this.size);
    point(this.pos.x, this.pos.y);
  }
}

class ShootingStar {
  constructor() {
    this.arcStart = 3.2 + 0.8 * Math.random();
    this.dist = 1 + 1.5 * Math.random();
    this.posX = Math.random() * WIDTH;
    this.posY = Math.random() * HEIGHT;
    this.stop = this.arcStart;
    this.start = this.arcStart;
    this.shoot = true;
    this.inc = 0.5;
    this.w = 1500;
    this.h = 200;
    this.color = color(255, 255, 136, Math.random() * 255);
    this.active = true;
  }

  updatePosition = () => {
    if (this.stop < this.arcStart + this.dist) {
      this.stop += this.inc;
    } else if (this.start + 2 * this.inc <= this.stop) {
      this.start += this.inc;
    } else {
      // reset arc
      this.start = this.arcStart;
      this.stop = this.arcStart + 0.01;
      // new posisiton
      this.posX = Math.random() * WIDTH;
      this.posY = Math.random() * HEIGHT;
      // new color
      this.color = color(255, 255, 136, Math.random() * 255);

      this.active = false;
    }
    // this.strokeWeight -= 0.10;
  };

  draw = () => {
    const { posY, posX, w, h, start, stop } = this;
    stroke(this.color);
    strokeWeight(2);
    noFill();
    if (this.active) {
      this.updatePosition();
      arc(posY, posX, w, h, start, stop);
    } else {
      this.active = Math.random() * FPS * 10 < FPS;
    }
  };
}

function route(stars) {
  const numStars = Math.round(Math.random() * 3) + 3;
  let route = [];
  for (let index = 0; index < numStars; index++) {
    route.push(stars[Math.floor(Math.random() * stars.length)]);
  }
  let pos = Math.floor(Math.random() * stars.length);
  route.splice(pos, 0, route[Math.floor(Math.random() * route.length)]);
  return route;
}

let astersims = [];
function asterism(stars, n, alphaVal) {
  let starRoute;
  if (astersims[n]) {
    starRoute = astersims[n];
    for (let index = 0; index < starRoute.length - 1; index++) {
      let a = starRoute[index];
      let b = starRoute[index + 1];
      stroke(color(255, 255, 136, alphaVal));
      strokeWeight(1);
      line(a.pos.x, a.pos.y, b.pos.x, b.pos.y);
    }
  } else {
    starRoute = route(stars);
    astersims.push(starRoute);
  }
}

function createStars(n) {
  let stars = [
    [[], [], []],
    [[], [], []],
    [[], [], []],
  ];
  for (let index = 0; index < n; index++) {
    let xPos = Math.random() * WIDTH;
    let yPos = Math.random() * HEIGHT;
    stars[Math.floor((xPos * 3) / WIDTH)][Math.floor((yPos * 3) / HEIGHT)].push(
      new Star(
        Math.random() * 4,
        xPos,
        yPos,
        color(255, 255, 136, 255),
        // color(255,255,100,255),

        Math.random() * 100
      )
    );
  }
  return stars;
}

let galaxy;
let skyColor;
let twinkleCounter = 0;
let myFont;
let starshot;

function drawWords(input, tCount) {
  let alpha = 155 * noise(tCount) + 100;
  textSize(32);
  stroke(0);
  fill(color(255, 255, 136, alpha));
  textAlign(CENTER);
  text(input, WIDTH / 2, HEIGHT / 2);
}

function preload() {
  myFont = loadFont("assets/PlayfairDisplay-Regular.ttf");
}
function setup() {
  HEIGHT = windowHeight;
  WIDTH = windowWidth;
  // put setup code here
  var canvas = createCanvas(WIDTH, HEIGHT);
  canvas.parent("p5-canvas");
  skyColor = color(0, 12, 24);
  background(skyColor);
  textFont(myFont);
  galaxy = createStars(500);
  starshot = new ShootingStar();
  frameRate(FPS);
  // asterism(galaxy[Math.floor(Math.random()*3)][Math.floor(Math.random()*3)]);
}

let frameNo = 0;
// TODO randomize names for stjerntegn
function draw() {
  // put drawing code here
  background(skyColor);
  // Background
  // setGradient(0, 0, width, height, color(5,19,54,255), skyColor, 1);

  galaxy.map((columns) => {
    columns.map((rows) => {
      rows.map((star) => {
        star.draw();
      });
    });
  });
  twinkleCounter += 0.065;
  asterism(
    galaxy[Math.floor(Math.random() * 3)][Math.floor(Math.random() * 3)],
    round(frameNo / (FPS * 5)),
    255 * abs(2 * cos(Math.PI * (frameNo / (FPS * 5))))
  );
  drawWords("digitalt postkort", twinkleCounter);
  starshot.draw();

  if (frameNo === FPS * 50) {
    frameNo = 0;
  } else {
    frameNo += 1;
  }
}
