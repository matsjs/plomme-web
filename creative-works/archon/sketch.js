const worldWidth = 50;
const worldHeight = 50;
const tileSize = 20;
let world = [];
let frameNum = 42;
const tileType = {
  GRASS: [23, 91, 70, 255],
  SAND: [243, 222, 138, 255],
  WATER: [20, 129, 186, 255],
  MOUNTAIN: [153, 153, 153, 255],
  SNOW: [245, 245, 245, 255],
  FARM: [255, 231, 153, 255],
  ROAD: [163, 123, 115, 200],
};

let iconIMG = {};
let pixelizedIMG = {};

function elevFunc(xSize, ySize) {
  // Input world size
  // Outputs a blank world
  let hmap = [];

  for (let x = 0; x < xSize; x++) {
    // Slices of world from left to right
    let hSlice = [];

    for (let y = 0; y < ySize; y++) {
      // Pieces of world from top to bottom
      hSlice.push(null);
      // TODO better mountaingen

      // const elev = noise(y * 0.015, x * 0.015) * 1.75;
      // if (elev > 0.95) {
      //   hSlice.push("SNOW");
      // } else if (elev > 0.8) {
      //   hSlice.push("MOUNTAIN");
      // } else if (elev > 0.7) {
      //   hSlice.push("HILL");
      // } else {
      //   hSlice.push(null);
      // }
    }

    hmap.push(hSlice);
  }
  return hmap;
}

function pangea(xSize, ySize) {
  // Input world size
  // Outputs a blank world
  let world = [];

  for (let x = 0; x < xSize; x++) {
    // Slices of world from left to right
    let worldSlice = [];

    for (let y = 0; y < ySize; y++) {
      // Pieces of world from top to bottom
      const distance =
        Math.sqrt((x - xSize / 2) ** 2 + (y - ySize / 2) ** 2) /
        Math.sqrt((xSize / 2) ** 2 + (ySize / 2) ** 2);

      const lVal = distance * 1.2 + noise(y * 0.1, x * 0.1) * 0.8;

      worldSlice.push(lVal);
    }

    world.push(worldSlice);
  }
  return world;
}

function grassWorld(xSize, ySize) {
  let world = [];
  for (let x = 0; x < xSize; x++) {
    let worldSlice = [];
    for (let y = 0; y < ySize; y++) {
      worldSlice.push(0.6);
    }
    world.push(worldSlice);
  }
  return world;
}

function createTile(continent, elevation, x, y) {
  const tileVal = continent[x][y];
  const height = elevation[x][y];
  let tileType = "";
  let tileItem = null;

  if (tileVal > 0.8) {
    tileType = "WATER";
  } else {
    if (height === null) {
      tileType = tileVal > 0.65 ? "SAND" : "GRASS";
    } else if (height === "HILL") {
      tileType = tileVal > 0.65 ? "SAND" : "GRASS";
      // tileItem = "HILL"
    } else {
      tileType = height;
    }
  }

  return new Tile(tileType, x, y, tileItem);
}

function terrainType(x, y) {
  const landVal = continent[x][y];
  const elev = elevation[x][y];
  if (landVal > 0.8) {
    return color(cSEA);
  } else if (landVal > 0.65) {
    return elev !== null ? color(elev) : color(cSAND);
  } else {
    return elev !== null ? color(elev) : color(cGRASS);
  }
}

function buildWorld(continent, elevation, xSize, ySize) {
  let items = [];

  for (let x = 0; x < xSize; x++) {
    // Slices of world from left to right
    let worldSlice = [];

    for (let y = 0; y < ySize; y++) {
      // Pieces of world from top to bottom

      worldSlice.push(createTile(continent, elevation, x, y));
    }

    items.push(worldSlice);
  }
  return items;
}

function worldGen(worldWidth, worldHeight) {
  // const w = pangea(worldWidth, worldHeight);
  const w = grassWorld(worldWidth, worldHeight);

  return buildWorld(
    w,
    elevFunc(worldWidth, worldHeight),
    worldWidth,
    worldHeight
  );
}

