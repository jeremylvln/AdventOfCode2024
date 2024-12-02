export type Predicate<T> = (input: T) => boolean;
export type Readonly2DArray<T> = readonly (readonly T[])[];
export type NonEmptyArray<T> = [T, ...T[]];

export const impossible = (): never => {
  throw new Error('Impossible');
};

export const chunkArray = <T>(
  array: readonly T[],
  size: number,
): readonly T[][] =>
  Array.from({ length: Math.ceil(array.length / size) }, (_, index) =>
    array.slice(index * size, index * size + size),
  );

export const arrayReverse = <T>(array: readonly T[]): readonly T[] =>
  Array.from(
    { length: array.length },
    (_, index) => array[array.length - 1 - index]!,
  );

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const memoize = <I extends any[], O>(
  function_: (...inputs: I) => O,
  deriveCacheKey: (...inputs: I) => string,
) => {
  const cache: Map<string, O> = new Map();

  return (...inputs: I) => {
    const cacheKey = deriveCacheKey(...inputs);
    if (cache.has(cacheKey)) {
      return cache.get(cacheKey)!;
    } else {
      const output = function_(...inputs);
      cache.set(cacheKey, output);
      return output;
    }
  };
};

export const createPipeline =
  <T>(functions: readonly ((input: T) => T)[]) =>
  (input: T): T =>
    functions.reduce(
      (previous, mappingFunction) => mappingFunction(previous),
      input,
    );
