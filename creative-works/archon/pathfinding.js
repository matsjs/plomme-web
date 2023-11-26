aStar = (x1, y1, x2, y2, world, ignoreItems) => {
  const start = new Vert(x1, y1, 0, null);
  const goal = new Vert(x2, y2, 0, null);
  const outPath = findPath(start, goal, world, euclideanTileDistance, ignoreItems);

  return outPath;
};

dijkstra = (x, y, world) => {
  const start = new Vert(x, y, 0, null);
  const goal = null;
  const outPath = findPath(start, goal, world, (x,y) => 0, false);

  return outPath;
};

totalWeight = (vertex) => {
  return vertex.g + vertex.parent !== null ? totalWeight(vertex.parent) : 0;
};

reconstruct_path = (current) => {
  return current.parent !== null
    ? [...reconstruct_path(current.parent), current]
    : [];
};

// [x][y]
findPath = (start, goal, world, h, ignoreItems) => {
  // The set of discovered nodes that may need to be (re-)expanded.
  // Initially, only the start node is known.
  // This is usually implemented as a min-heap or priority queue rather than a hash-set.
  openSet = new Set([start]);

  // For node n, cameFrom[n] is the node immediately preceding it on the cheapest path from start
  // to n currently known.
  cameFrom = {};
  nodes = world.map((row, x) =>
    row.map((tile, y) => new Vert(x, y, tile.getTravelCost(ignoreItems), null))
  );

  // For node n, gScore[n] is the cost of the cheapest path from start to n currently known.
  start.g = 0;

  // For node n, fScore[n] := gScore[n] + h(n). fScore[n] represents our current best guess as to
  // how short a path from start to finish can be if it goes through n.
  start.f = h(start, goal);

  while (openSet.size > 0) {
    // This operation can occur in O(1) time if openSet is a min-heap or a priority queue

    let current = null;
    openSet.forEach((vertex) => {
      if (current !== null && vertex.f < current.f) {
        current = vertex;
      } else if (current === null) {
        current = vertex;
      }
    });
    if (goal !== null && current.x === goal.x && current.y === goal.y) {
      return reconstruct_path(current);
    }
    openSet.delete(current);

    getNeighbors(current, nodes).forEach((neighbor) => {
      if (neighbor) {
        // d(current,neighbor) is the weight of the edge from current to neighbor
        // tentative_gScore is the distance from start to the neighbor through current
        tentativeGScore = current.g + neighbor.weight;

        if (tentativeGScore < neighbor.g && neighbor.valid && current.valid) {
          // This path to neighbor is better than any previous one. Record it!
          neighbor.parent = current;
          neighbor.g = tentativeGScore;
          neighbor.f = neighbor.g + h(neighbor, goal);
          if (!openSet.has(neighbor) && neighbor.valid) {
            openSet.add(neighbor);
          }
        }
      }
    });
  }
  if (goal === null) {
    //   All to all
      return nodes
  } else {
      // Open set is empty but goal was never reached
      return [];
  }
};

euclideanTileDistance = (a, b) => {
  return sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
};

getNeighbors = (origin, neighborhood) => {
  neighbors = [];
  for (let y = -1; y < 2; y++) {
    if (origin.y + y >= 0 && origin.y + y < neighborhood[0].length) {
      neighbors.push(neighborhood[origin.x][origin.y + y]);
    }
  }

  for (let x = -1; x < 2; x++) {
    if (origin.x + x >= 0 && origin.x + x < neighborhood.length) {
      neighbors.push(neighborhood[origin.x + x][origin.y]);
    }
  }

  return neighbors;
};

isWall = (weight) => {
  return weight === Infinity;
};

class Vert {
  constructor(x, y, weight, parent) {
    this.x = x;
    this.y = y;
    this.parent = parent;
    this.weight = weight;
    this.f = Infinity;
    this.g = Infinity;
    if (weight === Infinity) {
      this.valid = false;
    } else {
      this.valid = true;
    }
  }
}
