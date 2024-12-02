import { day } from './lib.js';

type Scratchcard = {
  id: number;
  winningNumbers: readonly number[];
  numbers: readonly number[];
  copies: number;
};

const countScratchcardMatches = (scratchcard: Scratchcard): number =>
  scratchcard.numbers.filter((nb) => scratchcard.winningNumbers.includes(nb))
    .length;

const countScratchcardPoints = (scratchcard: Scratchcard): number => {
  const matches = countScratchcardMatches(scratchcard);

  if (matches === 0) return 0;
  return Array.from({ length: matches }, (_, index) => index)
    .slice(1)
    .reduce((accumulator, _) => accumulator * 2, 1);
};

const parseScratchcards = (lines: readonly string[]): readonly Scratchcard[] =>
  lines.map((line) => {
    const [rawCardId, rawScratchcard] = line.split(': ') as [string, string];
    const [rawWinningNumbers, rawNumbers] = rawScratchcard.split(' | ') as [
      string,
      string,
    ];

    const parseNumbers = (raw: string): readonly number[] =>
      raw
        .split(' ')
        .filter((string_) => string_.length > 0)
        .map((nb) => Number.parseInt(nb));

    return {
      id: Number.parseInt(rawCardId.slice(5)),
      winningNumbers: parseNumbers(rawWinningNumbers),
      numbers: parseNumbers(rawNumbers),
      copies: 1,
    };
  });

const duplicateScratchcards = (
  scratchcards: readonly Scratchcard[],
  cardIndex: number = 0,
): readonly Scratchcard[] => {
  if (cardIndex >= scratchcards.length) return scratchcards;

  const card = scratchcards[cardIndex]!;
  const matches = countScratchcardMatches(card);

  for (let cardCopy = 0; cardCopy < card.copies; cardCopy += 1) {
    for (let indexDelta = 0; indexDelta < matches; indexDelta += 1) {
      const cardIndexToDuplicate = cardIndex + indexDelta + 1;
      if (cardIndexToDuplicate < scratchcards.length) {
        scratchcards[cardIndexToDuplicate]!.copies += 1;
      }
    }
  }

  return duplicateScratchcards(scratchcards, cardIndex + 1);
};

day(4, (input, part) => {
  const scratchcards = parseScratchcards(input);

  part(1, () =>
    scratchcards
      .map((scratchcard) => countScratchcardPoints(scratchcard))
      .reduce((accumulator, points) => accumulator + points, 0),
  );

  part(2, () =>
    duplicateScratchcards(scratchcards).reduce(
      (accumulator, scratchcard) => accumulator + scratchcard.copies,
      0,
    ),
  );
});
