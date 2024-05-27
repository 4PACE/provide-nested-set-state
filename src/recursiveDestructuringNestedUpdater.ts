// TODO what about optional fields?
export function recursiveDestructuringNestedUpdater<T>(
  prevState: T,
  keyArray: (string | number | symbol)[],
  finalNestedState: any,
): T {
  const [key, ...remainingKeys] = keyArray;
  const nextNestedState: any[] =
    remainingKeys.length === 0
      ? finalNestedState
      : recursiveDestructuringNestedUpdater(
          // @ts-ignore
          prevState[key],
          remainingKeys,
          finalNestedState,
        );
  if (Array.isArray(prevState)) {
    const result = prevState.map((item, index) =>
      index === key ? nextNestedState : item,
    );
    return result as T;
  } else {
    // TODO check if this is an object, throw if it is not?
    return { ...prevState, [key]: nextNestedState };
  }
}
