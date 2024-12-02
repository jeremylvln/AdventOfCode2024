import { Option } from '@swan-io/boxed';

import { day } from './lib.js';
import { chunkArray, createPipeline } from './utils.js';

type Seed = number;
type MappingStep =
  | 'seed-to-soil'
  | 'soil-to-fertilizer'
  | 'fertilizer-to-water'
  | 'water-to-light'
  | 'light-to-temperature'
  | 'temperature-to-humidity'
  | 'humidity-to-location';

type Range = {
  sourceStart: number;
  destinationStart: number;
  length: number;
};

type RangeMapping = {
  ranges: readonly Range[];
};

type PipelineFunction = (nb: number) => number;

const mapSourceToDestination =
  (rangeMapping: RangeMapping): PipelineFunction =>
  (nb: number): number =>
    Option.fromNullable(
      rangeMapping.ranges.find(
        (range) =>
          nb >= range.sourceStart && nb < range.sourceStart + range.length,
      ),
    )
      .map((range) => nb - range.sourceStart + range.destinationStart)
      .getWithDefault(nb);

const applyPipelineToRange = (functions: readonly PipelineFunction[]) => {
  const pipeline = createPipeline(functions);

  return (start: number, length: number): number => {
    let min = Number.MAX_VALUE;

    // console.log(start, length);
    for (let index = 0; index < length; index++) {
      const result = pipeline(start + index);
      if (result < min) min = result;
    }
    // console.log(`-> min = ${min}`);

    return min;
  };
};

const parseSeedsAndMaps = (
  lines: readonly string[],
): readonly [readonly Seed[], Map<MappingStep, RangeMapping>] => {
  let seeds: readonly Seed[] = [];
  const steps = new Map<MappingStep, RangeMapping>();
  let currentStepName: Option<MappingStep> = Option.None();
  let currentStep: Option<RangeMapping> = Option.None();

  for (const line of lines) {
    if (line.trim().length === 0) {
      continue;
    }

    if (line.startsWith('seeds: ')) {
      seeds = line
        .slice('seeds: '.length)
        .split(' ')
        .map((s) => Number.parseInt(s.trim()));
    } else if (line.endsWith(' map:')) {
      if (currentStepName.isSome() && currentStep.isSome()) {
        steps.set(currentStepName.value, currentStep.value);
      }

      currentStepName = Option.Some(
        line.slice(0, line.length - ' map:'.length) as MappingStep,
      );
      currentStep = Option.Some({
        ranges: [],
      });
    } else if (currentStepName.isSome() && currentStep.isSome()) {
      const [destinationStart, sourceStart, length] = line
        .split(' ')
        .map((s) => Number.parseInt(s.trim())) as [number, number, number];

      currentStep.value.ranges = [
        ...currentStep.value.ranges,
        {
          sourceStart,
          destinationStart,
          length,
        },
      ];
    }
  }

  if (currentStepName.isSome() && currentStep.isSome()) {
    steps.set(currentStepName.value, currentStep.value);
  }

  return [seeds, steps];
};

day(5, (input, part) => {
  const [seeds, steps] = parseSeedsAndMaps(input);
  const pipeline: readonly PipelineFunction[] = [
    mapSourceToDestination(steps.get('seed-to-soil')!),
    mapSourceToDestination(steps.get('soil-to-fertilizer')!),
    mapSourceToDestination(steps.get('fertilizer-to-water')!),
    mapSourceToDestination(steps.get('water-to-light')!),
    mapSourceToDestination(steps.get('light-to-temperature')!),
    mapSourceToDestination(steps.get('temperature-to-humidity')!),
    mapSourceToDestination(steps.get('humidity-to-location')!),
  ];

  part(1, () => Math.min(...seeds.map(createPipeline(pipeline))));
  part(2, () =>
    Math.min(
      ...chunkArray(seeds, 2).map(([start, range]) =>
        applyPipelineToRange(pipeline)(start as number, range as number),
      ),
    ),
  );
});
