import { Alt2C, Alt3C } from '../src/Alt.js'
import { Alternative2C, Alternative3C } from '../src/Alternative.js'
import { Applicative2C, Applicative3C } from '../src/Applicative.js'
import { Apply2C, Apply3C } from '../src/Apply.js'
import { Bifunctor2C, Bifunctor3C } from '../src/Bifunctor.js'
import { Chain2C, Chain3C } from '../src/Chain.js'
import { ChainRec2C, ChainRec3C } from '../src/ChainRec.js'
import { Comonad2C, Comonad3C } from '../src/Comonad.js'
import { Compactable2C, Compactable3C } from '../src/Compactable.js'
import { Contravariant2C, Contravariant3C } from '../src/Contravariant.js'
import { Extend2C, Extend3C } from '../src/Extend.js'
import { Filterable2C, Filterable3C } from '../src/Filterable.js'
import { FilterableWithIndex2C } from '../src/FilterableWithIndex.js'
import { Foldable2C, Foldable3C } from '../src/Foldable.js'
import { FoldableWithIndex2C, FoldableWithIndex3C } from '../src/FoldableWithIndex.js'
import { FromEither2C, FromEither3C } from '../src/FromEither.js'
import { FromIO2C, FromIO3C } from '../src/FromIO.js'
import { FromTask2C, FromTask3C } from '../src/FromTask.js'
import { Functor2C, Functor3C } from '../src/Functor.js'
import { FunctorWithIndex2C, FunctorWithIndex3C } from '../src/FunctorWithIndex.js'
import { Invariant2C, Invariant3C } from '../src/Invariant.js'
import { Monad2C, Monad3C } from '../src/Monad.js'
import { Pointed2C, Pointed3C } from '../src/Pointed.js'
import { Profunctor2C, Profunctor3C } from '../src/Profunctor.js'
import { Traversable2C } from '../src/Traversable.js'
import { TraversableWithIndex2C } from '../src/TraversableWithIndex.js'
import { Unfoldable2C, Unfoldable3C } from '../src/Unfoldable.js'
import { Witherable2C } from '../src/Witherable.js'

// $ExpectType string
export type _1 = Alt2C<'Either', string>['_E']

// $ExpectType string
export type _2 = Alt3C<'ReaderEither', string>['_E']

// $ExpectType string
export type _3 = Alternative2C<'Either', string>['_E']

// $ExpectType string
export type _4 = Alternative3C<'ReaderEither', string>['_E']

// $ExpectType string
export type _5 = Applicative2C<'Either', string>['_E']

// $ExpectType string
export type _6 = Applicative3C<'ReaderEither', string>['_E']

// $ExpectType string
export type _7 = Apply2C<'Either', string>['_E']

// $ExpectType string
export type _8 = Apply3C<'ReaderEither', string>['_E']

// $ExpectType string
export type _9 = Bifunctor2C<'Either', string>['_E']

// $ExpectType string
export type _10 = Bifunctor3C<'ReaderEither', string>['_E']

// $ExpectType string
export type _11 = Comonad2C<'Either', string>['_E']

// $ExpectType string
export type _12 = Comonad3C<'ReaderEither', string>['_E']

// $ExpectType string
export type _13 = Compactable2C<'Either', string>['_E']

// $ExpectType string
export type _14 = Compactable3C<'ReaderEither', string>['_E']

// $ExpectType string
export type _15 = Contravariant2C<'Either', string>['_E']

// $ExpectType string
export type _16 = Contravariant3C<'ReaderEither', string>['_E']

// $ExpectType string
export type _17 = Extend2C<'Either', string>['_E']

// $ExpectType string
export type _18 = Extend3C<'ReaderEither', string>['_E']

// $ExpectType string
export type _19 = Filterable2C<'Either', string>['_E']

// $ExpectType string
export type _20 = Filterable3C<'ReaderEither', string>['_E']

// $ExpectType string
export type _21 = FilterableWithIndex2C<'Either', number, string>['_E']

// $ExpectType string
export type _22 = Foldable2C<'Either', string>['_E']

// $ExpectType string
export type _23 = Foldable3C<'ReaderEither', string>['_E']

// $ExpectType string
export type _24 = FoldableWithIndex2C<'Either', number, string>['_E']

// $ExpectType string
export type _25 = FoldableWithIndex3C<'ReaderEither', number, string>['_E']

// $ExpectType string
export type _26 = FromEither2C<'Either', string>['_E']

// $ExpectType string
export type _27 = FromEither3C<'ReaderEither', string>['_E']

// $ExpectType string
export type _28 = FromIO2C<'Either', string>['_E']

// $ExpectType string
export type _29 = FromIO3C<'ReaderEither', string>['_E']

// $ExpectType string
export type _30 = FromTask2C<'Either', string>['_E']

// $ExpectType string
export type _31 = FromTask3C<'ReaderEither', string>['_E']

// $ExpectType string
export type _32 = Functor2C<'Either', string>['_E']

// $ExpectType string
export type _33 = Functor3C<'ReaderEither', string>['_E']

// $ExpectType string
export type _34 = FunctorWithIndex2C<'Either', number, string>['_E']

// $ExpectType string
export type _35 = FunctorWithIndex3C<'ReaderEither', number, string>['_E']

// $ExpectType string
export type _36 = Invariant2C<'Either', string>['_E']

// $ExpectType string
export type _37 = Invariant3C<'ReaderEither', string>['_E']

// $ExpectType string
export type _38 = Monad2C<'Either', string>['_E']

// $ExpectType string
export type _39 = Monad3C<'ReaderEither', string>['_E']

// $ExpectType string
export type _40 = Pointed2C<'Either', string>['_E']

// $ExpectType string
export type _41 = Pointed3C<'ReaderEither', string>['_E']

// $ExpectType string
export type _42 = Profunctor2C<'Either', string>['_E']

// $ExpectType string
export type _43 = Profunctor3C<'ReaderEither', string>['_E']

// $ExpectType string
export type _44 = Traversable2C<'Either', string>['_E']

// $ExpectType string
export type _45 = TraversableWithIndex2C<'Either', number, string>['_E']

// $ExpectType string
export type _46 = Unfoldable2C<'Either', string>['_E']

// $ExpectType string
export type _47 = Unfoldable3C<'ReaderEither', string>['_E']

// $ExpectType string
export type _48 = Witherable2C<'Either', string>['_E']

// $ExpectType string
export type _49 = Chain2C<'Either', string>['_E']

// $ExpectType string
export type _50 = Chain3C<'ReaderEither', string>['_E']

// $ExpectType string
export type _51 = ChainRec2C<'Either', string>['_E']

// $ExpectType string
export type _52 = ChainRec3C<'ReaderEither', string>['_E']
