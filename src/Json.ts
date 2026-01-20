import * as Result from "./Result.ts"

/**
 * Safely parses a JSON string, returning an `Result` with a `SyntaxError` on failure or the parsed value on success.
 *
 * @example parse
 * ```ts
 * import { parse } from "@jvlk/fp-tsm/Json"
 * import { expect } from "@std/expect/expect"
 *
 * expect(parse('{"a":1}')).toMatchObject({ _tag: "Ok", ok: { a: 1 } })
 * expect(parse('a')._tag).toBe("Error")
 * expect(parse('a')).toMatchObject({ _tag: "Error", error: expect.any(SyntaxError) })
 * ```
 */
export const parse = (s: string): Result.Result<unknown, SyntaxError> => {
  try {
    const result = JSON.parse(s)
    return Result.ok(result)
  } catch (err) {
    if (err instanceof SyntaxError) {
      return Result.error(err)
    }
  }
  return Result.error(new SyntaxError("Unknown error"))
}

/**
 * Safely stringifies a value to JSON, returning an `Result` with a `TypeError` on failure or the JSON string on success.
 *
 * @example stringify
 * ```ts
 * import { stringify } from "@jvlk/fp-tsm/Json"
 * import { expect } from "@std/expect/expect"
 *
 * expect(stringify({ a: 1 })).toMatchObject({ _tag: "Ok", ok: '{"a":1}' })
 *
 * const circularObj: Record<string, unknown> = {}
 * circularObj.self = circularObj
 * expect(stringify(circularObj)._tag).toBe("Error")
 * expect(stringify(circularObj)).toMatchObject({ _tag: "Error", error: expect.any(TypeError) })
 * ```
 */
export const stringify = (data: unknown): Result.Result<string, TypeError> => {
  try {
    const result = JSON.stringify(data)
    return Result.ok(result)
  } catch (err) {
    if (err instanceof TypeError) {
      return Result.error(err)
    }
  }
  return Result.error(new TypeError("Unknown error"))
}