function tileToPixels(x, y, tileSize, terrain, item) {
  colors = tileType[terrain];
  itemPixels = pixelizedIMG[item];

  for (let w = 0; w < tileSize; w++) {
    for (let h = 0; h < tileSize; h++) {
      let base =
        x * 4 * tileSize +
        4 * w +
        tileSize * h * 4 * worldWidth +
        y * 4 * tileSize * worldWidth * tileSize;

      let noise = 0.95 + Math.random() * 0.1;
      pixels[base + 0] = colors[0] * noise;
      pixels[base + 1] = colors[1] * noise;
      pixels[base + 2] = colors[2] * noise;
      pixels[base + 3] = colors[3];

      let imgBase = (w + h * tileSize) * 4;
      if (item && itemPixels[imgBase + 3]) {
        pixels[base + 0] = itemPixels[imgBase + 0] * noise;
        pixels[base + 1] = itemPixels[imgBase + 1] * noise;
        pixels[base + 2] = itemPixels[imgBase + 2] * noise;
        pixels[base + 3] = itemPixels[imgBase + 3];
      }
    }
  }
}

function renderWorld() {
  // All tiles with new info
  let toUpdate = [];

  loadPixels();
  for (let x = 0; x < world.length; x++) {
    for (let y = 0; y < world[0].length; y++) {
      const tile = world[x][y];

      if (tile.updated) {
        tileToPixels(tile.x, tile.y, tileSize, tile.tileType, tile.item);

        if (tile.indicator === "") {
          tile.setUpdated(false);
        } else {
          toUpdate.push(tile);
        }
      }
    }
  }
  updatePixels();
  log(toUpdate);

  toUpdate.forEach((tile) => {
    // Check if there's an indicator here
    if (tile.indicator !== "") {
      color(0);
      text(
        tile.indicator,
        tile.x * tileSize + 0.5 * tileSize,
        tile.y * tileSize + 0.5 * tileSize
      );
      tile.indicator = "";
      tile.setUpdated(true);
    }
  });
}

let population = 10;
let houseTiles = [];
let farmTiles = [];
let roadTiles = [];

function popChange(currentPopulation, growthRate, carryingCapacity) {
  return (
    growthRate * currentPopulation * (1 - currentPopulation / carryingCapacity)
  );
}

timeTick = () => {
  if (houseTiles.length === 0) {
    createVillage(5, true, 4);
  } else {
    const newHouses = popChange(houseTiles.length, 1.2, farmTiles.length / 2);
    newHouses, true, 4;
  }
};

farmOrRoadNeighbor = (tile) => {
  getNeighbors(tile, world).forEach((neighbor) => {
    if (neighbor.tileType === "ROAD" || neighbor.item === "FARM") {
      return true;
    }
  });
  return false;
};

createFields = (n) => {
  for (let index = 0; index < n; index++) {
    addFarm();
  }
};

function addFarm() {
  // Find optimal tile - next to other farm or next to a road, close to population center
  const possibleTiles = world.flat().reduce((accumulator, currentValue) => {
    if (
      currentValue.tileType !== "WATER" &&
      currentValue.tileType !== "ROAD" &&
      currentValue.item !== "FARM" &&
      currentValue.item !== "HOUSE"
    ) {
      accumulator.push(currentValue);
    }
    return accumulator;
  }, []);

  if (possibleTiles.length > 0) {
    const bestTiles = possibleTiles.sort(
      (tileA, tileB) => tileA.farmCost - tileB.farmCost
    );
    let index = 0;
    let optimalTile = bestTiles[index];
    // If dead end, find next spot
    while (index < bestTiles.length) {
      optimalTile = bestTiles[index];
      index++;
    }
    // Place farm plot
    placeItem(optimalTile, "FARM");
    // Update costs
    updateCosts(optimalTile, 5, true);
  } else {
    // No possible tiles
  }
}

removeTileItem = (tile) => {
  if (tile.item !== null) {
    switch (tile.item) {
      case "HOUSE":
        removeHouse(tile);
        break;
      case "FARM":
        removeFarm(tile);
        break;
      default:
        break;
    }
  }
};

placeItem = (tile, item) => {
  removeTileItem(tile);
  switch (item) {
    case "HOUSE":
      placeHouse(tile);
      break;
    case "FARM":
      placeFarm(tile);
      break;
    default:
      break;
  }
};

