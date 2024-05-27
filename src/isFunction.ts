import { SetStateAction } from "./provideNestedSetState";

export function isFunction<S>(
  value: SetStateAction<S>,
): value is (prevState: S) => S {
  return typeof value === "function";
}
