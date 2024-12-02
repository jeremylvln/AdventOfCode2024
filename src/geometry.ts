import { Point } from './math.js';

export class AABB {
  constructor(
    readonly minX: number,
    readonly minY: number,
    readonly maxX: number,
    readonly maxY: number,
  ) {}

  readonly doesCollideWith = (other: AABB): boolean =>
    this.minX <= other.maxX &&
    this.maxX >= other.minX &&
    this.minY <= other.maxY &&
    this.maxY >= other.minY;
}

export const shoelace = (edges: readonly Point[]): number => {
  let area = 0;

  for (let index = 0; index < edges.length; index += 1) {
    const current = edges[index]!;
    const next = edges[(index + 1) % edges.length]!;
    area += current.x * next.y - next.x * current.y;
  }

  return Math.abs(area / 2);
};
