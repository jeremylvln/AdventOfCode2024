import { Option } from '@swan-io/boxed';

import { AABB } from './geometry.js';
import { day } from './lib.js';

type PartNumber = {
  id: number;
  value: number;
  aabb: AABB;
};

type PartSymbol = {
  symbol: string;
  aabb: AABB;
};

type Gear = readonly [PartNumber, PartNumber];

const isDigit = (char: string): boolean => char >= '0' && char <= '9';

const parsePartNumbers = (input: readonly string[]): readonly PartNumber[] => {
  const partNumbers: PartNumber[] = [];

  for (const [y, line] of input.entries()) {
    let currentParsedNumberMinX: Option<number> = Option.None();

    for (let x = 0; x < line.length; x += 1) {
      if (isDigit(line[x]!)) {
        currentParsedNumberMinX = currentParsedNumberMinX.match({
          Some: (minX) => Option.Some(minX),
          None: () => Option.Some(x),
        });
      } else if (currentParsedNumberMinX.isSome()) {
        const value = Number.parseInt(
          line.slice(currentParsedNumberMinX.value, x),
        );
        partNumbers.push({
          id: partNumbers.length,
          value,
          aabb: new AABB(currentParsedNumberMinX.value, y, x - 1, y),
        });
        currentParsedNumberMinX = Option.None();
      }
    }

    if (currentParsedNumberMinX.isSome()) {
      const value = Number.parseInt(
        line.slice(currentParsedNumberMinX.value, line.length),
      );
      partNumbers.push({
        id: partNumbers.length,
        value,
        aabb: new AABB(currentParsedNumberMinX.value, y, line.length, y),
      });
    }
  }

  return partNumbers;
};

const locatePartSymbols = (input: readonly string[]): readonly PartSymbol[] =>
  input.flatMap((line, y) =>
    [...line]
      .map(
        (symbol, x): Option<PartSymbol> =>
          !isDigit(symbol) && symbol !== '.'
            ? Option.Some({
                symbol,
                aabb: new AABB(x - 1, y - 1, x + 1, y + 1),
              })
            : Option.None(),
      )
      .filter((symbol) => symbol.isSome())
      .map((symbol) => symbol.toNull()!),
  );

const isPartAdjacentToSymbol = (
  partNumber: PartNumber,
  partSymbol: PartSymbol,
): boolean => partNumber.aabb.doesCollideWith(partSymbol.aabb);

const findAdjacentPartNumbers = (
  partNumbers: readonly PartNumber[],
  partSymbols: readonly PartSymbol[],
): readonly PartNumber[] =>
  partSymbols
    .flatMap((partSymbol) =>
      partNumbers.filter(
        (partNumber) =>
          partNumber.aabb.minY >= partSymbol.aabb.minY &&
          partNumber.aabb.minY <= partSymbol.aabb.maxY &&
          isPartAdjacentToSymbol(partNumber, partSymbol),
      ),
    )
    .filter(
      (partNumber, index, partNumbers) =>
        partNumbers.findIndex(
          (partNumber2) => partNumber2.id === partNumber.id,
        ) === index,
    );

const findGears = (
  partNumbers: readonly PartNumber[],
  partSymbols: readonly PartSymbol[],
): readonly Gear[] =>
  partSymbols
    .filter((partSymbol) => partSymbol.symbol === '*')
    .map((partSymbol) => findAdjacentPartNumbers(partNumbers, [partSymbol]))
    .filter((partNumbers) => partNumbers.length === 2)
    .map((partNumbers) => [partNumbers[0]!, partNumbers[1]!] as const);

day(3, (input, part) => {
  const partNumbers = parsePartNumbers(input);
  const partSymbols = locatePartSymbols(input);

  part(1, () =>
    findAdjacentPartNumbers(partNumbers, partSymbols).reduce(
      (accumulator, partNumber) => accumulator + partNumber.value,
      0,
    ),
  );

  part(2, () =>
    findGears(partNumbers, partSymbols)
      .map(([partOne, partTwo]) => partOne.value * partTwo.value)
      .reduce((accumulator, gearValue) => accumulator + gearValue, 0),
  );
});
