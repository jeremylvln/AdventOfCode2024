import { Option } from '@swan-io/boxed';
import { match } from 'ts-pattern';

import { day } from './lib.js';
import { Range, sum } from './math.js';
import { impossible } from './utils.js';

type WorkflowName = string;
type Category = 'x' | 'm' | 'a' | 's';

type Condition =
  | {
      type: 'compare';
      category: Category;
      comparison: '>' | '<';
      value: number;
      redirectTo: WorkflowName;
    }
  | {
      type: 'direct';
      redirectTo: WorkflowName;
    };

type Workflow = {
  name: string;
  conditions: readonly Condition[];
};

type Part = {
  [category in Category]: number;
};

type WorkflowMap = Map<WorkflowName, Workflow>;
type WorkflowPartsMap = Map<WorkflowName, Part[]>;
type WorkflowCombinationsMap = Map<WorkflowName, RangeCombination[]>;

type Outcome = 'A' | 'R';

type RangeCombination = {
  [category in Category]: Range;
};

const parseWorkflow = (line: string): Workflow => {
  const name = line.split('{')[0]!;
  const rawConditions = line
    .slice(line.indexOf('{') + 1, line.indexOf('}'))!
    .split(',');

  const conditions = rawConditions.map((rawCondition): Condition => {
    if (rawCondition.includes(':')) {
      const [rawComparison, redirectTo] = rawCondition.split(':') as [
        string,
        string,
      ];

      const compareLocation = [...rawComparison].findIndex((char) =>
        ['>', '<'].includes(char),
      );

      return {
        type: 'compare',
        category: rawComparison.slice(0, compareLocation) as Category,
        comparison: rawComparison[compareLocation] as '>' | '<',
        value: Number.parseInt(rawComparison.slice(compareLocation + 1)),
        redirectTo,
      };
    } else {
      return {
        type: 'direct',
        redirectTo: rawCondition,
      };
    }
  });

  return {
    name,
    conditions,
  };
};

const parsePart = (line: string): Part => {
  const categories = line
    .slice(1, -1)
    .split(',')
    .map((rawCategory) => rawCategory.split('=') as [Category, string])
    .map(([category, value]) => [category, Number.parseInt(value)] as const);

  const part: Part = {
    x: 0,
    m: 0,
    a: 0,
    s: 0,
  };

  for (const [category, value] of categories) {
    part[category] = value;
  }

  return part;
};

const parseWorkflowsAndParts = (
  input: readonly string[],
): [workflows: WorkflowMap, parts: readonly Part[]] => {
  const workflows: WorkflowMap = new Map();
  const parts: Part[] = [];
  let hasSeenEmptyLine = false;

  for (const line of input) {
    if (line === '') {
      hasSeenEmptyLine = true;
      continue;
    }

    if (hasSeenEmptyLine) {
      parts.push(parsePart(line));
    } else {
      const workflow = parseWorkflow(line);
      workflows.set(workflow.name, workflow);
    }
  }

  return [workflows, parts];
};

const applyWorkflowToPart = (
  partsOnWorkflows: WorkflowPartsMap,
  workflow: Workflow,
  part: Part,
): Option<Outcome> => {
  let redirectTo = Option.None<WorkflowName>();

  for (const condition of workflow.conditions) {
    if (condition.type === 'direct') {
      redirectTo = Option.Some(condition.redirectTo);
      break;
    }

    if (
      (condition.comparison === '<' &&
        part[condition.category] < condition.value) ||
      (condition.comparison === '>' &&
        part[condition.category] > condition.value)
    ) {
      redirectTo = Option.Some(condition.redirectTo);
      break;
    }
  }

  if (redirectTo.isNone()) {
    return impossible();
  }

  if (redirectTo.value === 'A' || redirectTo.value === 'R') {
    return Option.Some(redirectTo.value);
  }

  if (partsOnWorkflows.has(redirectTo.value)) {
    partsOnWorkflows.get(redirectTo.value)!.push(part);
  } else {
    partsOnWorkflows.set(redirectTo.value, [part]);
  }

  return Option.None();
};