removeFarm = (tile) => {
  const tileIndex = farmTiles.indexOf(tile);
  if (tileIndex >= 0) {
    tile.setItem(null);
    tile.setUpdated(true);
    farmTiles.splice(tileIndex, 1);
    updateCosts(tile, 5, false);
  }
};

removeHouse = (tile) => {
  const tileIndex = houseTiles.indexOf(tile);
  if (tileIndex >= 0) {
    tile.setItem(null);
    tile.setUpdated(true);
    houseTiles.splice(tileIndex, 1);
    updateCosts(tile, 5, false);
  }
};

placeFarm = (tile) => {
  tile.setItem("FARM");
  tile.setUpdated(true);
  farmTiles.push(tile);
};

placeHouse = (tile) => {
  tile.setItem("HOUSE");
  tile.setUpdated(true);
  houseTiles.push(tile);
};

placeRoad = (x, y) => {
  const tile = world[x][y];
  if (tile.tileType !== "ROAD" && !tile.item !== "HOUSE") {
    tile.setTileType("ROAD");
    roadTiles.push(tile);
    tile.setUpdated(true);
    updateCosts(tile, 2, true);
  }
};

function buildHouse() {
  // Find optimal location
  let optimalTile = world.flat().reduce((accumulator, currentValue) => {
    if (
      currentValue.tileType !== "WATER" &&
      currentValue.tileType !== "ROAD" &&
      currentValue.item !== "HOUSE" &&
      currentValue.getHouseCost() > accumulator.getHouseCost()
    ) {
      return currentValue;
    } else {
      return accumulator;
    }
  });

  // First house:
  if (houseTiles.length === 0 && roadTiles.length === 0) {
    optimalTile =
      world[Math.round(worldWidth / 2)][Math.round(worldHeight / 2)];
    placeRoad(optimalTile.x, optimalTile.y + 1);
    placeItem(optimalTile, "HOUSE");
  } else {
    // Find nearest road connection
    roads = [...getNeighboringRoads(optimalTile)];
    if (roads.length === 0) {
      // If there are no neighbouring connections, place a new road

      // Sort by distance
      roads = roadTiles.sort((tile) => tile.distance(optimalTile));
      let joinRoad = null;
      let numAttempts = 3 < roads.length ? 3 : roads.length;
      // Attempt to join road
      for (let attempt = 0; attempt < numAttempts; attempt++) {
        let path;
        if (attempt === numAttempts - 1) {
          path = aStar(
            optimalTile.x,
            optimalTile.y,
            roads[attempt].x,
            roads[attempt].y,
            world,
            true
          );
        } else {
          path = aStar(
            optimalTile.x,
            optimalTile.y,
            roads[attempt].x,
            roads[attempt].y,
            world,
            false
          );
        }

        if (path.length > 0) {
          // Connection found!
          joinRoad = path;
          break;
        }
      }

      if (joinRoad !== null) {
        // Connect roads
        joinRoad.forEach((step) => {
          placeRoad(step.x, step.y);
        });
        // Place house
        placeItem(optimalTile, "HOUSE");
      } else {
        console.log("Destructive construction");
        // No house placed, cannot connect location
        optimalTile.setHouseCost(-Infinity);
      }
    } else {
      // optimalTile has neighbouring road.
      placeItem(optimalTile, "HOUSE");
    }
  }

  // Update cost gradient for houses
  updateCosts(optimalTile, 5, true);
}

distanceFromCenter = (x, y) => {
  let xCumulative = 0;
  let yCumulative = 0;

  houseTiles.forEach((tile) => {
    xCumulative += tile.x;
    yCumulative += tile.y;
  });

  const xMean = xCumulative / houseTiles.length;
  const yMean = yCumulative / houseTiles.length;

  return Math.sqrt((x - xMean) ** 2 + (y - yMean) ** 2);
};

