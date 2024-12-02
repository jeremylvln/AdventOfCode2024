import { day } from './lib.js';
import { Point, sum } from './math.js';

type MapCharacter = '.' | '#';
type PairsMap = Map<`${number},${number}`, number>;

type Galaxy = {
  id: number;
  point: Point;
};

type GalaxyMap = {
  map: MapCharacter[][];
  galaxies: Galaxy[];
  expandedColumns: number[];
  expandedRows: number[];
};

const PART1_EXPANSION_FACTOR = 2;
const PART2_EXPANSION_FACTOR = 1_000_000;

const getDistance = (
  galaxyMap: GalaxyMap,
  expansionFactor: number,
  first: Galaxy,
  second: Galaxy,
): number => {
  const { x: firstX, y: firstY } = first.point;
  const { x: secondX, y: secondY } = second.point;
  const [minX, maxX] = [Math.min(firstX, secondX), Math.max(firstX, secondX)];
  const [minY, maxY] = [Math.min(firstY, secondY), Math.max(firstY, secondY)];
  let distance = first.point.manhattanDistanceTo(second.point);

  for (let y = minY; y <= maxY; y += 1) {
    if (galaxyMap.expandedRows.includes(y)) {
      distance += expansionFactor - 1;
    }
  }

  for (let x = minX; x <= maxX; x += 1) {
    if (galaxyMap.expandedColumns.includes(x)) {
      distance += expansionFactor - 1;
    }
  }

  return distance;
};

const calculatePairs = (
  galaxyMap: GalaxyMap,
  expansionFactor: number,
): PairsMap => {
  const pairs: PairsMap = new Map();
  for (let id = 0; id < galaxyMap.galaxies.length; id += 1) {
    for (
      let pairingId = id + 1;
      pairingId < galaxyMap.galaxies.length;
      pairingId += 1
    ) {
      pairs.set(
        `${id + 1},${pairingId + 1}`,
        getDistance(
          galaxyMap,
          expansionFactor,
          galaxyMap.galaxies[id]!,
          galaxyMap.galaxies[pairingId]!,
        ),
      );
    }
  }

  return pairs;
};

const findExpandedColsAndRows = (
  map: MapCharacter[][],
): [columns: number[], rows: number[]] => {
  const expandedColumns: number[] = [];
  const expandedRows: number[] = [];

  for (const [y, row] of map.entries()) {
    if (row.every((char) => char === '.')) {
      expandedRows.push(y);
    }
  }

  for (let x = 0; x < map[0]!.length; x += 1) {
    if (map.every((column) => column[x] === '.')) {
      expandedColumns.push(x);
    }
  }

  return [expandedColumns, expandedRows];
};

const parseGalaxyMap = (lines: readonly string[]): GalaxyMap => {
  const map: MapCharacter[][] = lines.map(
    (line) => [...line] as MapCharacter[],
  );

  let currentGalaxyId = 1;
  const galaxies: Galaxy[] = map.flatMap((row, y) =>
    row
      .map((char, x): Galaxy | undefined =>
        char === '#'
          ? {
              id: currentGalaxyId++,
              point: new Point(x, y),
            }
          : undefined,
      )
      .filter((galaxy): galaxy is Galaxy => galaxy !== undefined),
  );

  const [expandedColumns, expandedRows] = findExpandedColsAndRows(map);

  return {
    map,
    galaxies,
    expandedColumns,
    expandedRows,
  };
};

day(11, (input, part) => {
  const galaxyMap = parseGalaxyMap(input);

  part(1, () =>
    sum([...calculatePairs(galaxyMap, PART1_EXPANSION_FACTOR).values()]),
  );

  part(2, () =>
    sum([...calculatePairs(galaxyMap, PART2_EXPANSION_FACTOR).values()]),
  );
});
