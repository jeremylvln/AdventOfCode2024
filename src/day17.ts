import { Option } from '@swan-io/boxed';
import { Heap } from 'heap-js';
import { match } from 'ts-pattern';

import { day } from './lib.js';
import { Readonly2DArray, impossible } from './utils.js';

type Loss = number;
type LossGrid = Readonly2DArray<Loss>;
type Direction = 'up' | 'down' | 'left' | 'right';

type VisitedSet = Set<string>;

type Position = {
  x: number;
  y: number;
  direction: Direction | undefined;
  depth: number;
  loss: Loss;
};

const ALL_DIRECTIONS: ReadonlyArray<Direction> = [
  'up',
  'down',
  'left',
  'right',
] as const;
const INVERSE_DIRECTIONS: Record<Direction, Direction> = {
  up: 'down',
  down: 'up',
  left: 'right',
  right: 'left',
};

const tryNextPosition = (
  lossGrid: LossGrid,
  current: Position,
  direction: Direction,
  minMoves: number,
  maxMoves: number,
): Option<Position> => {
  const [nextY, nextX] = match(direction)
    .with('up', () => [current.y - 1, current.x] as const)
    .with('down', () => [current.y + 1, current.x] as const)
    .with('left', () => [current.y, current.x - 1] as const)
    .with('right', () => [current.y, current.x + 1] as const)
    .exhaustive();

  if (
    nextY < 0 ||
    nextY >= lossGrid.length ||
    nextX < 0 ||
    nextX >= lossGrid[0]!.length
  ) {
    return Option.None();
  }

  if (current.direction === INVERSE_DIRECTIONS[direction]) {
    return Option.None();
  }

  if (current.direction === direction && current.depth === maxMoves) {
    return Option.None();
  }

  if (
    current.direction !== direction &&
    current.depth < minMoves &&
    !(current.y === 0 && current.x === 0)
  ) {
    return Option.None();
  }

  return Option.Some({
    x: nextX,
    y: nextY,
    direction,
    depth: current.direction === direction ? current.depth + 1 : 1,
    loss: current.loss + lossGrid[nextY]![nextX]!,
  });
};

const findMinimumLoss = (
  lossGrid: LossGrid,
  minMoves: number,
  maxMoves: number,
): number => {
  const visited: VisitedSet = new Set();

  const queue = new Heap<Position>((a, b) => a.loss - b.loss);
  queue.push({
    x: 0,
    y: 0,
    direction: undefined,
    depth: 0,
    loss: 0,
  });

  while (queue.length > 0) {
    const current = queue.pop()!;

    const visitKey = `${current.y},${current.x},${current.direction},${current.depth}`;
    if (visited.has(visitKey)) continue;

    if (current.depth >= minMoves) {
      for (let delta = 0; delta <= maxMoves - current.depth; delta += 1) {
        const deltaVisitKey = `${current.y},${current.x},${current.direction},${
          current.depth + delta
        }`;
        visited.add(deltaVisitKey);
      }
    } else {
      visited.add(visitKey);
    }

    if (
      current.y === lossGrid.length - 1 &&
      current.x === lossGrid[0]!.length - 1 &&
      current.depth >= minMoves
    ) {
      return current.loss;
    }

    const maybeNewPositions = ALL_DIRECTIONS.map((direction) =>
      tryNextPosition(lossGrid, current, direction, minMoves, maxMoves),
    );

    for (const maybeNewPosition of maybeNewPositions) {
      if (maybeNewPosition.isSome()) {
        queue.push(maybeNewPosition.value);
      }
    }
  }

  return impossible();
};

day(17, (input, part) => {
  const lossGrid: LossGrid = input.map((line) =>
    [...line].map((s) => Number.parseInt(s)),
  );

  part(1, () => findMinimumLoss(lossGrid, 0, 3));
  part(2, () => findMinimumLoss(lossGrid, 4, 10));
});
