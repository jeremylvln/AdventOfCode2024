import { day } from './lib.js';

const CARD_VALUES = {
  A: 12,
  K: 11,
  Q: 10,
  J: 9,
  T: 8,
  '9': 7,
  '8': 6,
  '7': 5,
  '6': 4,
  '5': 3,
  '4': 2,
  '3': 1,
  '2': 0,
} as const;

const CARD_VALUES_WITH_JOKER = {
  ...CARD_VALUES,
  J: -1,
} as const;

const CARD_COMBO_VALUES = {
  'five-of-a-kind': 6,
  'four-of-a-kind': 5,
  'full-house': 4,
  'three-of-a-kind': 3,
  'two-pairs': 2,
  'one-pair': 1,
  'high-card': 0,
};

type Card = keyof typeof CARD_VALUES;
type CardCombo = keyof typeof CARD_COMBO_VALUES;

type Hand = {
  cards: readonly Card[];
  combo: CardCombo;
  bid: number;
};

const compareCards =
  (considerJokers: boolean) =>
  (a: Card, b: Card): number =>
    considerJokers
      ? CARD_VALUES_WITH_JOKER[a] - CARD_VALUES_WITH_JOKER[b]
      : CARD_VALUES[a] - CARD_VALUES[b];

const compareHands =
  (considerJokers: boolean) =>
  (a: Hand, b: Hand): number => {
    if (a.combo !== b.combo) {
      return CARD_COMBO_VALUES[a.combo] - CARD_COMBO_VALUES[b.combo];
    }

    for (let cardIndex = 0; cardIndex < 5; cardIndex += 1) {
      const cardA = a.cards[cardIndex]!;
      const cardB = b.cards[cardIndex]!;

      if (cardA === cardB) {
        continue;
      }

      return compareCards(considerJokers)(cardA, cardB);
    }

    return 0;
  };

const countCards = (
  cards: readonly Card[],
  considerJokers: boolean,
): readonly [Card, number][] => {
  const cardCounts = new Map<Card, number>();
  const jokersCount = considerJokers
    ? cards.filter((card) => card === 'J').length
    : 0;
  let highestCardNotJoker: Card | undefined = undefined;
  let highestCardNotJokerCount = 0;

  for (const card of cards) {
    const cardCount = (cardCounts.get(card) ?? 0) + 1;
    cardCounts.set(card, cardCount);

    if (cardCount > highestCardNotJokerCount && card !== 'J') {
      highestCardNotJoker = card;
      highestCardNotJokerCount = cardCount;
    }
  }

  if (jokersCount > 0 && highestCardNotJoker !== undefined) {
    cardCounts.set(highestCardNotJoker, highestCardNotJokerCount + jokersCount);
    cardCounts.delete('J');
  }

  const cardCountsArray = [...cardCounts.entries()];
  return cardCountsArray.toSorted(([, countA], [, countB]) => countB - countA);
};

const identifyCombo = (
  cards: readonly Card[],
  considerJokers: boolean,
): CardCombo => {
  const cardCounts = countCards(cards, considerJokers);

  if (cardCounts[0]![1] === 5) {
    return 'five-of-a-kind';
  } else if (cardCounts[0]![1] === 4) {
    return 'four-of-a-kind';
  } else if (cardCounts[0]![1] === 3 && cardCounts[1]![1] === 2) {
    return 'full-house';
  } else if (cardCounts[0]![1] === 3) {
    return 'three-of-a-kind';
  } else if (cardCounts[0]![1] === 2 && cardCounts[1]![1] === 2) {
    return 'two-pairs';
  } else if (cardCounts[0]![1] === 2) {
    return 'one-pair';
  }

  return 'high-card';
};

const parseHands = (
  lines: readonly string[],
  considerJokers: boolean,
): readonly Hand[] =>
  lines.map((line) => {
    const [cardsString, bid] = line.split(' ') as [string, string];
    const cards = [...cardsString] as Card[];

    return {
      cards,
      combo: identifyCombo(cards, considerJokers),
      bid: Number.parseInt(bid),
    };
  });

day(7, (input, part) => {
  const hands = parseHands(input, false);
  const handsWithJoker = parseHands(input, true);

  const getTotalWinnings = (hands: readonly Hand[], considerJokers: boolean) =>
    hands
      .toSorted(compareHands(considerJokers))
      .reduce(
        (accumulator, hand, rank) => accumulator + hand.bid * (rank + 1),
        0,
      );

  part(1, () => getTotalWinnings(hands, false));
  part(2, () => getTotalWinnings(handsWithJoker, true));
});
