export function flatten<T>(arr: Array<Array<T>>): Array<T> {
  return arr.reduce((acc, val) => acc.concat(val), []);
}

export function* product<T>(
  ...iterables: Array<Iterable<T>>
): IterableIterator<T[]> {
  interface CachedIterator {
    next(): IteratorResult<T>;
    rewind(): void;
  }

  function createCachedIterator(iterable: Iterable<T>): CachedIterator {
    const iterator = iterable[Symbol.iterator]();
    const cache: T[] = [];
    let index = 0;
    let done = false;

    return {
      next() {
        if (index < cache.length) {
          return { value: cache[index++], done: false };
        }
        if (done) {
          return { value: undefined as any, done: true };
        }
        const result = iterator.next();
        if (!result.done) {
          cache.push(result.value);
          index++;
          return { value: result.value, done: false };
        } else {
          done = true;
          return { value: undefined as any, done: true };
        }
      },
      rewind() {
        index = 0;
      },
    };
  }

  const iterators = iterables.map(createCachedIterator);
  const result: T[] = [];

  function* helper(depth: number): Generator<T[]> {
    if (depth === iterators.length) {
      yield result.slice();
      return;
    }
    const iterator = iterators[depth];
    iterator.rewind();
    while (true) {
      const { value, done } = iterator.next();
      if (done) break;
      result[depth] = value;
      yield* helper(depth + 1);
    }
  }

  if (iterators.length === 0) {
    yield [];
  } else {
    yield* helper(0);
  }
}
