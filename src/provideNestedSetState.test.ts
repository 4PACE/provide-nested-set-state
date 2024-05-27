import { test, vi } from "vitest";
import {
  provideNestedSetState,
  Dispatch,
  SetStateAction,
} from "./provideNestedSetState";
import { isFunction } from "./isFunction";

const setStateMock = function <T>(
  originalState: T,
): Dispatch<SetStateAction<T>> {
  return function (setStateAction: SetStateAction<T>): T {
    if (isFunction(setStateAction)) {
      return setStateAction(originalState);
    }
    return setStateAction;
  };
};

type TestState = {
  key1: number;
  key2: string;
  key3: number[];
  key4: { key5: string; key6: number };
};

type NestedTestState = {
  key1: Array<{
    key3: Array<{
      key5: Array<{
        key7: {
          key8: string;
          key8b: number;
        };
      }>;
    }>;
  }>;
};

// a bit meta, those are tests for the mock function
test("the mocked setState function takes an object to update", ({ expect }) => {
  const setState = setStateMock({ a: 5, b: "abc" });
  const observedSetState = vi.fn(setState);
  observedSetState({ a: 11, b: "xyz" });
  expect(observedSetState).toHaveReturnedWith({ a: 11, b: "xyz" });
});
test("the mocked setState function takes a takes a callback to update", ({
  expect,
}) => {
  const setState = setStateMock({ a: 5, b: "abc" });
  const observedSetState = vi.fn(setState);

  const updateCallback: SetStateAction<{ a: number; b: string }> = (prev) => ({
    ...prev,
    a: prev.a + 11,
  });
  const observedUpdateCallback = vi.fn(updateCallback);

  observedSetState(observedUpdateCallback);

  expect(observedUpdateCallback).toHaveBeenCalled();
  expect(observedUpdateCallback).toHaveReturnedTimes(1);
  expect(observedUpdateCallback).toHaveReturnedWith({ a: 16, b: "abc" });

  expect(observedSetState).toHaveReturnedWith({ a: 16, b: "abc" });
});

test("should update the state correctly for a single key", ({ expect }) => {
  const rootSetState = setStateMock<TestState>({
    key1: 0,
    key2: "abc",
    key3: [5, 6, 7],
    key4: { key5: "xyz", key6: 8 },
  });
  const observedRootSetState = vi.fn(rootSetState);
  const setNestedState = provideNestedSetState(observedRootSetState, "key1");
  setNestedState(10);

  expect(observedRootSetState).toHaveBeenCalled();
  expect(observedRootSetState).toHaveReturnedTimes(1);
  expect(observedRootSetState).toHaveReturnedWith({
    key1: 10,
    key2: "abc",
    key3: [5, 6, 7],
    key4: { key5: "xyz", key6: 8 },
  });
});

test("should update the state correctly for a nested array", ({ expect }) => {
  const rootSetState = setStateMock<TestState>({
    key1: 0,
    key2: "abc",
    key3: [5, 6, 7],
    key4: { key5: "xyz", key6: 8 },
  });
  const observedRootSetState = vi.fn(rootSetState);
  const setNestedState = provideNestedSetState(observedRootSetState, "key3", 1);
  setNestedState(-9);

  expect(observedRootSetState).toHaveBeenCalled();
  expect(observedRootSetState).toHaveReturnedTimes(1);
  expect(observedRootSetState).toHaveReturnedWith({
    key1: 0,
    key2: "abc",
    key3: [5, -9, 7],
    key4: { key5: "xyz", key6: 8 },
  });
});

test("goes seven levels deep", ({ expect }) => {
  const rootSetState = setStateMock({
    key1: [
      {
        key3: [
          {
            key5: [
              {
                key7: {
                  key8: "abc",
                  key8b: 5,
                },
              },
              {
                key7: {
                  key8: "def",
                  key8b: 6,
                },
              },
            ],
          },
        ],
      },
    ],
  });
  const observedRootSetState = vi.fn(rootSetState);
  const setNestedState = provideNestedSetState(
    observedRootSetState,
    "key1",
    0,
    "key3",
    0,
    "key5",
    1,
    "key7",
  );
  setNestedState({ key8: "xyz", key8b: 12 });

  expect(observedRootSetState).toHaveBeenCalled();
  expect(observedRootSetState).toHaveReturnedTimes(1);
  expect(observedRootSetState).toHaveReturnedWith({
    key1: [
      {
        key3: [
          {
            key5: [
              {
                key7: {
                  key8: "abc",
                  key8b: 5,
                },
              },
              {
                key7: {
                  key8: "xyz",
                  key8b: 12,
                },
              },
            ],
          },
        ],
      },
    ],
  });
});

