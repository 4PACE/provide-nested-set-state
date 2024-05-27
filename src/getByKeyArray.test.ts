import { expect, test } from "vitest";
import { getByKeyArray } from "./getByKeyArray";

const nestedObject = {
  a: 5,
  b: {
    ba: 7,
    bb: {
      bba: 9,
      bbb: { bbba: 109 },
      bbc: ["bbc0", "bbc1", "bbc2"],
    },
  },
};
Object.freeze(nestedObject);
Object.freeze(nestedObject.b);
Object.freeze(nestedObject.b.bb);
Object.freeze(nestedObject.b.bb.bbb);
Object.freeze(nestedObject.b.bb.bbc);

const testParams = [
  {
    obj: ["a", "b", "c"],
    keyArray: [1],
    target: "b",
  },
  {
    obj: ["a", "b", "c"],
    keyArray: [3],
    target: undefined,
  },
  {
    obj: nestedObject,
    keyArray: ["b", "bb", "bbb"],
    target: nestedObject.b.bb.bbb,
  },
  {
    obj: nestedObject,
    keyArray: ["b", "bb", "bbc", 1],
    target: nestedObject.b.bb.bbc[1],
  },
  {
    obj: nestedObject,
    keyArray: ["b", "bb", "bbx"],
    target: undefined,
  },
];

testParams.forEach(({ obj, keyArray, target }) => {
  test(`getByKeyArray will return ${JSON.stringify(target)} from obj using ${JSON.stringify(keyArray)}`, () =>
    expect(getByKeyArray(obj, ...keyArray)).toBe(target));
});

test(`getByKeyArray will throw if trying to read properties of undefined`, () => {
  const obj = { a: [{ b: 1 }, { b: 2 }, { b: 3 }] };
  expect(() => getByKeyArray(obj, "a", "b", "c")).toThrowError(
    "Cannot read properties of undefined (reading 'c')",
  );
});
