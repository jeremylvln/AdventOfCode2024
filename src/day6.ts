import { Result } from '@swan-io/boxed';
import { match } from 'ts-pattern';

import { day, unwrapResult } from './lib.js';
import { isBetweenInclusive, Point, Vector2 } from './math.js';
import { impossible } from './utils.js';

type Guard = {
  pos: Point;
  direction: Vector2;
};

type GridWithGuard = Array<Array<'.' | '#' | '^' | '>' | 'v' | '<'>>;
type Grid = Array<Array<'.' | '#'>>;

type VisitedSet = Set<`${number}:${number}`>;
type VisitedWithDirectionSet = Set<`${number}:${number}:${number}:${number}`>;

const findGuard = (grid: GridWithGuard): [Grid, Guard] => {
  for (let y = 0; y < grid.length; y += 1) {
    for (let x = 0; x < grid[0]!.length; x += 1) {
      const char = grid[y]![x]!;
      if (char === '.' || char === '#') continue;

      const direction = match(char)
        .with('^', () => new Vector2(0, -1))
        .with('>', () => new Vector2(1, 0))
        .with('v', () => new Vector2(0, 1))
        .with('<', () => new Vector2(-1, 0))
        .exhaustive();

      const guard: Guard = {
        pos: new Point(x, y),
        direction,
      };

      grid[y]![x] = '.';
      return [grid as Grid, guard];
    }
  }

  return impossible();
};

const parseMap = (lines: readonly string[]): [Grid, Guard] => {
  const grid = lines.map((line) => [...line]) as GridWithGuard;
  return findGuard(grid);
};

const simulateGuardVisit = (
  map: Grid,
  initialGuard: Readonly<Guard>,
): Result<VisitedSet, 'InfiniteLoop'> => {
  const guard: Guard = {
    pos: initialGuard.pos.clone(),
    direction: initialGuard.direction.clone(),
  };

  const isInMap = (point: Point) =>
    isBetweenInclusive(0, map.length - 1)(point.y) &&
    isBetweenInclusive(0, map[0]!.length - 1)(point.x);

  const movements: VisitedSet = new Set();
  const totalVisited: VisitedWithDirectionSet = new Set();

  while (true) {
    const futurePosition = new Point(
      guard.pos.x + guard.direction.x,
      guard.pos.y + guard.direction.y,
    );

    if (!isInMap(futurePosition)) break;

    const positionString =
      `${futurePosition.y}:${futurePosition.x}:${guard.direction.x}:${guard.direction.y}` as const;

    if (totalVisited.has(positionString)) return Result.Error('InfiniteLoop');
    totalVisited.add(positionString);

    const facingChar = map[futurePosition.y]![futurePosition.x]!;

    if (facingChar === '#') {
      guard.direction = match(guard.direction)
        .with({ x: 0, y: -1 }, () => new Vector2(1, 0))
        .with({ x: 1, y: 0 }, () => new Vector2(0, 1))
        .with({ x: 0, y: 1 }, () => new Vector2(-1, 0))
        .with({ x: -1, y: 0 }, () => new Vector2(0, -1))
        .otherwise(() => impossible());
    } else {
      guard.pos = futurePosition;
      movements.add(`${futurePosition.y}:${futurePosition.x}`);
    }
  }

  return Result.Ok(movements);
};

const testLoops = (
  map: Grid,
  initialGuard: Readonly<Guard>,
  visitedPositions: VisitedSet,
): number => {
  const positions = [...visitedPositions].map(
    (raw) => raw.split(':').map((p) => Number.parseInt(p)) as [number, number],
  );

  return positions.filter(([y, x]) => {
    if (y === initialGuard.pos.y && x === initialGuard.pos.x) return false;

    map[y]![x] = '#';
    const simulationResult = simulateGuardVisit(map, initialGuard);
    map[y]![x] = '.';

    return (
      simulationResult.isError() && simulationResult.error === 'InfiniteLoop'
    );
  }).length;
};

day(6, (input, part) => {
  const [grid, guard] = parseMap(input);
  const visitedPositions = unwrapResult(simulateGuardVisit(grid, guard));

  part(1, () => visitedPositions.size);
  part(2, () => testLoops(grid, guard, visitedPositions));
});
