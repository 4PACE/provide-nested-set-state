import memoize from "memoize";
import ManyKeysMap from "many-keys-map";

import { isFunction } from "./isFunction";
import { getByKeyArray } from "./getByKeyArray";
import { recursiveDestructuringNestedUpdater } from "./recursiveDestructuringNestedUpdater";

/* React types*/
export type Dispatch<A> = (value: A) => void;
export type SetStateAction<S> = S | ((prevState: S) => S);

export type SetState<T> = Dispatch<SetStateAction<T>>;

export function rawProvideNestedSetState<
  OriginalType extends object,
  Key1 extends keyof OriginalType,
>(
  rootUpdater: Dispatch<SetStateAction<OriginalType>>,
  key1: Key1,
): Dispatch<SetStateAction<OriginalType[Key1]>>;

export function rawProvideNestedSetState<
  OriginalType extends object,
  Key1 extends keyof OriginalType,
  Key2 extends keyof OriginalType[Key1],
>(
  rootUpdater: Dispatch<SetStateAction<OriginalType>>,
  key1: Key1,
  key2: Key2,
): Dispatch<SetStateAction<OriginalType[Key1][Key2]>>;

export function rawProvideNestedSetState<
  OriginalType extends object,
  Key1 extends keyof OriginalType,
  Key2 extends keyof OriginalType[Key1],
  Key3 extends keyof OriginalType[Key1][Key2],
>(
  rootUpdater: Dispatch<SetStateAction<OriginalType>>,
  key1: Key1,
  key2: Key2,
  key3: Key3,
): Dispatch<SetStateAction<OriginalType[Key1][Key2][Key3]>>;

export function rawProvideNestedSetState<
  OriginalType extends object,
  Key1 extends keyof OriginalType,
  Key2 extends keyof OriginalType[Key1],
  Key3 extends keyof OriginalType[Key1][Key2],
  Key4 extends keyof OriginalType[Key1][Key2][Key3],
>(
  rootUpdater: Dispatch<SetStateAction<OriginalType>>,
  key1: Key1,
  key2: Key2,
  key3: Key3,
  key4: Key4,
): Dispatch<SetStateAction<OriginalType[Key1][Key2][Key3][Key4]>>;

export function rawProvideNestedSetState<
  OriginalType extends object,
  Key1 extends keyof OriginalType,
  Key2 extends keyof OriginalType[Key1],
  Key3 extends keyof OriginalType[Key1][Key2],
  Key4 extends keyof OriginalType[Key1][Key2][Key3],
  Key5 extends keyof OriginalType[Key1][Key2][Key3][Key4],
>(
  rootUpdater: Dispatch<SetStateAction<OriginalType>>,
  key1: Key1,
  key2: Key2,
  key3: Key3,
  key4: Key4,
  key5: Key5,
): Dispatch<SetStateAction<OriginalType[Key1][Key2][Key3][Key4][Key5]>>;

export function rawProvideNestedSetState<
  OriginalType extends object,
  Key1 extends keyof OriginalType,
  Key2 extends keyof OriginalType[Key1],
  Key3 extends keyof OriginalType[Key1][Key2],
  Key4 extends keyof OriginalType[Key1][Key2][Key3],
  Key5 extends keyof OriginalType[Key1][Key2][Key3][Key4],
  Key6 extends keyof OriginalType[Key1][Key2][Key3][Key4][Key5],
>(
  rootUpdater: Dispatch<SetStateAction<OriginalType>>,
  key1: Key1,
  key2: Key2,
  key3: Key3,
  key4: Key4,
  key5: Key5,
  key6: Key6,
): Dispatch<SetStateAction<OriginalType[Key1][Key2][Key3][Key4][Key5][Key6]>>;

export function rawProvideNestedSetState<
  OriginalType extends object,
  Key1 extends keyof OriginalType,
  Key2 extends keyof OriginalType[Key1],
  Key3 extends keyof OriginalType[Key1][Key2],
  Key4 extends keyof OriginalType[Key1][Key2][Key3],
  Key5 extends keyof OriginalType[Key1][Key2][Key3][Key4],
  Key6 extends keyof OriginalType[Key1][Key2][Key3][Key4][Key5],
  Key7 extends keyof OriginalType[Key1][Key2][Key3][Key4][Key5][Key6],
>(
  rootUpdater: Dispatch<SetStateAction<OriginalType>>,
  key1: Key1,
  key2: Key2,
  key3: Key3,
  key4: Key4,
  key5: Key5,
  key6: Key6,
  key7: Key7,
): Dispatch<
  SetStateAction<OriginalType[Key1][Key2][Key3][Key4][Key5][Key6][Key7]>
>;

//--

export function rawProvideNestedSetState<OriginalType extends object>(
  rootUpdater: Dispatch<SetStateAction<OriginalType>>,
  ...keys: any[]
): Dispatch<SetStateAction<any>> {
  // @ts-ignore
  return function (setNestedStateAction: SetStateAction<any>) {
    // @ts-ignore
    rootUpdater((prevRootState) => {
      let nextNestedState: any;
      if (isFunction(setNestedStateAction)) {
        nextNestedState = setNestedStateAction(
          getByKeyArray(prevRootState, ...keys),
        );
      } else {
        nextNestedState = setNestedStateAction;
      }
      // noinspection UnnecessaryLocalVariableJS
      const finalState = recursiveDestructuringNestedUpdater(
        prevRootState,
        keys,
        nextNestedState,
      );
      return finalState;
    });
  };
}

export const provideNestedSetState = memoize(rawProvideNestedSetState, {
  cacheKey: (arguments_: unknown[]) => arguments_,
  cache: new ManyKeysMap(),
});
