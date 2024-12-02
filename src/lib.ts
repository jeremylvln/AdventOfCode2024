import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

type DayNumber =
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | 13
  | 14
  | 15
  | 16
  | 17
  | 18
  | 19
  | 20
  | 21
  | 22
  | 23
  | 24
  | 25;

type PartNumber = 1 | 2;

type PartOutput = string | number;
type PartFunction = (part: PartNumber, handler: () => PartOutput) => void;

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const createPartFunction =
  (day: DayNumber): PartFunction =>
  (part, handler) => {
    const output = handler();
    console.log(`Output of day ${day}-${part} is: ${output}`);
  };

export const day = (
  nb: DayNumber,
  handler: (input: readonly string[], part: PartFunction) => void,
) => {
  const dayFileName =
    process.argv[2] === '--sample' ? `day${nb}.sample.txt` : `day${nb}.txt`;
  const inputPath = path.join(__dirname, '..', 'inputs', dayFileName);
  const input = fs.readFileSync(inputPath, 'utf8').split('\n');
  return handler(input, createPartFunction(nb));
};
