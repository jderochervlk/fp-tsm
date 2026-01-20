import * as Json from "@jvlk/fp-tsm/Json"
import { expect } from "@std/expect/expect"

Deno.test("parse", () => {
  expect(Json.parse('{"a":1}')).toMatchObject({
    _tag: "Ok",
    ok: { a: 1 },
  })

  expect(Json.parse("a")._tag).toBe("Err")
  expect(Json.parse("a")).toMatchObject({
    _tag: "Err",
    err: expect.any(SyntaxError),
  })
})

Deno.test("stringify", () => {
  expect(Json.stringify({ a: 1 })).toMatchObject({
    _tag: "Ok",
    ok: '{"a":1}',
  })

  const circularObj: Record<string, unknown> = {}
  circularObj.self = circularObj

  expect(Json.stringify(circularObj)._tag).toBe("Err")
  expect(Json.stringify(circularObj)).toMatchObject({
    _tag: "Err",
    err: expect.any(TypeError),
  })
})