const sortParts = (workflows: WorkflowMap, parts: readonly Part[]): Part[] => {
  const partsOnWorkflows: WorkflowPartsMap = new Map();
  const acceptedParts: Part[] = [];
  partsOnWorkflows.set('in', [...parts]);

  while (partsOnWorkflows.size > 0) {
    for (const [workflowName, parts] of partsOnWorkflows) {
      const workflow = workflows.get(workflowName)!;

      for (const part of parts.splice(0)) {
        const outcome = applyWorkflowToPart(partsOnWorkflows, workflow, part);
        if (outcome.isSome() && outcome.value === 'A') {
          acceptedParts.push(part);
        }
      }

      if (parts.length === 0) {
        partsOnWorkflows.delete(workflowName);
      }
    }
  }

  return acceptedParts;
};

const applyWorkflowToCombination = (
  combinationsOnWorkflows: WorkflowCombinationsMap,
  workflow: Workflow,
  combination: RangeCombination,
): RangeCombination[] => {
  const rangeToRedirect = new Map<RangeCombination, WorkflowName>();
  const acceptedRanges: RangeCombination[] = [];
  const patchedCombination = combination;

  for (const condition of workflow.conditions) {
    if (condition.type === 'direct') {
      rangeToRedirect.set(patchedCombination, condition.redirectTo);
      break;
    }

    const rangeToTest = patchedCombination[condition.category];

    if (rangeToTest.includes(condition.value)) {
      const newRangeForCategory = match(condition.comparison)
        .with('>', () => new Range(condition.value + 1, rangeToTest.max))
        .with('<', () => new Range(rangeToTest.min, condition.value - 1))
        .exhaustive();

      const patchedRangeForCategory = match(condition.comparison)
        .with('>', () => new Range(rangeToTest.min, condition.value))
        .with('<', () => new Range(condition.value, rangeToTest.max))
        .exhaustive();

      const newCombination: RangeCombination = {
        ...patchedCombination,
        [condition.category]: newRangeForCategory,
      };

      patchedCombination[condition.category] = patchedRangeForCategory;
      rangeToRedirect.set(newCombination, condition.redirectTo);
    }
  }

  for (const [newCombination, redirectTo] of rangeToRedirect.entries()) {
    if (redirectTo === 'A') {
      acceptedRanges.push(newCombination);
    } else if (redirectTo !== 'R') {
      if (combinationsOnWorkflows.has(redirectTo)) {
        combinationsOnWorkflows.get(redirectTo)!.push(newCombination);
      } else {
        combinationsOnWorkflows.set(redirectTo, [newCombination]);
      }
    }
  }

  return acceptedRanges;
};

const findAcceptedCombinations = (
  workflows: WorkflowMap,
  combination: RangeCombination,
): RangeCombination[] => {
  const combinationsOnWorkflows: WorkflowCombinationsMap = new Map();
  const acceptedCombinations: RangeCombination[] = [];
  combinationsOnWorkflows.set('in', [combination]);

  while (combinationsOnWorkflows.size > 0) {
    for (const [workflowName, combinations] of combinationsOnWorkflows) {
      const workflow = workflows.get(workflowName)!;

      for (const combination of combinations.splice(0)) {
        const acceptedSubCombinations = applyWorkflowToCombination(
          combinationsOnWorkflows,
          workflow,
          combination,
        );

        acceptedCombinations.push(...acceptedSubCombinations);
      }

      if (combinations.length === 0) {
        combinationsOnWorkflows.delete(workflowName);
      }
    }
  }

  return acceptedCombinations;
};

day(19, (input, part) => {
  const [workflows, parts] = parseWorkflowsAndParts(input);

  part(1, () =>
    sum(sortParts(workflows, parts).map((part) => sum(Object.values(part)))),
  );

  part(2, () =>
    sum(
      findAcceptedCombinations(workflows, {
        x: new Range(1, 4000),
        m: new Range(1, 4000),
        a: new Range(1, 4000),
        s: new Range(1, 4000),
      }).map(
        (combination) =>
          (1 + combination.x.distinctValuesCount()) *
          (1 + combination.m.distinctValuesCount()) *
          (1 + combination.a.distinctValuesCount()) *
          (1 + combination.s.distinctValuesCount()),
      ),
    ),
  );
});