updateCosts = (source, range, additive) => {
  const xPos = source.x;
  const yPos = source.y;
  const xUpperBound =
    xPos + range + 1 < world.length ? xPos + range + 1 : world.length;
  const xLowerBound = xPos - range > 0 ? xPos - range : 0;
  const yUpperBound =
    yPos + range + 1 < world[0].length ? yPos + range + 1 : world[0].length;
  const yLowerBound = yPos - range > 0 ? yPos - range : 0;
  const maxDist = euclideanDistance(xPos, yPos, xUpperBound, yUpperBound);
  for (let x = xLowerBound; x < xUpperBound; x++) {
    for (let y = yLowerBound; y < yUpperBound; y++) {
      const tile = world[x][y];
      if (x === xPos && y === yPos) {
      } else if (additive) {
        tile.addHouseCost(maxDist - euclideanDistance(xPos, yPos, x, y));
        if (tile.item !== "HOUSE") {
          tile.addFarmCost(maxDist - euclideanDistance(xPos, yPos, x, y));
        }
      } else if (!additive) {
        tile.addHouseCost(-(maxDist - euclideanDistance(xPos, yPos, x, y)));
        tile.addFarmCost(-(maxDist - euclideanDistance(xPos, yPos, x, y)));
      }
    }
  }
};

euclideanDistance = (sourceX, sourceY, destX, destY) => {
  return Math.sqrt((sourceX - destX) ** 2 + (sourceY - destY) ** 2);
};

let ignoreHousesHoverPath = false;
// Controls:
// h = build single house
// | = hoverpath ignores houses
// 1 = build path on hover click
keyPressed = () => {
  if (keyCode === 72) {
    renderWorld();
    buildHouse();
  } else if (keyCode === 172) {
    ignoreHousesHoverPath = !ignoreHousesHoverPath;
  } else if (keyCode === 49) {
    layRoad = true;
  } else if (keyCode == 39) {
    console.log("timetick");
    timeTick();
  }
};

getNeighboringRoads = (tile) => {
  return getNeighbors(tile, world).filter((tile) => tile.tileType === "ROAD");
};

let showRoads = false;
let startA = 0;
let startB = 0;
let layRoad = false;

registerClick = () => {
  showRoads = !showRoads;
  if (showRoads) {
    startA = floor(mouseX / tileSize);
    startB = floor(mouseY / tileSize);
    world[startA][startB].indicator = "S";
  } else {
    path.map((tile) => {
      tile.indicator = "";
      if (layRoad) {
        tile.setTileType("ROAD");
        roadTiles.push(tile);
      }
      tile.updated = true;
    });
    oldPath.map((tile) => {
      tile.indicator = "";
      tile.updated = true;
    });
    world[startA][startB].indicator = "";
    world[startA][startB].updated = true;
    layRoad = false;
  }
};

removeHouse = (tile) => {
  tile.setItem(null);
  tile.setUpdated(true);
  const index = houseTiles.find((hTile) => hTile === tile);
  houseTiles.splice(index, 1);
};

randomRoadRebalance = (utilityThreshold) => {
  // Take two random points of road
  const a = roadTiles[Math.round(Math.random() * (roadTiles.length - 1))];
  let b = roadTiles[Math.round(Math.random() * (roadTiles.length - 1))];
  while (b === a) {
    b = roadTiles[Math.round(Math.random() * (roadTiles.length - 1))];
  }

  // Find distance between them
  const path = aStar(a.x, a.y, b.x, b.y, world, false);
  let standardDistance = 0;
  try {
    standardDistance = path[path.length - 1].g;
  } catch (error) {
    console.log("----------");

    console.log(a.x, a.y, b.x, b.y);

    console.log(path);
  }

  // Find distance between them, ignoring houses
  const noHousePath = aStar(a.x, a.y, b.x, b.y, world, true);
  const noHouseDistance = noHousePath[noHousePath.length - 1].g;

  // Number of houses in no house path
  const housesInPath = noHousePath.reduce(
    (acc, tile) => (world[tile.x][tile.y].item === "HOUSE" ? acc + 1 : acc),
    0
  );

  // Compare costs, see if utility is good enough
  if (standardDistance - noHouseDistance / housesInPath > utilityThreshold) {
    // If utility is good enough, tear down some houses and create that road.
    noHousePath.forEach((step) => {
      const tile = world[step.x][step.y];
      removeTileItem(tile);

      if (tile.tileType !== "ROAD") {
        placeRoad(step.x, step.y);
      }
    });
  }
};

