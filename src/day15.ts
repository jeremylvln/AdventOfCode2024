import { day } from './lib.js';
import { sum } from './math.js';

type Lens = string;
type SequenceStepEqual = `${Lens}=${number}`;
type SequenceStepRemove = `${Lens}-`;
type SequenceStep = SequenceStepEqual | SequenceStepRemove;
type State = {
  boxes: Map<number, Lens[]>;
  lensToFocalLength: Map<Lens, number>;
};

const isSequenceStepEqual = (step: SequenceStep): step is SequenceStepEqual =>
  step.includes('=');
const isSequenceStepRemove = (step: SequenceStep): step is SequenceStepRemove =>
  step.includes('-');

const hash = (text: string): number =>
  [...text].reduce((hash, char) => {
    hash += char.codePointAt(0)!;
    hash *= 17;
    hash %= 256;
    return hash;
  }, 0);

const applyStep = (state: State, step: SequenceStep): void => {
  if (isSequenceStepEqual(step)) {
    const [lens, focalLength] = step.split('=') as [string, string];
    state.lensToFocalLength.set(lens, Number.parseInt(focalLength));

    const boxIndex = hash(lens);

    if (state.boxes.has(boxIndex)) {
      if (!state.boxes.get(boxIndex)!.includes(lens))
        state.boxes.get(boxIndex)!.push(lens);
    } else {
      state.boxes.set(boxIndex, [lens]);
    }
  } else if (isSequenceStepRemove(step)) {
    const lens = step.slice(0, -1);
    const boxIndex = hash(lens);

    if (state.boxes.has(boxIndex)) {
      const lenses = state.boxes.get(boxIndex)!;
      const lensIndex = lenses.indexOf(lens);
      if (lensIndex !== -1) {
        lenses.splice(lensIndex, 1);

        if (lenses.length === 0) state.boxes.delete(boxIndex);
      }
    }
  }
};

const getFocusingPower = (state: State): number => {
  let accumulator = 0;

  for (const [boxIndex, lenses] of state.boxes.entries()) {
    for (const [lensIndex, lens] of lenses.entries()) {
      const focusingPower =
        (boxIndex + 1) * (lensIndex + 1) * state.lensToFocalLength.get(lens)!;
      accumulator += focusingPower;
    }
  }

  return accumulator;
};

day(15, (input, part) => {
  const sequenceSteps = input[0]!.split(',') as SequenceStep[];

  part(1, () => sum(sequenceSteps.map((step) => hash(step))));
  part(2, () => {
    const state: State = {
      boxes: new Map(),
      lensToFocalLength: new Map(),
    };

    for (const step of sequenceSteps) {
      applyStep(state, step);
    }

    return getFocusingPower(state);
  });
});
