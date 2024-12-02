import { day } from './lib.js';

type Color = 'red' | 'green' | 'blue';
type Game = {
  id: number;
  subsets: readonly Map<Color, number>[];
  max: Map<Color, number>;
};

const parseGame = (line: string): Game => {
  const [prefix, subsetsRaw] = line.split(': ') as [string, string];
  const id = prefix.split(' ')[1]!;
  const max = new Map<Color, number>();

  const subsets = subsetsRaw.split('; ').map((subsetRaw) => {
    const parts = subsetRaw.split(', ').map((partRaw) => {
      const [count, color] = partRaw.split(' ') as [string, string];
      return [color as Color, Number.parseInt(count)] as const;
    });

    const subsetMap = new Map<Color, number>();
    for (const [color, count] of parts) {
      subsetMap.set(color, count);
      if (count > (max.get(color) ?? 0)) max.set(color, count);
    }

    return subsetMap;
  });

  return {
    id: Number.parseInt(id),
    subsets,
    max,
  };
};

const isGamePossibleWithAtMost =
  (red: number, green: number, blue: number) =>
  (game: Game): boolean =>
    game.max.get('red')! <= red &&
    game.max.get('green')! <= green &&
    game.max.get('blue')! <= blue;

const getPowerOfGame = (game: Game): number =>
  [...game.max.entries()].reduce(
    (accumulator, [_, count]) => accumulator * count,
    1,
  );

day(2, (input, part) => {
  const games = input.map((line) => parseGame(line));

  part(1, () =>
    games
      .filter(isGamePossibleWithAtMost(12, 13, 14))
      .reduce((accumulator, game) => accumulator + game.id, 0),
  );

  part(2, () =>
    games.reduce((accumulator, game) => accumulator + getPowerOfGame(game), 0),
  );
});
