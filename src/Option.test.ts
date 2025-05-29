import { expect } from "@std/expect/expect"
import { Option, pipe, Record } from "./index.ts"

Deno.test("generic that in a union of null can be used with of, map, and flatMap", () => {
  type A = { a?: string | null } | null
  const a: A = { a: "test" }

  function fn<T extends A>(data: T | undefined) {
    return pipe(
      Option.of(data),
      Option.flatMap(Record.lookup("a")),
      Option.map((value) => value.toUpperCase()),
    )
  }

  const result = fn(a)
  expect(result).toEqual(Option.of("TEST"))
})

Deno.test("fromPredicate can type narrow", () => {
  type Foo = "foo"

  const isFoo = (value: string): value is Foo => value === "foo"

  const fooFn = (_: Foo) => "bar"

  const result = pipe(
    Option.Do,
    Option.bind("foo", () => Option.fromPredicate(isFoo)("foo")),
    Option.map(({ foo }) => fooFn(foo)),
  )

  expect(result).toEqual(Option.of("bar"))
})
