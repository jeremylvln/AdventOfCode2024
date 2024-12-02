import { Option } from '@swan-io/boxed';
import { match } from 'ts-pattern';

import { day } from './lib.js';
import { impossible } from './utils.js';

type Direction = 'F' | '-' | '7' | '|' | 'J' | 'L';
type MazeCharacter = '.' | 'S' | Direction;

type Position = [x: number, y: number];
type VisitedSet = Set<`${number},${number}`>;

const isPipeCharacter = (character: MazeCharacter): character is Direction =>
  ['F', '-', '7', '|', 'J', 'L'].includes(character);

const isPipeConnected = (
  from: 'S' | Direction,
  to: Direction,
  [dX, dY]: Position,
): boolean =>
  match([dX, dY])
    .with(
      [0, -1],
      () =>
        (from === 'S' || from === '|' || from === 'L' || from === 'J') &&
        (to === '|' || to === 'F' || to === '7'),
    )
    .with(
      [0, 1],
      () =>
        (from === 'S' || from === '|' || from === 'F' || from === '7') &&
        (to === '|' || to === 'L' || to === 'J'),
    )
    .with(
      [-1, 0],
      () =>
        (from === 'S' || from === '-' || from === '7' || from === 'J') &&
        (to === '-' || to === 'F' || to === 'L'),
    )
    .with(
      [1, 0],
      () =>
        (from === 'S' || from === '-' || from === 'F' || from === 'L') &&
        (to === '-' || to === '7' || to === 'J'),
    )
    .otherwise(() => false);

const findNextNeighbour = (
  maze: MazeCharacter[][],
  visited: VisitedSet,
  [x, y]: Position,
): Option<Position> => {
  const from = maze[y]![x] as Direction;

  return Option.fromNullable(
    [[0, -1] as const, [0, 1] as const, [-1, 0] as const, [1, 0] as const]
      .filter(([dX, dY]) => {
        if (x + dX < 0 || x + dX >= maze[0]!.length) return false;
        if (y + dY < 0 || y + dY >= maze.length) return false;

        const to = maze[y + dY]![x + dX]!;
        const position = [x + dX, y + dY] as Position;
        if (visited.has(`${position[0]},${position[1]}`)) return false;

        return isPipeCharacter(to) && isPipeConnected(from, to, [dX, dY]);
      })
      .at(0),
  ).map(([dX, dY]) => [x + dX, y + dY] as Position);
};

const countInsideLoop = (
  maze: MazeCharacter[][],
  visited: VisitedSet,
): number => {
  let count = 0;

  for (let y = 0; y < maze.length; y += 1) {
    let isInsideLoop = false;
    let chainStart = 0;

    for (let x = 0; x < maze[0]!.length; x += 1) {
      const char = maze[y]![x]!;
      const isPartOfLoop = visited.has(`${x},${y}`);

      if (isPartOfLoop && (char === '|' || char === 'L' || char === 'J')) {
        // process.stdout.write(`\u001B[0;90m${char}\u001B[0m`);
        isInsideLoop = !isInsideLoop;
        chainStart = isInsideLoop ? -1 : 0;
      } else if (isInsideLoop && !isPartOfLoop) {
        if (chainStart === -1) chainStart = x;
        // process.stdout.write('\u001B[0;32mI\u001B[0m');
        count += 1;
      } else {
        // process.stdout.write(`\u001B[0;90m${char}\u001B[0m`);
      }
    }

    if (isInsideLoop) count -= maze[0]!.length - chainStart;
    // process.stdout.write('\n');
  }

  return count;
};

const findLoop = (
  maze: MazeCharacter[][],
  initialPosition: Position,
): VisitedSet => {
  const visited: VisitedSet = new Set();
  let currentPosition = initialPosition;
  visited.add(`${currentPosition[0]},${currentPosition[1]}`);

  while (true) {
    const maybeNext = findNextNeighbour(maze, visited, currentPosition);
    if (maybeNext.isNone()) break;
    currentPosition = maybeNext.value;
    visited.add(`${currentPosition[0]},${currentPosition[1]}`);
  }

  return visited;
};

const findStartingPosition = (maze: MazeCharacter[][]): Position => {
  for (const [y, line] of maze.entries()) {
    const maybeStart = line.indexOf('S');
    if (maybeStart !== -1) return [maybeStart, y] as Position;
  }

  return impossible();
};

day(10, (input, part) => {
  const maze = input.map((line) => [...line] as MazeCharacter[]);
  const startingPosition = findStartingPosition(maze);
  const loop = findLoop(maze, startingPosition);

  part(1, () => loop.size / 2);
  part(2, () => countInsideLoop(maze, loop));
});
