// const btn = document.querySelector('button'),
//   chunks = [];

// function record() {
//   chunks.length = 0;
//   let stream = document.querySelector('canvas').captureStream(30),
//     recorder = new MediaRecorder(stream);
//   recorder.ondataavailable = e => {
//     if (e.data.size) {
//       chunks.push(e.data);
//     }
//   };
//   recorder.onstop = exportVideo;
//   btn.onclick = e => {
//     recorder.stop();
//     btn.textContent = 'start recording';
//     btn.onclick = record;
//   };
//   recorder.start();
//   btn.textContent = 'stop recording';
// }

// function exportVideo(e) {
//   var blob = new Blob(chunks);
//   var vid = document.createElement('video');
//   vid.id = 'recorded'
//   vid.controls = true;
//   vid.src = URL.createObjectURL(blob);
//   document.body.appendChild(vid);
//   vid.play();
// }
// btn.onclick = record;

class Planet {
  constructor(mass, position, velocity) {
    this.mass = mass;
    this.radius = sqrt(mass) / 2;
    this.velocity = velocity;
    this.position = position;
  }

  updateSpeed(planets) {
    const reducer = (accumulator, currentValue) =>
      accumulator.add(currentValue);

    let forces = planets.map((planet) => {
      let distance = this.position.dist(planet.position);

      if (distance != 0) {
        let force = (this.mass * planet.mass) / (distance * 1000);
        let forceVector = p5.Vector.sub(planet.position, this.position);
        forceVector.normalize();
        forceVector.mult(force);
        return forceVector;
      } else {
        return createVector(0, 0);
      }
    });

    let totalForce = forces.reduce(reducer);
    let totalAcceleration = totalForce.div(this.mass);

    this.velocity.add(totalAcceleration);
  }

  updatePosition(planets) {
    this.updateSpeed(planets);
    this.position = p5.Vector.add(this.position, this.velocity);
  }

  draw(planets) {
    // fill('rgba(255,255,255, 0.1)');
    ellipse(this.position.x, this.position.y, this.radius);
    this.updatePosition(planets);
  }
}

let planets = [];
const cX = 500;
const cY = 500;

function setup() {
  // frameRate(10000)
  var canvas = createCanvas(cX, cY);
  canvas.parent("p5-canvas");
  background(0);
  // Moving planets
  planets = [
    new Planet(10000, createVector(40, cY - 60), createVector(0, 0)),
    new Planet(100, createVector(0, cY - 100), createVector(4, -2)),
    new Planet(1000, createVector(100, cY), createVector(4, -2)),
  ];

  // for (let index = 0; index < 20; index++) {
  //   planets.push(new Planet(Math.random()*1000, createVector(Math.random()*cX,Math.random()*cY),createVector(Math.random()*5-2.5,Math.random()*5-2.5)))
  // }

  // standstill planets
  // planets = [
  //   new Planet(10000, createVector(cX/2,cY/2), createVector(0,0)),
  //   new Planet(100, createVector(cX/2-200,cY/2-200), createVector(4,-2)),
  //   new Planet(1000, createVector(cX/2+150,cY/2+150), createVector(4,-2)),
  // ]

  tracking = planets[0];
}

function randomPlanets(n) {
  for (let index = 0; index < n; index++) {
    planets.push(
      new Planet(
        Math.random() * 1000,
        createVector(Math.random() * cY, Math.random() * cX),
        createVector(Math.random() * 10 - 5, Math.random() * 10 - 5)
      )
    );
  }
}

function trailPlot() {
  for (let index = 0; index < 2 * 10 ** 4; index++) {
    tracking.position = createVector(cX / 2, cY / 2);
    planets.map((planet) => {
      if (planet != tracking) {
        planet.updatePosition(planets);
        noStroke();
        fill("rgba(255,255,255, 0.09)");
        ellipse(planet.position.x, planet.position.y, planet.radius);
      }
    });
  }
}

function draw() {
  // tracking.position = createVector(cX/2,cY/2);
  planets.map((planet) => {
    planet.draw(planets);
  });
}
