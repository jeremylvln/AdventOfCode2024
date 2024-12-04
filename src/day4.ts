import { day } from './lib.js';
import { Readonly2DArray } from './utils.js';

const countOccurencesOfWordAtPos = (
  grid: Readonly2DArray<string>,
  word: string,
  y: number,
  x: number,
): number => {
  const candidates = [
    // Horizontal forward
    Array.from(
      { length: word.length },
      (_, index) => grid[y]?.[x + index],
    ).join(''),
    // Horizontal backward
    Array.from(
      { length: word.length },
      (_, index) => grid[y]?.[x - index],
    ).join(''),
    // Vertical up
    Array.from(
      { length: word.length },
      (_, index) => grid[y - index]?.[x],
    ).join(''),
    // Vertical down
    Array.from(
      { length: word.length },
      (_, index) => grid[y + index]?.[x],
    ).join(''),
    // Diagonal up-right
    Array.from(
      { length: word.length },
      (_, index) => grid[y - index]?.[x + index],
    ).join(''),
    // Diagonal down-right
    Array.from(
      { length: word.length },
      (_, index) => grid[y + index]?.[x + index],
    ).join(''),
    // Diagonal down-left
    Array.from(
      { length: word.length },
      (_, index) => grid[y + index]?.[x - index],
    ).join(''),
    // Diagonal up-left
    Array.from(
      { length: word.length },
      (_, index) => grid[y - index]?.[x - index],
    ).join(''),
  ];

  return candidates.filter((candidate) => candidate === word).length;
};

const findWord = (grid: Readonly2DArray<string>, word: string): number => {
  let occurences = 0;

  for (let y = 0; y < grid.length; y += 1) {
    for (let x = 0; x < grid[0]!.length; x += 1) {
      if (grid[y]![x] !== word[0]!) continue;
      occurences += countOccurencesOfWordAtPos(grid, word, y, x);
    }
  }

  return occurences;
};

const findXDashMas = (grid: Readonly2DArray<string>): number => {
  let occurences = 0;

  for (let y = 0; y < grid.length; y += 1) {
    for (let x = 0; x < grid[0]!.length; x += 1) {
      if (grid[y]![x] !== 'A') continue;

      const candidates = [
        grid[y - 1]?.[x - 1] + 'A' + grid[y + 1]?.[x + 1],
        grid[y - 1]?.[x + 1] + 'A' + grid[y + 1]?.[x - 1],
      ];

      occurences += candidates.every((word) => word === 'MAS' || word === 'SAM')
        ? 1
        : 0;
    }
  }

  return occurences;
};

day(4, (input, part) => {
  const grid = input.map((line) => [...line]);

  part(1, () => findWord(grid, 'XMAS'));

  part(2, () => findXDashMas(grid));
});
