import { clone } from "./clone";
import type { Freezable, LiteralObject } from "../types/built-in";
import { isObject } from "./utils";

function deepFreezeInternal<T extends LiteralObject>(obj: T): T {
  const propNames = Reflect.ownKeys(obj);

  for (const name of propNames) {
    const value = obj[name as keyof T];
    if (isObject(value)) {
      deepFreezeInternal(value);
    }
  }

  return Object.freeze(obj);
}

export function freeze<DataType>(data: DataType, cloneDeep = clone): Freezable<DataType> {
  if (!isObject(data)) {
    return data as Freezable<DataType>;
  }

  const cloned = cloneDeep(data);

  return deepFreezeInternal(cloned) as Freezable<DataType>;
}