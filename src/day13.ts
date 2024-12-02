import { Option } from '@swan-io/boxed';

import { day } from './lib.js';
import { sum } from './math.js';
import { impossible } from './utils.js';

type PatternChar = '.' | '#';
type Pattern = PatternChar[][];
type ReflectionAxis = 'vertical' | 'horizontal';
type ReflectionIndex = [axis: ReflectionAxis, posM1: number];

const testReflection = (
  pattern: Pattern,
  [axis, posM1]: ReflectionIndex,
): boolean => {
  if (axis === 'vertical') {
    const lookupDelta = Math.min(posM1 + 1, pattern[0]!.length - posM1 - 1);

    for (let delta = 0; delta < lookupDelta; delta += 1) {
      const x1 = posM1 - delta;
      const x2 = posM1 + 1 + delta;

      if (!pattern.every((line) => line[x1] === line[x2])) {
        return false;
      }
    }
  } else {
    const lookupDelta = Math.min(posM1 + 1, pattern.length - posM1 - 1);

    for (let delta = 0; delta < lookupDelta; delta += 1) {
      const y1 = posM1 - delta;
      const y2 = posM1 + 1 + delta;

      if (!pattern[y1]!.every((char, index) => char === pattern[y2]![index])) {
        return false;
      }
    }
  }

  return true;
};

const findReflection = (
  pattern: Pattern,
  omit: Option<ReflectionIndex>,
): Option<ReflectionIndex> => {
  const canTest = (axis: ReflectionAxis, posM1: number): boolean =>
    omit.isNone() || omit.value[0] !== axis || omit.value[1] !== posM1;

  for (let x = 1; x < pattern[0]!.length - 1; x += 1) {
    if (!canTest('vertical', x)) continue;

    if (testReflection(pattern, ['vertical', x])) {
      return Option.Some(['vertical', x]);
    }
  }

  for (let y = 1; y < pattern.length - 1; y += 1) {
    if (!canTest('horizontal', y)) continue;

    if (testReflection(pattern, ['horizontal', y])) {
      return Option.Some(['horizontal', y]);
    }
  }

  if (canTest('vertical', 0) && testReflection(pattern, ['vertical', 0])) {
    return Option.Some(['vertical', 0]);
  }

  if (canTest('horizontal', 0) && testReflection(pattern, ['horizontal', 0])) {
    return Option.Some(['horizontal', 0]);
  }

  return Option.None();
};

const tryAllSmudges = (
  pattern: Pattern,
  defaultReflection: ReflectionIndex,
): ReflectionIndex => {
  for (let y = 0; y < pattern.length; y += 1) {
    for (let x = 0; x < pattern[0]!.length; x += 1) {
      const beforeChar = pattern[y]![x]!;
      pattern[y]![x] = beforeChar === '#' ? '.' : '#';

      const reflection = findReflection(
        pattern,
        Option.Some(defaultReflection),
      );

      if (reflection.isSome()) {
        return reflection.value;
      }

      pattern[y]![x] = beforeChar;
    }
  }

  return impossible();
};

const getReflectionScore = (reflection: ReflectionIndex): number =>
  reflection[0] === 'vertical' ? reflection[1] + 1 : 100 * (reflection[1] + 1);

const parsePatterns = (lines: readonly string[]): readonly Pattern[] => {
  const patterns: Pattern[] = [];
  let patternStart = 0;

  for (let index = 0; index < lines.length; index += 1) {
    if (lines[index]!.trim() === '') {
      patterns.push(
        lines
          .slice(patternStart, index)
          .map((line) => [...line] as PatternChar[]),
      );
      patternStart = index + 1;
    }
  }

  patterns.push(
    lines.slice(patternStart).map((line) => [...line] as PatternChar[]),
  );

  return patterns;
};

day(13, (input, part) => {
  const patterns = parsePatterns(input);

  const patternToReflection = new Map<Pattern, ReflectionIndex>();
  for (const pattern of patterns) {
    patternToReflection.set(
      pattern,
      findReflection(pattern, Option.None()).toNull()!,
    );
  }

  part(1, () =>
    sum(
      [...patternToReflection.values()].map((reflection) =>
        getReflectionScore(reflection),
      ),
    ),
  );

  part(2, () =>
    sum(
      [...patternToReflection.entries()]
        .map(([pattern, defaultReflection]) =>
          tryAllSmudges(pattern, defaultReflection),
        )
        .map((reflection) => getReflectionScore(reflection)),
    ),
  );
});
