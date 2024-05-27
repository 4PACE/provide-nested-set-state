import { expect, test } from "vitest";
import { recursiveDestructuringNestedUpdater } from "./recursiveDestructuringNestedUpdater";

type TestData = {
  a: number;
  b: {
    ba: number;
    bb: {
      bba: number;
      bbb: { bbba: number };
      bbc: string[];
    };
    bc: { bca: number; bcb: number };
  };
  c: { ca: number; cb: number }[];
};

function getTestData(): TestData {
  const obj = {
    a: 5,
    b: {
      ba: 7,
      bb: {
        bba: 9,
        bbb: { bbba: 109 },
        bbc: ["bbc0", "bbc1", "bbc2"],
      },
      bc: { bca: 10, bcb: 11 },
    },
    c: [
      {
        ca: 10,
        cb: 11,
      },
      {
        ca: 12,
        cb: 13,
      },
    ],
  };
  // freeze the object to make sure it is not mutated
  Object.freeze(obj);
  Object.freeze(obj.b);
  Object.freeze(obj.b.bb);
  Object.freeze(obj.b.bb.bbb);
  Object.freeze(obj.b.bb.bbc);
  Object.freeze(obj.b.bc);
  Object.freeze(obj.c);
  Object.freeze(obj.c[0]);
  Object.freeze(obj.c[1]);
  return obj;
}

test("updates the bbba property to 1000 using the key array", () => {
  const testData = getTestData();
  const result = recursiveDestructuringNestedUpdater(
    testData,
    ["b", "bb", "bbb", "bbba"],
    1000,
  );
  expect(result.b.bb.bbb.bbba).toBe(1000);
});

test("changes the object identity along the selected path", () => {
  const testData = getTestData();
  const result = recursiveDestructuringNestedUpdater(
    testData,
    ["b", "bb", "bbb", "bbba"],
    1000,
  );
  expect(result).not.toBe(testData);
  expect(result.b).not.toBe(testData.b);
  expect(result.b.bb).not.toBe(testData.b.bb);
  expect(result.b.bb.bbb).not.toBe(testData.b.bb.bbb);
});

test("keep the object identity of objects not addressed in the key array", () => {
  const testData = getTestData();
  const result = recursiveDestructuringNestedUpdater(
    testData,
    ["b", "bb", "bbb", "bbba"],
    1000,
  );
  expect(result.c).toBe(testData.c);
  expect(result.b.bc).toBe(testData.b.bc);
  expect(result.b.bb.bbc).toBe(testData.b.bb.bbc);
});

test("if a value is replaced by an identical value, the objects match", () => {
  const testData = getTestData();
  const result = recursiveDestructuringNestedUpdater(
    testData,
    ["b", "bb", "bbb", "bbba"],
    109,
  );
  expect(getTestData()).toMatchObject(result);
  expect(result).toMatchObject(getTestData());
});

test("change an entry in an array", () => {
  const testData = getTestData();
  const result = recursiveDestructuringNestedUpdater(
    testData,
    ["c", 1, "ca"],
    55,
  );
  // check if testData is not mutated
  expect(testData.c[1].ca).toBe(12);
  expect(testData.c[1].cb).toBe(13);
  expect(testData.c).toMatchObject(getTestData().c);

  expect(result.c[1].ca).toBe(55);
  expect(result.c[1].cb).toBe(13);
});

test("changes the object identity of an array and objects of the key path", () => {
  const testData = getTestData();
  const array = testData.c;
  const result = recursiveDestructuringNestedUpdater(
    testData,
    ["c", 1, "ca"],
    55,
  );
  expect(result).not.toBe(testData);
  expect(result.c).not.toBe(array);
  expect(result.c[1]).not.toBe(array[1]);
});

test("does not change the object identity of elements in an array that were not changed themselves nor the target array's identity", () => {
  const testData = getTestData();
  const array = testData.c;
  const result = recursiveDestructuringNestedUpdater(
    testData,
    ["c", 1, "ca"],
    55,
  );
  expect(testData.c).toBe(array);
  expect(result.c[1].cb).toBe(array[1].cb);
});
