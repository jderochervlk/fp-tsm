import { dual } from "./internal.ts"
import * as Option from "./Option.ts"

/**
 * Safely lookup a value in a Record by key, returning an Option.
 *
 * @category Functions
 * @example Data first style
 * ```ts
 * import { Record, Option } from "@jvlk/fp-tsm";
 * import { expect } from "jsr:@std/expect"
 *
 * type T = { a: number | undefined; b: number | null; c?: number }
 *
 * const record: T = { a: 1, b: null }
 *
 * const a: Option.Option<number> = Record.lookup(record, "a")
 * const b: Option.Option<number> = Record.lookup(record, "b")
 * const c: Option.Option<number> = Record.lookup(record, "c")
 *
 * expect(a).toEqual(Option.of(1))
 * expect(b).toEqual(Option.none)
 * expect(c).toEqual(Option.none)
 * ```
 *
 * @example Pipe style
 * ```ts
 * import { Record, Option, pipe } from "@jvlk/fp-tsm";
 * import { expect } from "jsr:@std/expect"
 *
 * type T = { a: number | undefined; b: number | null; c?: number }
 *
 * const record: T = { a: 1, b: null }
 *
 * const a: Option.Option<number> = pipe(record, Record.lookup("a"))
 * const b: Option.Option<number> = Record.lookup(record, "b")
 * const c: Option.Option<number> = Record.lookup(record, "c")
 *
 * expect(a).toEqual(Option.of(1))
 * expect(b).toEqual(Option.none)
 * expect(c).toEqual(Option.none)
 * ```
 */
export const lookup: {
  <K extends keyof T, V, T extends Partial<Record<K, V | null>>>(
    self: T,
    key: K,
  ): Option.Option<NonNullable<T[K]>>
  <K extends keyof T, V, T extends Partial<Record<K, V | null>>>(
    key: K,
  ): (self: T) => Option.Option<NonNullable<T[K]>>
} = dual(2, (self, key) => {
  return Option.of(self[key])
})
