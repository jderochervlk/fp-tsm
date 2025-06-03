
---
title: fp-tsm
---
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

`@jvlk/fp-tsm` is a fork of [`fp-ts`](https://gcanti.github.io/fp-ts/) that
supports ESM and removes more of the complex functional concepts. It's intended
to take the best features from languages like Rust and ReScript and make them
easy to use for TypeScript developers.

# Philosophy

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

# License

The MIT License (MIT)
