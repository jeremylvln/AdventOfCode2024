import { match } from 'ts-pattern';

import { shoelace } from './geometry.js';
import { day } from './lib.js';
import { Point } from './math.js';

type Direction = 'U' | 'D' | 'L' | 'R';
type Instruction = {
  direction: Direction;
  length: number;
  hex: `#${string}`;
};

const parseInstructions = (input: readonly string[]): Instruction[] =>
  input.map((line) => {
    const [direction, length, hexParenthesis] = line.split(' ') as [
      Direction,
      string,
      string,
    ];

    return {
      direction,
      length: Number.parseInt(length),
      hex: hexParenthesis.slice(1, -1) as `#${string}`,
    };
  });

const constructEdges = (instructions: readonly Instruction[]): Point[] => {
  const edges: Point[] = [];
  let y = 0;
  let x = 0;

  for (const instruction of instructions) {
    match(instruction.direction)
      .with('U', () => {
        y -= instruction.length;
      })
      .with('D', () => {
        y += instruction.length;
      })
      .with('L', () => {
        x -= instruction.length;
      })
      .with('R', () => {
        x += instruction.length;
      })
      .exhaustive();

    edges.push(new Point(x, y));
  }

  return edges.filter(
    ({ x, y }, index) =>
      edges.findIndex((edge) => edge.y === y && edge.x === x) === index,
  );
};

const countArea = (edges: readonly Point[]): number => {
  let perimeter = 0;

  for (let index = 0; index < edges.length; index++) {
    const current = edges[index]!;
    const next = edges[(index + 1) % edges.length]!;
    perimeter += Math.abs(current.x - next.x) + Math.abs(current.y - next.y);
  }

  return shoelace(edges) + perimeter / 2 + 1;
};

const fixInstructionsForHex = (instructions: Instruction[]): Instruction[] =>
  instructions.map((instruction): Instruction => {
    return {
      direction: (['R', 'D', 'L', 'U'] as const).at(
        Number.parseInt(instruction.hex.at(-1)!),
      )!,
      length: Number.parseInt(instruction.hex.slice(1, -1), 16),
      hex: '#000000',
    };
  });

day(18, (input, part) => {
  const instructions = parseInstructions(input);

  part(1, () => {
    const edges = constructEdges(instructions);
    return countArea(edges);
  });

  part(2, () => {
    const edges = constructEdges(fixInstructionsForHex(instructions));
    return countArea(edges);
  });
});
