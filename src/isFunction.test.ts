import { isFunction } from "./isFunction";
import { expect, describe, it } from "vitest";

describe("isFunction", () => {
  it("should return true for functions", () => {
    const func = () => {};
    expect(isFunction(func)).toBe(true);
  });

  it("should return false for non-functions", () => {
    expect(isFunction("notFunc")).toBe(false);
    expect(isFunction(4)).toBe(false);
    expect(isFunction(NaN)).toBe(false);
    expect(isFunction({ f: () => undefined })).toBe(false);
    expect(isFunction([() => undefined])).toBe(false);
    expect(isFunction(null)).toBe(false);
    expect(isFunction(undefined)).toBe(false);
  });
});
