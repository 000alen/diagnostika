export function flatten<T>(arr: Array<Array<T>>): Array<T> {
  return arr.reduce((acc, val) => acc.concat(val), []);
}
