import { match } from 'ts-pattern';

import { day } from './lib.js';
import { sum } from './math.js';
import { NonEmptyArray, memoize } from './utils.js';

type Spring = '.' | '#' | '?';
type Row = {
  springs: Spring[];
  lengths: number[];
};

const createResolver = () => {
  const self = memoize(
    (springs: readonly Spring[], lengths: readonly number[]): number => {
      if (springs.length === 0) {
        return lengths.length === 0 ? 1 : 0;
      }

      const [currentSpring, ...remainingSprings] =
        springs as NonEmptyArray<Spring>;

      return match(currentSpring)
        .with('.', () => self(remainingSprings, lengths))
        .with(
          '?',
          () =>
            self(['#', ...remainingSprings], lengths) +
            self(['.', ...remainingSprings], lengths),
        )
        .with('#', () => {
          if (lengths.length === 0) {
            return 0;
          }

          const [currentLength, ...remainingLengths] =
            lengths as NonEmptyArray<number>;

          let blockLength = 0;
          while (springs[blockLength] === '#' || springs[blockLength] === '?') {
            blockLength += 1;
          }

          if (blockLength < currentLength || springs[currentLength] === '#') {
            return 0;
          }

          return self(springs.slice(currentLength + 1), remainingLengths);
        })
        .exhaustive();
    },
    (springs, lengths) => `${springs.join('')}:${lengths.join(',')}}`,
  );

  return self;
};

const unfoldRow = (row: Row, factor: number): Row => {
  const expandedRow: Row = {
    springs: [],
    lengths: [],
  };

  for (let index = 0; index < factor; index += 1) {
    expandedRow.springs.push(...row.springs, '?');
    expandedRow.lengths.push(...row.lengths);
  }

  expandedRow.springs.pop();
  return expandedRow;
};

const parseRows = (lines: readonly string[]): Row[] =>
  lines.map((line) => {
    const [springsRaw, lengthsRaw] = line.split(' ') as [string, string];
    return {
      springs: [...springsRaw] as Spring[],
      lengths: lengthsRaw.split(',').map((s) => Number.parseInt(s)),
    };
  });

day(12, (input, part) => {
  const rows = parseRows(input);

  part(1, () =>
    sum(rows.map((row) => createResolver()(row.springs, row.lengths))),
  );

  part(2, () =>
    sum(
      rows
        .map((row) => unfoldRow(row, 5))
        .map((row) => createResolver()(row.springs, row.lengths)),
    ),
  );
});