test("goes seven levels deep using a callback to update", ({ expect }) => {
  const rootSetState = setStateMock({
    key1: [
      {
        key3: [
          {
            key5: [
              {
                key7: {
                  key8: "abc",
                  key8b: 5,
                },
              },
              {
                key7: {
                  key8: "def",
                  key8b: 6,
                },
              },
            ],
          },
        ],
      },
    ],
  });
  const observedRootSetState = vi.fn(rootSetState);
  const setNestedState = provideNestedSetState(
    observedRootSetState,
    "key1",
    0,
    "key3",
    0,
    "key5",
    1,
    "key7",
  );

  type NestedState =
    NestedTestState["key1"][number]["key3"][number]["key5"][number]["key7"];

  const updateCallback: SetStateAction<NestedState> = (prev: NestedState) => ({
    ...prev,
    key8: prev.key8 + "xyz",
  });
  const observedUpdateCallback = vi.fn(updateCallback);
  setNestedState(observedUpdateCallback);

  expect(observedUpdateCallback).toHaveBeenCalled();
  expect(observedUpdateCallback).toHaveReturnedTimes(1);
  expect(observedUpdateCallback).toHaveReturnedWith({
    key8: "defxyz",
    key8b: 6,
  });

  expect(observedRootSetState).toHaveBeenCalled();
  expect(observedRootSetState).toHaveReturnedTimes(1);
  expect(observedRootSetState).toHaveReturnedWith({
    key1: [
      {
        key3: [
          {
            key5: [
              {
                key7: {
                  key8: "abc",
                  key8b: 5,
                },
              },
              {
                key7: {
                  key8: "defxyz",
                  key8b: 6,
                },
              },
            ],
          },
        ],
      },
    ],
  });
});

test("should update the state correctly for a single key using a callback to update", ({
  expect,
}) => {
  const rootSetState = setStateMock<TestState>({
    key1: 0,
    key2: "abc",
    key3: [5, 6, 7],
    key4: { key5: "xyz", key6: 8 },
  });
  const observedRootSetState = vi.fn(rootSetState);
  const setNestedState = provideNestedSetState(observedRootSetState, "key4");
  const updateCallback: SetStateAction<TestState["key4"]> = (
    prev: TestState["key4"],
  ) => ({ ...prev, key6: prev.key6 + 8 });
  const observedUpdateCallback = vi.fn(updateCallback);
  setNestedState(observedUpdateCallback);

  expect(observedUpdateCallback).toHaveBeenCalled();
  expect(observedUpdateCallback).toHaveReturnedTimes(1);
  expect(observedUpdateCallback).toHaveReturnedWith({ key5: "xyz", key6: 16 });

  expect(observedRootSetState).toHaveBeenCalled();
  expect(observedRootSetState).toHaveReturnedTimes(1);
  expect(observedRootSetState).toHaveReturnedWith({
    key1: 0,
    key2: "abc",
    key3: [5, 6, 7],
    key4: { key5: "xyz", key6: 16 },
  });
});

// This test is of limited usefulness, as the mocked setState is not updating the original state
test("the provided nested setState can be called repeatedly", ({ expect }) => {
  const rootSetState = setStateMock<TestState>({
    key1: 0,
    key2: "abc",
    key3: [5, 6, 7],
    key4: { key5: "xyz", key6: 8 },
  });
  const observedRootSetState = vi.fn(rootSetState);
  const setNestedState = provideNestedSetState(observedRootSetState, "key1");
  setNestedState(10);
  expect(observedRootSetState).toHaveReturnedTimes(1);
  expect(observedRootSetState).toHaveReturnedWith({
    key1: 10,
    key2: "abc",
    key3: [5, 6, 7],
    key4: { key5: "xyz", key6: 8 },
  });
  setNestedState(12);
  expect(observedRootSetState).toHaveReturnedTimes(2);
  expect(observedRootSetState).toHaveReturnedWith({
    key1: 12,
    key2: "abc",
    key3: [5, 6, 7],
    key4: { key5: "xyz", key6: 8 },
  });
  setNestedState(-3);
  expect(observedRootSetState).toHaveReturnedTimes(3);
  expect(observedRootSetState).toHaveReturnedWith({
    key1: -3,
    key2: "abc",
    key3: [5, 6, 7],
    key4: { key5: "xyz", key6: 8 },
  });
});
