import { day } from './lib.js';

type History = readonly number[];

const deriveDifferenceForward = (history: History): number => {
  if (history.every((nb) => nb === 0)) return 0;

  const differences = Array.from(
    { length: history.length - 1 },
    (_, index) => history[index + 1]! - history[index]!,
  );
  return deriveDifferenceForward(differences) + history.at(-1)!;
};

const deriveDifferenceBackward = (history: History): number => {
  if (history.every((nb) => nb === 0)) return 0;

  const differences = Array.from(
    { length: history.length - 1 },
    (_, index) => history[index + 1]! - history[index]!,
  );
  return history[0]! - deriveDifferenceBackward(differences);
};

day(9, (input, part) => {
  const histories: History[] = input.map((line) =>
    line.split(' ').map((s) => Number.parseInt(s)),
  );

  part(1, () =>
    histories
      .map((history) => deriveDifferenceForward(history))
      .reduce((a, b) => a + b, 0),
  );
  part(2, () =>
    histories
      .map((history) => deriveDifferenceBackward(history))
      .reduce((a, b) => a + b, 0),
  );
});
