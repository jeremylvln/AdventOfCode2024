import { day } from './lib.js';

type Report = {
  readonly levels: readonly number[];
};

const parseReports = (lines: readonly string[]): Report[] =>
  lines.map((line) => {
    const levels = line.split(' ').map((string_) => Number.parseInt(string_));
    return { levels };
  });

const isSafe = (report: Report): boolean => {
  const order: 1 | -1 = report.levels[0]! < report.levels[1]! ? 1 : -1;

  for (let index = 1; index < report.levels.length; index += 1) {
    const isOrdered =
      order === 1
        ? report.levels[index]! > report.levels[index - 1]!
        : report.levels[index]! < report.levels[index - 1]!;

    const difference = Math.abs(
      report.levels[index]! - report.levels[index - 1]!,
    );
    const isWithinBounds = difference >= 1 && difference <= 3;

    if (!isOrdered || !isWithinBounds) {
      return false;
    }
  }

  return true;
};

const isSafeAlternative = (report: Report): boolean => {
  for (let index = 0; index < report.levels.length; index += 1) {
    const alternativeLevels = [...report.levels];
    alternativeLevels.splice(index, 1);

    if (isSafe({ levels: alternativeLevels })) {
      return true;
    }
  }

  return false;
}

day(2, (input, part) => {
  const reports = parseReports(input);

  part(1, () =>
    reports.reduce(
      (accumulator, report) => accumulator + (isSafe(report) ? 1 : 0),
      0,
    ),
  );

  part(2, () =>
    reports.reduce(
      (accumulator, report) => accumulator + (isSafe(report) || isSafeAlternative(report) ? 1 : 0),
      0,
    ),
  );
});
