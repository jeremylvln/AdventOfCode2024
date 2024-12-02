import { day } from './lib.js';

type Race = {
  duration: number;
  bestDistance: number;
};

type RaceStrategy = {
  holdingDuration: number;
  expectedDistance: number;
};

const listWinningStrategies = (race: Race): readonly RaceStrategy[] => {
  const strategies: RaceStrategy[] = [];

  for (
    let holdingDuration = 1;
    holdingDuration < race.duration;
    holdingDuration += 1
  ) {
    const remainingDuration = race.duration - holdingDuration;
    const expectedDistance = holdingDuration * remainingDuration;
    if (expectedDistance > race.bestDistance) {
      strategies.push({
        holdingDuration,
        expectedDistance,
      });
    }
  }

  return strategies;
};

const parseRaceWithoutSpaces = (
  timeLine: string,
  distanceLine: string,
): Race => {
  const time = Number.parseInt(timeLine.split(':')[1]!.replaceAll(/\s/g, ''));
  const distance = Number.parseInt(
    distanceLine.split(':')[1]!.replaceAll(/\s/g, ''),
  );

  return {
    duration: time,
    bestDistance: distance,
  };
};

const parseRaces = (
  timeLine: string,
  distanceLine: string,
): readonly Race[] => {
  const times = timeLine
    .split(':')[1]!
    .split(' ')
    .filter((s) => s.length > 0)
    .map((s) => Number.parseInt(s));
  const distances = distanceLine
    .split(':')[1]!
    .split(' ')
    .filter((s) => s.length > 0)
    .map((s) => Number.parseInt(s));

  return times.map((duration, index) => ({
    duration,
    bestDistance: distances[index]!,
  }));
};

day(6, (input, part) => {
  const races = parseRaces(input[0]!, input[1]!);
  const raceWithoutSpaces = parseRaceWithoutSpaces(input[0]!, input[1]!);

  part(1, () =>
    races
      .map((race) => listWinningStrategies(race).length)
      .reduce((accumulator, count) => accumulator * count, 1),
  );

  part(2, () => listWinningStrategies(raceWithoutSpaces).length);
});
