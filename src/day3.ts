import { match } from 'ts-pattern';

import { day } from './lib.js';

type Instruction =
  | {
      op: 'mul';
      first: number;
      second: number;
    }
  | {
      op: 'do' | "don't";
    };

type ExecutionContext = {
  acc: number;
  mulEnabled: boolean;
};

const INSTRUCTION_REGEX =
  /(?:(mul)\((\d{1,3}),(\d{1,3})\))|(?:(do)\(\))|(?:(don't)\(\))/g;

const parseInstructions = (line: string): Instruction[] => {
  const matches = [...line.matchAll(INSTRUCTION_REGEX)].map((group) =>
    group.filter(Boolean),
  );

  return matches.map((result) =>
    match(result[1] as Instruction['op'])
      .with('mul', () => ({
        op: 'mul' as const,
        first: Number.parseInt(result[2]!),
        second: Number.parseInt(result[3]!),
      }))
      .with('do', "don't", (op) => ({ op }))
      .exhaustive(),
  );
};

const executeInstruction = (
  instruction: Instruction,
  context: ExecutionContext,
): ExecutionContext =>
  match(instruction)
    .with({ op: 'mul' }, (instruction) => {
      if (!context.mulEnabled) {
        return context;
      }

      return {
        ...context,
        acc: context.acc + instruction.first * instruction.second,
      };
    })
    .with({ op: 'do' }, () => ({
      ...context,
      mulEnabled: true,
    }))
    .with({ op: "don't" }, () => ({
      ...context,
      mulEnabled: false,
    }))
    .exhaustive();

day(3, (input, part) => {
  const instructions = parseInstructions(input[0]!);
  const initialContext: ExecutionContext = {
    acc: 0,
    mulEnabled: true,
  };

  part(1, () => {
    const finalContext = instructions
      .filter((instruction) => instruction.op === 'mul')
      .reduce(
        (context, instruction) => executeInstruction(instruction, context),
        initialContext,
      );

    return finalContext.acc;
  });

  part(2, () => {
    const finalContext = instructions.reduce(
      (context, instruction) => executeInstruction(instruction, context),
      initialContext,
    );

    return finalContext.acc;
  });
});
