const tileHouseCosts = {
  GRASS: 0,
  SAND: -1,
  WATER: -Infinity,
  MOUNTAIN: -10,
  SNOW: -Infinity,
  FARM: -20,
  ROAD: -Infinity,
};

const tileTravelCosts = {
  GRASS: 5,
  SAND: 15,
  WATER: Infinity,
  MOUNTAIN: 1000,
  SNOW: Infinity,
  FARM: 20,
  ROAD: 1,
};

const tileFarmCosts = {
  GRASS: 0,
  SAND: -Infinity,
  WATER: -Infinity,
  MOUNTAIN: -1000,
  SNOW: -Infinity,
  FARM: -Infinity,
  ROAD: -Infinity,
}

class Tile {
  constructor(tileType, x, y, item = null) {
    this.tileType = tileType;
    this.x = x;
    this.y = y;
    this.item = item;
    this.houseCost = tileHouseCosts[tileType];
    this.travelCost = tileTravelCosts[tileType];
    this.farmCost = tileFarmCosts[tileType];
    this.updated = true;
    this.indicator = "";
    this.deadEnd = false;
  }

  setFarmCost = (cost) => {
    this.houseCost = cost + tileFarmCosts[this.tileType];
  };

  updateFarmCost = (cost) => {
    if (cost + tileFarmCosts[this.tileType] < this.farmCost) {
      this.farmCost = cost + tileFarmCosts[this.tileType];
    }
  };

  getTravelCost = (ignoreItem) => {
    if (!ignoreItem && this.item !== null) {
      switch (this.item) {
        case "HOUSE":
          return Infinity;
        case "FARM":
          return 20;
        default:
          tileTravelCosts[this.tileType];
      }
    } else {
      return tileTravelCosts[this.tileType];
    }
  };

  setUpdated = (val) => {
    this.updated = val;
  };

  setItem = (item) => {
    this.item = item;
    if (item === "HOUSE") {
      this.houseCost = Infinity;
    } else if (item === "FARM") {
      // this.houseCost = this.tileHouseCosts[this.tileType];
    }
    this.travelCost = this.getTravelCost(false);
  };

  setTileType = (type) => {
    this.item = null;
    this.tileType = type;
    this.houseCost = tileHouseCosts[type];
    this.travelCost = this.getTravelCost(false);
  };

  setHouseCost = (cost) => {
    this.houseCost = cost + tileHouseCosts[this.tileType];
  };

  addHouseCost = (cost) => {
    this.houseCost = cost + this.houseCost;
  }

  addFarmCost = (cost) => {
    this.farmCost = cost + this.farmCost;
  }

  updateHouseCost = (cost) => {
    if (cost + tileHouseCosts[this.tileType] < this.houseCost) {
      this.houseCost = cost + tileHouseCosts[this.tileType];
    }
  };

  getHouseCost = () => (this.item === "FARM" ? this.houseCost / 2.5 : this.houseCost)
  

  travelDistance = (other) => {
    if (other instanceof Tile) {
      const path = aStarPath(
        this.x,
        this.y,
        other.x,
        other.y
      );
      return path.length > 0 ? path[path.length - 1].g : Infinity;
    } else {
      return Infinity;
    }
  };

  distance = (other) => {
    if (other instanceof Tile) {
      return Math.sqrt((this.x - other.x) ** 2 + (this.y - other.y) ** 2);
    } else {
      return Infinity;
    }
  };
}
