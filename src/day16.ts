import { match } from 'ts-pattern';

import { day } from './lib.js';
import { Readonly2DArray } from './utils.js';

type SplitterChar = '|' | '-';
type MirrorChar = '/' | '\\';
type GridChar = '.' | SplitterChar | MirrorChar;
type Grid = Readonly2DArray<GridChar>;

type Direction = 'up' | 'down' | 'left' | 'right';
type Beam = {
  x: number;
  y: number;
  direction: Direction;
};

type VisitedMap = Map<`${number},${number}`, Set<Direction>>;

const POSITION_DELTA: Record<Direction, [number, number]> = {
  up: [-1, 0],
  down: [1, 0],
  left: [0, -1],
  right: [0, 1],
};

const isInImpossiblePosition = (grid: Grid, beam: Beam): boolean =>
  beam.y < 0 ||
  beam.y == grid.length ||
  beam.x < 0 ||
  beam.x == grid[beam.y]!.length;

const isPathAlreadyVisited = (beam: Beam, visited: VisitedMap): boolean =>
  visited.has(`${beam.y},${beam.x}`) &&
  visited.get(`${beam.y},${beam.x}`)!.has(beam.direction);

const onEncounteringDot = (beam: Beam): Beam[] => {
  beam.y += POSITION_DELTA[beam.direction][0];
  beam.x += POSITION_DELTA[beam.direction][1];
  return [];
};

const onEncounteringSplitter = (beam: Beam, splitter: SplitterChar): Beam[] => {
  if (beam.direction === 'up' || beam.direction === 'down') {
    if (splitter === '|') {
      beam.y += POSITION_DELTA[beam.direction][0];
      beam.x += POSITION_DELTA[beam.direction][1];
      return [];
    } else {
      beam.x -= 1;
      beam.direction = 'left';

      return [
        {
          y: beam.y,
          x: beam.x + 2,
          direction: 'right',
        },
      ];
    }
  } else if (splitter === '-') {
    beam.y += POSITION_DELTA[beam.direction][0];
    beam.x += POSITION_DELTA[beam.direction][1];
    return [];
  } else {
    beam.y -= 1;
    beam.direction = 'up';

    return [
      {
        y: beam.y + 2,
        x: beam.x,
        direction: 'down',
      },
    ];
  }
};

const onEncounteringMirror = (beam: Beam, mirror: MirrorChar): Beam[] => {
  match([beam.direction, mirror])
    .with(['up', '/'], () => {
      beam.x += 1;
      beam.direction = 'right';
    })
    .with(['down', '/'], () => {
      beam.x -= 1;
      beam.direction = 'left';
    })
    .with(['left', '/'], () => {
      beam.y += 1;
      beam.direction = 'down';
    })
    .with(['right', '/'], () => {
      beam.y -= 1;
      beam.direction = 'up';
    })
    .with(['up', '\\'], () => {
      beam.x -= 1;
      beam.direction = 'left';
    })
    .with(['down', '\\'], () => {
      beam.x += 1;
      beam.direction = 'right';
    })
    .with(['left', '\\'], () => {
      beam.y -= 1;
      beam.direction = 'up';
    })
    .with(['right', '\\'], () => {
      beam.y += 1;
      beam.direction = 'down';
    })
    .exhaustive();

  return [];
};

const simulateBeams = (grid: Grid, startingBeam: Beam): number => {
  let beams: Beam[] = [startingBeam];
  const visited = new Map<`${number},${number}`, Set<Direction>>();

  while (beams.length > 0) {
    const currentBeamCount = beams.length;

    for (let beamIndex = 0; beamIndex < currentBeamCount; beamIndex += 1) {
      const beam = beams[beamIndex]!;
      const standingOn = grid[beam.y]![beam.x]!;

      if (visited.has(`${beam.y},${beam.x}`)) {
        visited.get(`${beam.y},${beam.x}`)!.add(beam.direction);
      } else {
        visited.set(`${beam.y},${beam.x}`, new Set([beam.direction]));
      }

      const newBeams = match(standingOn)
        .with('.', () => onEncounteringDot(beam))
        .with('|', '-', (splitter) => onEncounteringSplitter(beam, splitter))
        .with('/', '\\', (mirror) => onEncounteringMirror(beam, mirror))
        .exhaustive();

      beams.push(...newBeams);
    }

    beams = beams.filter(
      (beam) =>
        !isInImpossiblePosition(grid, beam) &&
        !isPathAlreadyVisited(beam, visited),
    );
  }

  return visited.size;
};

const createAllStartingBeams = (grid: Grid): Beam[] => {
  const beams: Beam[] = [
    {
      y: 0,
      x: 0,
      direction: 'right',
    },
    {
      y: 0,
      x: 0,
      direction: 'down',
    },
    {
      y: 0,
      x: grid[0]!.length - 1,
      direction: 'left',
    },
    {
      y: 0,
      x: grid[0]!.length - 1,
      direction: 'down',
    },
    {
      y: grid.length - 1,
      x: grid[0]!.length - 1,
      direction: 'up',
    },
    {
      y: grid.length - 1,
      x: grid[0]!.length - 1,
      direction: 'left',
    },
    {
      y: grid.length - 1,
      x: 0,
      direction: 'up',
    },
    {
      y: grid.length - 1,
      x: 0,
      direction: 'right',
    },
  ];

  for (let x = 0; x < grid[0]!.length - 1; x += 1) {
    beams.push(
      {
        y: 0,
        x,
        direction: 'down',
      },
      {
        y: grid.length - 1,
        x,
        direction: 'up',
      },
    );
  }

  for (let y = 0; y < grid.length - 1; y += 1) {
    beams.push(
      {
        y,
        x: 0,
        direction: 'right',
      },
      {
        y,
        x: grid[0]!.length - 1,
        direction: 'left',
      },
    );
  }

  return beams;
};

day(16, (input, part) => {
  const grid = input.map((line) => [...line] as GridChar[]);

  part(1, () => simulateBeams(grid, { x: 0, y: 0, direction: 'right' }));
  part(2, () =>
    Math.max(
      ...createAllStartingBeams(grid).map((startingBeam) =>
        simulateBeams(grid, startingBeam),
      ),
    ),
  );
});
