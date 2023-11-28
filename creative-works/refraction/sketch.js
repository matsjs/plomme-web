CANVAS_W = 400;
CANVAS_H = 400;
HEIGHT = 60;
// SCALE = 0.005; //used for noise()
SCALE = 0.01; //used for osn
TIMESCALE = 0.04;
INTENSITY = 0.04;
pos = 0;

function setup() {
  // put setup code here
  frameRate(30);
  pixelDensity(1);
  noise_func = new OpenSimplexNoise(Date.now());
  var canvas = createCanvas(CANVAS_W, CANVAS_H);
  canvas.parent("p5-canvas");
  background(0);
}

function radians_to_degrees(radians) {
  return radians * (180 / Math.PI);
}

function get_3x3(matrix, x, y) {
  return matrix.slice(x - 1, x + 2).map((array) => array.slice(y - 1, y + 2));
}

function plane_angle(three_by_three) {
  adjacent = 2;

  x_opposite = three_by_three[1][2] - three_by_three[1][0];
  x_hypotenuse = Math.sqrt(x_opposite ** 2 + adjacent ** 2);
  x_angle = radians_to_degrees(Math.asin(x_opposite / x_hypotenuse));

  y_opposite = three_by_three[2][1] - three_by_three[0][1];
  y_hypotenuse = Math.sqrt(y_opposite ** 2 + adjacent ** 2);
  y_angle = radians_to_degrees(Math.asin(y_opposite / y_hypotenuse));

  return createVector(x_angle, y_angle);
}

function new_position(x, y, plane_angle, offset) {
  return createVector(
    Math.round(x + plane_angle.x * offset),
    Math.round(y + plane_angle.y * offset)
  );
}

function create_displacement_map(pos) {
  displacement_map = [];
  for (let x = 0; x < CANVAS_W; x++) {
    displacement_map.push([]);
    for (let y = 0; y < CANVAS_H; y++) {
      displacement_map[x].push(
        noise_func.noise4D(x * SCALE, y * SCALE, 0, (pos + 1) * TIMESCALE)
      );
    }
  }
  return displacement_map;
}

function displace_uniform_light(displacement_map) {
  refraction_map = [];
  for (let x = 0; x < CANVAS_W; x++) {
    refraction_map.push([]);
    for (let y = 0; y < CANVAS_H; y++) {
      refraction_map[x].push(0);
    }
  }
  for (let x = 1; x < displacement_map.length - 1; x++) {
    for (let y = 1; y < displacement_map[0].length - 1; y++) {
      submatrix = get_3x3(displacement_map, x, y);
      angle_at_point = plane_angle(submatrix);
      const { x: new_x, y: new_y } = new_position(x, y, angle_at_point, HEIGHT);

      if (
        new_x >= 0 &&
        new_x <= CANVAS_W - 1 &&
        new_y >= 0 &&
        new_y <= CANVAS_H - 1
      ) {
        refraction_map[new_x][new_y] += INTENSITY;
      }
    }
  }
  return refraction_map;
}

function draw_map_dots(pos) {
  displacement = create_displacement_map(pos);
  refracted_map = displace_uniform_light(displacement);
  draw_pixel_map(refracted_map);
  // draw_point_map(refracted_map);
}

function draw_point_map(refracted_map) {
  for (let x = 0; x < refracted_map.length; x++) {
    for (let y = 0; y < refracted_map[0].length; y++) {
      stroke("white"); // Change the color
      strokeWeight(refracted_map[x][y]);
      point(x, y);
    }
  }
}

function draw_pixel_map(refracted_map) {
  loadPixels();
  for (let x = 0; x < refracted_map.length; x++) {
    for (let y = 0; y < refracted_map[0].length; y++) {
      const base = (x + y * height) * 4;
      const weight = refraction_map[x][y];
      pixels[base] = weight * 255; // R
      pixels[base + 1] = weight * 255; // G
      pixels[base + 2] = weight * 255; // B
      pixels[base + 3] = 255; // A
    }
  }
  updatePixels();
}

function draw() {
  // put drawing code here
  background(0);
  pos += 1;
  draw_map_dots(pos);
}
