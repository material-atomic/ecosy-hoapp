/* eslint-disable @typescript-eslint/no-explicit-any */
export type primitive = string | number | boolean | bigint | symbol | undefined | null;

export type LiteralObject<Keys extends PropertyKey = PropertyKey> =
  | Record<Keys, unknown>
  | { [K in Keys]: unknown }
  | object;

export type LiteralFunction<R = unknown, A extends unknown[] = unknown[]> = (...args: A) => R;

export type Objectable = LiteralObject | Array<unknown> | LiteralFunction;

export type Freezable<T> = T extends primitive
  ? T
  : // 1. Functions: use any[] => any to match all signatures
    T extends (...args: any[]) => any
    ? T
    : // 2. Preserve built-in classes (prevent flattening into plain objects)
      T extends Date | RegExp | Error | Map<any, any> | Set<any>
      ? T
      : // 3. Arrays (including already-readonly arrays)
        T extends ReadonlyArray<infer U>
        ? ReadonlyArray<Freezable<U>>
        : // 4. Plain objects
          T extends object
          ? { readonly [K in keyof T]: Freezable<T[K]> }
          : // Safe fallback
            T;
