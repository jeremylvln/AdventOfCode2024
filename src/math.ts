export class Point {
  constructor(
    readonly x: number,
    readonly y: number,
  ) {}

  manhattanDistanceTo(other: Point): number {
    return Math.abs(this.x - other.x) + Math.abs(this.y - other.y);
  }
}

export class Range {
  constructor(
    readonly min: number,
    readonly max: number,
  ) {}

  includes(value: number): boolean {
    return value >= this.min && value <= this.max;
  }

  collidesWith(other: Range): boolean {
    return (
      this.includes(other.min) ||
      this.includes(other.max) ||
      other.includes(this.min) ||
      other.includes(this.max)
    );
  }

  union(other: Range): Range {
    if (!this.collidesWith(other))
      throw new Error('Cannot union ranges that do not collide');
    return new Range(
      Math.min(this.min, other.min),
      Math.max(this.max, other.max),
    );
  }

  distinctValuesCount(): number {
    return this.max - this.min;
  }
}

export const sum = (array: readonly number[]): number =>
  array.reduce((previous, current) => previous + current, 0);

export const lcm = (a: number, b: number): number => {
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  return (a * b) / gcd(a, b);
};

export const lcmOfArray = (array: readonly number[]): number =>
  array.reduce((previous, current) => lcm(previous, current), 1);
