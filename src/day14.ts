import { match } from 'ts-pattern';

import { day } from './lib.js';

type DishMapChar = '.' | '#' | 'O';
type DishMap = DishMapChar[][];
type VerticalDirection = 'north' | 'south';
type HorizontalDirection = 'east' | 'west';
type Direction = VerticalDirection | HorizontalDirection;

const tiltMapVertical = (map: DishMap, direction: VerticalDirection): void => {
  const start = direction === 'north' ? 1 : map.length - 2;
  const end = direction === 'north' ? map.length - 1 : 0;
  const step = direction === 'north' ? 1 : -1;

  let y = start;
  while (y !== end + step) {
    const line = map[y]!;

    for (let x = 0; x < line.length; x += 1) {
      if (line[x] !== 'O') continue;

      let targetLineIndex = y - step;
      while (
        targetLineIndex > 0 &&
        targetLineIndex < map.length - 1 &&
        map[targetLineIndex]![x] === '.' &&
        map[targetLineIndex - step]![x] === '.'
      ) {
        targetLineIndex -= step;
      }

      if (map[targetLineIndex]![x] === '.') {
        line[x] = '.';
        map[targetLineIndex]![x] = 'O';
      }
    }

    y += step;
  }
};

const tiltMapHorizontal = (
  map: DishMap,
  direction: HorizontalDirection,
): void => {
  const start = direction === 'west' ? 1 : map[0]!.length - 2;
  const end = direction === 'west' ? map[0]!.length - 1 : 0;
  const step = direction === 'west' ? 1 : -1;

  let x = start;
  while (x !== end + step) {
    for (let y = 0; y < map.length; y += 1) {
      if (map[y]![x] !== 'O') continue;

      let targetColumnIndex = x - step;
      while (
        targetColumnIndex > 0 &&
        targetColumnIndex < map[0]!.length - 1 &&
        map[y]![targetColumnIndex] === '.' &&
        map[y]![targetColumnIndex - step] === '.'
      ) {
        targetColumnIndex -= step;
      }

      if (map[y]![targetColumnIndex] === '.') {
        map[y]![x] = '.';
        map[y]![targetColumnIndex] = 'O';
      }
    }

    x += step;
  }
};

const tiltMap = (map: DishMap, direction: Direction): void =>
  direction === 'north' || direction === 'south'
    ? tiltMapVertical(map, direction)
    : tiltMapHorizontal(map, direction);

const computeLoad = (map: DishMap, edge: Direction): number => {
  const inner = (supplier: (x: number, y: number) => number): number => {
    let accumulator = 0;

    for (const [y, line] of map.entries()) {
      for (const [x, char] of line.entries()) {
        if (char === 'O') {
          accumulator += supplier(x, y);
        }
      }
    }

    return accumulator;
  };

  return match(edge)
    .with('north', () => inner((_, y) => map.length - y))
    .with('south', () => inner((_, y) => y + 1))
    .with('east', () => inner((x) => map[0]!.length - x))
    .with('west', () => inner((x) => x + 1))
    .exhaustive();
};

const cycleTiltMap = (map: DishMap): void => {
  for (const direction of ['north', 'west', 'south', 'east'] as const) {
    tiltMap(map, direction);
  }
};

const smartCycleTimes = (map: DishMap, times: number): void => {
  let iteration = 0;
  while (iteration < 10_000) {
    cycleTiltMap(map);
    iteration += 1;
  }

  const snapshots = new Map<`${number},${number}`, number>();

  while (iteration < times) {
    cycleTiltMap(map);
    const snapshot = `${computeLoad(map, 'north')},${computeLoad(
      map,
      'west',
    )}` as const;

    if (snapshots.has(snapshot)) {
      const lastSeenIteration = snapshots.get(snapshot)!;
      const diff = iteration - lastSeenIteration;

      while (iteration + diff < times) {
        iteration += diff + 1;
      }

      snapshots.clear();
    } else {
      snapshots.set(snapshot, iteration);
      iteration += 1;
    }
  }
};

day(14, (input, part) => {
  const dishMapP1: DishMap = input.map((line) => [...line] as DishMapChar[]);
  const dishMapP2: DishMap = input.map((line) => [...line] as DishMapChar[]);

  part(1, () => {
    tiltMap(dishMapP1, 'north');
    return computeLoad(dishMapP1, 'north');
  });

  part(2, () => {
    smartCycleTimes(dishMapP2, 1_000_000_000);
    return computeLoad(dishMapP2, 'north');
  });
});