createVillage = (numHouses, farms, farmsPerHouse) => {
  for (let houseNum = 0; houseNum < numHouses; houseNum++) {
    buildHouse();
    if (farms && houseTiles.length * farmsPerHouse - farmTiles.length > 0) {
      // If we're building farms and there are not enough of them already, place some more.
      createFields(houseTiles.length * farmsPerHouse - farmTiles.length);
    }

    if (houseNum > 0 && houseNum % 50 === 0) {
      // Improve road network every n times
      // Improve a number of roads while we're at it
      for (let times = 0; times < 10; times++) {
        randomRoadRebalance(5);
      }
    }
  }
};
imgToPixels = (toPixelize) => {
  let pixelized = [];
  toPixelize.loadPixels();

  for (let y = 0; y < toPixelize.height; y++) {
    for (let x = 0; x < toPixelize.width; x++) {
      let index = (x + y * toPixelize.width) * 4;

      pixelized = pixelized.concat([
        toPixelize.pixels[index],
        toPixelize.pixels[index + 1],
        toPixelize.pixels[index + 2],
        toPixelize.pixels[index + 3],
      ]);
    }
  }
  return pixelized;
};

// ---------------------------------Standards---------------------------------
function preload() {
  iconIMG = {
    HILL: loadImage("../../assets/hill.png"),
    HOUSE: loadImage("../../assets/house.png"),
    TREE: loadImage("../../assets/tree.png"),
    FARM: loadImage("../../assets/farm.png"),
  };
}

times = (element, times) => {
  let accumulator = [];
  for (let index = 0; index < times; index++) {
    if (Array.isArray(element)) {
      accumulator = accumulator.concat(element);
    } else {
      accumulator.push(element);
    }
  }
  return accumulator;
};

iconScale = (img, scale) => {
  let wScaled = [];
  for (let index = 0; index < img.length / 4; index++) {
    let pixelValues = [
      img[index * 4 + 0],
      img[index * 4 + 1],
      img[index * 4 + 2],
      img[index * 4 + 3],
    ];
    wScaled = wScaled.concat(times(pixelValues, scale));
  }

  let hScaled = [];
  for (let index = 0; index < wScaled.length / (4 * tileSize); index++) {
    hScaled = hScaled.concat(
      times(
        wScaled.slice(
          index * tileSize * 4,
          tileSize * 4 + index * tileSize * 4
        ),
        2
      )
    );
  }
  return hScaled;
};

function setup() {
  cnv = createCanvas(worldWidth * tileSize, worldHeight * tileSize);
  cnv.parent("p5-canvas");
  cnv.mouseClicked(registerClick);
  pixelDensity(1);
  // Object.keys(iconIMG).forEach((key) => iconScale(iconIMG[key], 4));
  pixelizedIMG = {
    HILL: iconScale(imgToPixels(iconIMG["HILL"]), tileSize / 10),
    HOUSE: iconScale(imgToPixels(iconIMG["HOUSE"]), tileSize / 10),
    TREE: iconScale(imgToPixels(iconIMG["TREE"]), tileSize / 10),
    FARM: iconScale(imgToPixels(iconIMG["FARM"]), tileSize / 10),
  };
  noiseDetail(2, 0.1);
  noiseSeed(frameNum);
  world = worldGen(worldWidth, worldHeight);
  renderWorld();
}

drawPath = (x, y, x1, y1) => {
  aStar(x, y, x1, y1, world, false).forEach((step) => {
    placeRoad(step.x, step.y);
  });
};

drawMousePosition = () => {
  color(tileType["WATER"]);
  rect(0, 5, 40, 20);
  color(0);
  text(
    "(" + floor(mouseX / tileSize) + "," + floor(mouseY / tileSize) + ")",
    0,
    20
  );
  rect(
    0,
    worldHeight * tileSize - 10,
    worldWidth * tileSize,
    worldHeight * tileSize
  );
};

drawMousePointer = () => {
  const xMouseTile = floor(mouseX / tileSize);
  const yMouseTile = floor(mouseY / tileSize);
  if (!(xMouseTile > world.length - 1) && !(yMouseTile > world[0].length - 1)) {
    const tile = world?.[xMouseTile]?.[yMouseTile];
    if (tile !== undefined) {
      tile.indicator = "O";
      tile.setUpdated(true);
    }
  }
};

