const tileTypeCost = {
  GRASS: 0,
  SAND: 1,
  WATER: Infinity,
  MOUNTAIN: 10,
  SNOW: Infinity,
  FARM: 20,
  ROAD: Infinity,
};

export default class Tile {
  constructor (tileType, item=null) {
    self.tileType = tileType;
    self.item = item;
    self.houseCost = tileTypeCost[tileType];
  }
}