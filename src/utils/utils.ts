/* eslint-disable @typescript-eslint/no-explicit-any */
import type { LiteralFunction, Objectable } from "../types/built-in";

export function toString(value: unknown): string {
  return Object.prototype.toString.call(value);
}

export function isFunction<T extends LiteralFunction<any, any>>(value: unknown): value is T {
  return (
    typeof value === "function" ||
    ["[object Function]", "[object AsyncFunction]", "[object GeneratorFunction]"].includes(
      toString(value),
    )
  );
}

export function isObject(value: unknown): value is object {
  return typeof value === "object" && value !== null;
}

export function isObjectable(value: unknown): value is Objectable {
  return isObject(value) || isFunction(value);
}

export function hasOwnProperty<Obj, Key extends PropertyKey, As = unknown>(
  obj: Obj,
  key: Key,
): obj is Obj & Record<Key, As> {
  if (!obj) {
    return false;
  }

  if (!isObjectable(obj)) {
    return Object.prototype.hasOwnProperty.call(obj, key);
  }

  return (
    Object.prototype.hasOwnProperty.call(obj, key) || key in (obj as Record<PropertyKey, unknown>)
  );
}
