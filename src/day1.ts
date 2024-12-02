import { Option } from '@swan-io/boxed';

import { day } from './lib.js';

const DIGIT_LITERALS = {
  '0': 0,
  '1': 1,
  '2': 2,
  '3': 3,
  '4': 4,
  '5': 5,
  '6': 6,
  '7': 7,
  '8': 8,
  '9': 9,
} as const;

const DIGIT_LITERALS_WITH_WRITTEN = {
  ...DIGIT_LITERALS,
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
} as const;

const findDigit = (
  dictionnary: Record<string, number>,
  line: string,
  from: number,
  step: 1 | -1,
): Option<number> => {
  for (let index = from; index < line.length && index >= 0; index += step) {
    const found = Option.fromNullable(
      Object.entries(dictionnary).find(([digitText]) =>
        line.slice(index).startsWith(digitText),
      ),
    ).map(([_, digitValue]) => digitValue);

    if (found.isSome()) return found;
  }

  return Option.None();
};

const findFirstDigit = (
  dictionnary: Record<string, number>,
  line: string,
): number => findDigit(dictionnary, line, 0, 1).toUndefined()!;

const findLastDigit = (
  dictionnary: Record<string, number>,
  line: string,
): number => findDigit(dictionnary, line, line.length - 1, -1).toUndefined()!;

const findFullNumber =
  (dictionnary: Record<string, number>) =>
  (line: string): number => {
    const firstDigit = findFirstDigit(dictionnary, line);
    const lastDigit = findLastDigit(dictionnary, line);
    return Number.parseInt(`${firstDigit}${lastDigit}`);
  };

day(1, (input, part) => {
  part(1, () =>
    input
      .map(findFullNumber(DIGIT_LITERALS))
      .reduce((accumulator, nb) => accumulator + nb, 0),
  );

  part(2, () =>
    input
      .map(findFullNumber(DIGIT_LITERALS_WITH_WRITTEN))
      .reduce((accumulator, nb) => accumulator + nb, 0),
  );
});
