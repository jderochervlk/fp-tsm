# Introduction

`fp-tsm` adds the [`Option`](data-types/option), [`Either`](data-types/either)
and [`Future`](/data-types/future) data types along with a suite of utility
functions to work these and other data structures in a safe and point-free
style.

## Why?

Traditional JavaScript code often requires many null checks, try/catch blocks,
and Promise error handling which can become difficult to read and maintain. For
example:

```typescript
const userSchema = z.object({
  email: z.string().email(),
  settings: z.object({
    theme: z.string().optional(),
  }).optional(),
})

async function getUserData(id: string): Promise<string> {
  try {
    const response = await fetch(`/api/users/${id}`)
      .catch((error) => {
        throw new Error(`Network error: ${error}`)
      })

    if (!response) {
      throw new Error("No response received")
    }

    const user = userSchema.parse(await response.json())

    const settings = user.settings

    if (!settings || !settings.theme) {
      return "default-theme"
    }

    return settings.theme
  } catch (error) {
    console.error("Failed to get user data:", error)
    return "default-theme"
  }
}
```

This code is error-prone and requires careful attention to null checks and error
handling. `fp-tsm` provides tools to handle these cases more elegantly. Also
notice how the return type is just a `Promise<string>`. We really don't if this
can fail, and what types of errors could happen.

Here's how the same code could be written using `fp-tsm`:

```typescript
const userSchema = z.object({
  email: z.string().email(),
  settings: z.object({
    theme: z.string().optional(),
  }).optional(),
})

const getUserData = (
  id: string,
): Future.Future<Error | ZodError, string> =>
  pipe(
    Future.fetch(`/api/users/${id}`),
    Future.mapLeft((error) => Error(`Network error: ${error}`)),
    Future.flatMap((res) => Future.fromPromise(res.json())),
    Future.mapLeft((error) => Error(`Failed to get user data: ${error}`)),
    Future.flatMap((data) => {
      const parsed = userSchema.safeParse(data)
      return parsed.success
        ? Future.right(parsed.data)
        : Future.left(parsed.error)
    }),
    Future.map((user) =>
      pipe(
        Option.of(user?.settings?.theme),
        Option.getOrElse(() => "default-theme"),
      )
    ),
  )
```

This version is:

- More declarative and easier to follow
- Handles errors gracefully without try/catch blocks
- Manages null checks through `Option`
- Processes async operations with `Future` which shows the types for possible
  errors

## fp-ts

`@jvlk/fp-tsm` is a fork of [`fp-ts`](https://gcanti.github.io/fp-ts/) that
supports ESM and removes more of the complex functional concepts. It's intended
to take the best features from languages like Rust and ReScript and make them
easy to use for TypeScript developers.

This is intended to be somewhat of a continuation of `fp-ts` and allow easy
upgrades from `fp-ts`, but it does diverge from that library in a few
significant ways.

- `fp-tsm` isn't as complex as `fp-ts`. It doesn't use things like `Monoid` or
  `Applicative` and just exports the data types and functions that developers
  will use.
- `fp-tsm` uses simpler types internally.
- `fp-tsm` is `esm` only.
- `fp-tsm` has robust documentation and presents things to developers in a way
  that they can learn about these concepts if they are not familiar with them.

## License

The MIT License (MIT)
