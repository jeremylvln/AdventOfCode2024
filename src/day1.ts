import { day } from './lib.js';

const parsePairs = (lines: readonly string[]): [Array<number>, Array<number>] =>
  lines.reduce(
    (accumulator, line) => {
      const [aRaw, bRaw] = line.split('   ') as [string, string];
      const [a, b] = [Number.parseInt(aRaw), Number.parseInt(bRaw)];
      accumulator[0].push(a);
      accumulator[1].push(b);
      return accumulator;
    },
    [[], []] as [Array<number>, Array<number>],
  );

const difference = (a: readonly number[], b: readonly number[]): number => {
  const [aSorted, bSorted] = [a.toSorted(), b.toSorted()];

  return aSorted.reduce(
    (accumulator, a, index) => accumulator + Math.abs(a - bSorted[index]!),
    0,
  );
};

const occurences = (list: readonly number[]): Record<number, number> =>
  list.reduce(
    (accumulator, nb) => {
      accumulator[nb] = (accumulator[nb] ?? 0) + 1;
      return accumulator;
    },
    {} as Record<number, number>,
  );

day(1, (input, part) => {
  const [aList, bList] = parsePairs(input);

  part(1, () => difference(aList, bList));

  part(2, () => {
    const occurencesOfB = occurences(bList);
    return aList.reduce(
      (accumulator, nb) => accumulator + nb * (occurencesOfB[nb] ?? 0),
      0,
    );
  });
});
