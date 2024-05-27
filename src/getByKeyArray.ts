export function getByKeyArray<OriginalType extends object>(
  original: OriginalType,
  ...keys: any[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): any {
  let result = original;
  for (const key of keys) {
    // @ts-ignore
    result = result[key];
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return result;
}