drawMouseTrail = () => {
  if (showRoads) {
    if (
      endA !== floor(mouseX / tileSize) ||
      endB !== floor(mouseY / tileSize)
    ) {
      // Mouse moved, find new path

      endA = floor(mouseX / tileSize);
      endB = floor(mouseY / tileSize);
      path = aStar(
        startA,
        startB,
        endA,
        endB,
        world,
        ignoreHousesHoverPath
      ).map((step) => world[step.x][step.y]);

      path.forEach((tile) => {
        tile.indicator = "X";
        tile.setUpdated(true);
      });

      world[startA][startB].indicator = "S";
      world[startA][startB].setUpdated(true);
    } else {
      path.forEach((tile) => {
        tile.indicator = "X";
        tile.setUpdated(true);
      });

      world[startA][startB].indicator = "S";
      world[startA][startB].setUpdated(true);
    }
  }
};

drawStatusBar = () => {
  if (
    floor(mouseX) / tileSize < 0 ||
    floor(mouseY / tileSize) < 0 ||
    floor(mouseX) / tileSize > world.length - 1 ||
    floor(mouseY / tileSize) > world[0].length - 1
  ) {
  } else {
    const t = world[floor(mouseX / tileSize)][floor(mouseY / tileSize)];
    text(
      layRoad && showRoads
        ? "PLACING ROAD! "
        : "" +
            houseTiles.length +
            " houses" +
            ", t: " +
            t.tileType +
            (t.item !== null ? ", item: " + t.item : "") +
            ", hCost:" +
            Math.round(t.houseCost) +
            ", tCost:" +
            Math.round(t.getTravelCost()) +
            ", fCost:" +
            Math.round(t.farmCost),
      0,
      worldHeight * tileSize
    );
  }
};

drawPopCenter = () => {
  if (houseTiles.length > 0) {
    const xAvg =
      houseTiles.reduce((res, curr) => res + curr.x, 0) / houseTiles.length;
    const yAvg =
      houseTiles.reduce((res, curr) => res + curr.y, 0) / houseTiles.length;

    stroke(255, 0, 0);
    strokeWeight(20);
    point(xAvg * tileSize, yAvg * tileSize);
    stroke(0, 0, 0);
    strokeWeight(0);
  }
};

let path = [];
let oldPath = [];
let hover = null;
let pause = true;
let endA = 0;
let endB = 0;
let autobuilding = false;

function draw() {
  drawMousePosition();
  drawMousePointer();
  drawMouseTrail();
  drawStatusBar();
  // drawPopCenter();

  // draw houses/ farms
  // update world
  frameNum++;

  if (!pause && frameNum % 10 === 0) {
    buildHouse();
  }

  if (showRoads) {
    if (
      endA !== floor(mouseX / tileSize) ||
      endB !== floor(mouseY / tileSize)
    ) {
      endA = floor(mouseX / tileSize);
      endB = floor(mouseY / tileSize);
      path = aStar(
        startA,
        startB,
        endA,
        endB,
        world,
        ignoreHousesHoverPath
      ).map((step) => world[step.x][step.y]);
      path.map((tile) => (tile.indicator = "X"));
      world[startA][startB].indicator = "S";
      oldPath.map((tile) => {
        if (!path.includes(tile)) {
          tile.indicator = "";
          tile.setUpdated(true);
        }
      });

      oldPath = path;
    }
  }

  try {
    if (
      floor(mouseX / tileSize) < world.length &&
      floor(mouseY / tileSize) < world[0].length &&
      hover !== world[floor(mouseX / tileSize)][floor(mouseY / tileSize)]
    ) {
      hover.indicator = "";
      hover.setUpdated(true);
      hover = world[floor(mouseX / tileSize)][floor(mouseY / tileSize)];
      hover.indicator = "O";
      hover.setUpdated(true);
    }
  } catch (error) {
    hover = null;
  }
  renderWorld();

  // renderItems();
  if (hover !== null && hover.indicator !== "X") {
    hover.indicator = "";
    hover.updated = true;
  }

  // if (frameNum % 5 === 0) {
  //   noiseSeed(frameNum);
  //   world = worldGen(worldWidth, worldHeight);

  //   renderWorld()
  // }
  if (!autobuilding) {
    autobuilding = true;
    autobuild(5);
  }
}

async function autobuild(num_iterations) {
  for (let i = 0; i < num_iterations; i++) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    createVillage(50, 500, 10);
    randomRoadRebalance(5);
  }
}
