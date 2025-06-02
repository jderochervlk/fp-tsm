import { expect } from "@std/expect/expect"
import { Option, pipe, Record } from "./index.ts"
import { assertSpyCalls, spy } from "jsr:@std/testing/mock"

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
    Option.Do(function* () {
      const foo = yield* Option.bind(Option.fromPredicate(isFoo)("foo"))

      return fooFn(foo)
    }),
  )

  expect(result).toEqual(Option.of("bar"))
})

Deno.test("fromPredicate can work with a generic check", () => {
  const isGreaterThan10 = (n: number) => n > 10

  const result = Option.Do(function* () {
    const num1 = yield* Option.bind(Option.fromPredicate(11, isGreaterThan10))
    const num2 = yield* pipe(
      20,
      Option.fromPredicate(isGreaterThan10),
      Option.bind,
    )

    return num1 + num2
  })

  expect(result).toEqual(Option.of(31))
})

Deno.test("Do notation for Option", () => {
  const fn = spy() // testing that Do bails if a value is none
  const name = (
    first: Option.Option<string>,
    last: Option.Option<string>,
    city: Option.Option<string>,
    age: Option.Option<number>,
  ) => {
    return Option.Do(function* () {
      const firstName = yield* Option.bind(first)
      fn()
      const lastName = yield* Option.bind(last)
      fn()
      const cityName = yield* Option.bind(city)
      fn()
      const userAge = yield* Option.bind(age)
      fn()
      return `${firstName} ${lastName} from ${cityName}, age ${userAge}`
    })
  }

  expect(
    name(Option.none, Option.none, Option.of("new york"), Option.none),
  ).toEqual(
    Option.none,
  )

  // if the first value is none, the rest of the function is not executed
  assertSpyCalls(fn, 0)

  expect(
    name(
      Option.of("John"),
      Option.none,
      Option.of("new york"),
      Option.none,
    ),
  ).toEqual(
    Option.none,
  )

  // if the second value is none, the rest of the function is not executed, but we get the first call
  assertSpyCalls(fn, 1)

  expect(
    name(
      Option.of("John"),
      Option.of("Doe"),
      Option.of("new york"),
      Option.of(42),
    ),
  ).toEqual(
    Option.of("John Doe from new york, age 42"),
  )

  assertSpyCalls(fn, 5)
})

Deno.test("Greet with null", () => {
  function greet(name?: string | null) {
    // Name can be undefined, null, or a string, even though we only defined it as string | null

    // don't forget to not mix up === and ==!
    if (name === null) {
      // passing null means that we have a name, it's just null.
      return `Hello, anonymous!`
    } else if (name === undefined) {
      return `Hello, stranger!`
    }
    return `Hello, ${name}!`
  }

  expect(greet()).toEqual("Hello, stranger!")
  expect(greet(null)).toEqual("Hello, anonymous!")
  expect(greet("John")).toEqual("Hello, John!")
})

Deno.test("Greet example", () => {
  function greet(name: Option.Option<string> = Option.of("stranger")) {
    return pipe(
      name,
      Option.map((n) => `Hello, ${n}!`),
      Option.getOrElse(() => "Hello, anonymous!"),
    )
  }

  expect(greet()).toEqual("Hello, stranger!")
  expect(greet(Option.none)).toEqual("Hello, anonymous!")
  expect(greet(Option.of("John"))).toEqual("Hello, John!")
})

// An `Option` can be great to represent keys that are present on an Object vs ones that are not.
Deno.test("Object with undefined", () => {
  const obj: Record<string, string | undefined> = {
    name: "John",
    age: undefined,
    city: "New York",
  }
  expect(obj["name"]).toEqual("John")
  expect(obj["age"]).toEqual(undefined) // this is defined, but has no value
  expect(obj["height"]).toEqual(undefined) // this key doesn't exist
})

Deno.test("Object with undefined", () => {
  const obj: Record<string, Option.Option<string>> = {
    name: Option.some("John"),
    age: Option.none,
    city: Option.some("New York"),
  }
  expect(obj["name"]).toEqual(Option.some("John"))
  expect(obj["age"]).toEqual(Option.none) // this is defined, but has no value
  expect(obj["height"]).toEqual(undefined) // this key doesn't exist
})
