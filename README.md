<h3 align="center">
  <a href="https://github.com/jderochervlk/fp-tsm">
    <img src="./fp-ts-logo.png">
  </a>
</h3>

<p align="center">
Functional programming in TypeScript
</p>

<p align="center">
  <a href="https://github.com/jderochervlk/fp-tsm/actions">
    <img src="https://github.com/jderochervlk/fp-tsm/actions/workflows/main.yml/badge.svg?branch=master" alt="build status" height="20">
  </a>
  <a href="https://www.npmjs.com/package/@jvlk/fp-tsm">
    <img src="https://img.shields.io/npm/dm/%40jvlk%2Ffp-tsm" alt="npm downloads" height="20">
  </a>
</p>


# Introduction
`@jvlk/fp-tsm` is a fork of [`fp-ts`](https://gcanti.github.io/fp-ts/) that supports ESM. If you need CJS support you should continue to use `fp-ts`. While `fp-tsm` has been updated to work with modern JS and TS, you should really consider using [`effect`](https://effect.website/) for new projects. `fp-ts` is now a part of `effect` and you will find much better support over there.

`fp-tsm` is a library for _typed functional programming_ in TypeScript.

`fp-tsm` aims to allow developers to use _popular patterns and abstractions_ that are available in most functional languages. For this, it includes the most popular data types, type classes and abstractions such as [Option](https://gcanti.github.io/fp-ts/modules/Option.ts), [Either](https://gcanti.github.io/fp-ts/modules/Either.ts), [IO](https://gcanti.github.io/fp-ts/modules/IO.ts), [Task](https://gcanti.github.io/fp-ts/modules/Task.ts), [Functor](https://gcanti.github.io/fp-ts/modules/Functor.ts), [Applicative](https://gcanti.github.io/fp-ts/modules/Applicative.ts), [Monad](https://gcanti.github.io/fp-ts/modules/Monad.ts) to empower users to write pure FP apps and libraries built atop higher order abstractions.

A distinctive feature of `fp-tsm` with respect to other functional libraries is its implementation of [Higher Kinded Types](<https://en.wikipedia.org/wiki/Kind_(type_theory)>), which TypeScript doesn't support natively.

**Inspired by**

- [Haskell](https://www.haskell.org)
- [PureScript](https://www.purescript.org)
- [Scala](https://www.scala-lang.org)

# Installation

To install the stable version:

```
npm install @jvlk/fp-tsm
```

Make sure to always have a single version of `fp-tsm` installed in your project. Multiple versions are known to cause `tsc` to hang during compilation. You can check the versions currently installed using `npm ls @jvlk/fp-tsm` (make sure there's a single version and all the others are marked as `deduped`).

## TypeScript compatibility

**Strictness** – This library is conceived, tested and is supposed to be consumed by TypeScript with the `strict` flag turned on.

`@jvlk/fp-tsm` is tested with TypeScript V5 and up and older versions might not work.

# Original fp-ts Documentation

These are docs for the original `fp-ts` which should cover what you need to use `fp-tsm`.

New docs are under development for `fp-tsm`. I'm hoping to eventually just use JSR for docs.

**Disclaimer**. Teaching functional programming is out of scope of this project, so the documentation assumes you already know what FP is.

- [Docs](https://gcanti.github.io/fp-ts)
- [Learning Resources](https://gcanti.github.io/fp-ts/learning-resources/)
- [Ecosystem](https://gcanti.github.io/fp-ts/ecosystem/)
- API Reference
  - [version 2.x (current)](https://gcanti.github.io/fp-ts/modules/)
  - [version 1.x](https://github.com/gcanti/fp-ts/tree/1.x/docs/modules/)

# License

The MIT License (MIT)
