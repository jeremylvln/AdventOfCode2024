import { day } from './lib.js';

type Constraint = {
  before: number;
  after: number;
};

type Update = readonly number[];

const parseInput = (input: readonly string[]): [Constraint[], Update[]] => {
  const constraints: Constraint[] = [];
  const updates: Update[] = [];
  let isParsingConstraints = true;

  for (const line of input) {
    if (line === '') {
      isParsingConstraints = false;
      continue;
    }

    if (isParsingConstraints) {
      const [before, after] = line
        .split('|')
        .map((p) => Number.parseInt(p)) as [number, number];

      constraints.push({ before, after });
    } else {
      updates.push(line.split(',').map((p) => Number.parseInt(p)));
    }
  }

  return [constraints, updates];
};

const isUpdateValid = (
  constraints: readonly Constraint[],
  update: Update,
): boolean => {
  for (let index = 0; index < update.length; index += 1) {
    const constraintsAsBefore = constraints.filter(
      ({ before }) => before === update[index],
    );
    const constraintsAsAfter = constraints.filter(
      ({ after }) => after === update[index],
    );

    for (let checkIndex = 0; checkIndex < index; checkIndex += 1) {
      if (
        constraintsAsBefore.some(({ after }) => after === update[checkIndex])
      ) {
        return false;
      }
    }

    for (
      let checkIndex = index + 1;
      checkIndex < update.length;
      checkIndex += 1
    ) {
      if (
        constraintsAsAfter.some(({ before }) => before === update[checkIndex])
      ) {
        return false;
      }
    }
  }

  return true;
};

const sortUpdatesWithValidity = (
  constraints: readonly Constraint[],
  updates: readonly Update[],
): [valid: Update[], invalid: Update[]] => {
  const valid: Update[] = [];
  const invalid: Update[] = [];

  for (const update of updates) {
    if (isUpdateValid(constraints, update)) {
      valid.push(update);
    } else {
      invalid.push(update);
    }
  }

  return [valid, invalid];
};

const fixUpdate = (
  constraints: readonly Constraint[],
  update: Update,
): Update => {
  const fixedUpdate = [...update];
  let stop = false;

  for (let index = 0; index < fixedUpdate.length; index += 1) {
    const constraintsAsBefore = constraints.filter(
      ({ before }) => before === fixedUpdate[index],
    );
    const constraintsAsAfter = constraints.filter(
      ({ after }) => after === fixedUpdate[index],
    );

    stop = false;

    for (let checkIndex = 0; checkIndex < index; checkIndex += 1) {
      const violatedConstraint = constraintsAsBefore.find(
        ({ after }) => after === fixedUpdate[checkIndex],
      );

      if (violatedConstraint) {
        fixedUpdate[checkIndex] = violatedConstraint.before;
        fixedUpdate[index] = violatedConstraint.after;
        index = 0;

        stop = true;
        break;
      }
    }

    if (stop) break;

    for (
      let checkIndex = index + 1;
      checkIndex < fixedUpdate.length;
      checkIndex += 1
    ) {
      const violatedConstraint = constraintsAsAfter.find(
        ({ before }) => before === fixedUpdate[checkIndex],
      );

      if (violatedConstraint) {
        fixedUpdate[checkIndex] = violatedConstraint.after;
        fixedUpdate[index] = violatedConstraint.before;
        index = 0;

        stop = true;
        break;
      }
    }

    if (isUpdateValid(constraints, fixedUpdate)) {
      return fixedUpdate;
    }
  }

  return fixUpdate(constraints, fixedUpdate);
};

const sumUpdates = (updates: readonly Update[]): number =>
  updates.reduce(
    (accumulator, update) =>
      accumulator + update[Math.floor(update.length / 2)]!,
    0,
  );

day(5, (input, part) => {
  const [constraints, updates] = parseInput(input);
  const [validUpdates, invalidUpdates] = sortUpdatesWithValidity(
    constraints,
    updates,
  );

  part(1, () => sumUpdates(validUpdates));
  part(2, () =>
    sumUpdates(invalidUpdates.map((update) => fixUpdate(constraints, update))),
  );
});
