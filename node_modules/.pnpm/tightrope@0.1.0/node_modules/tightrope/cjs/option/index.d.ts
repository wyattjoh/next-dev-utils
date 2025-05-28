/**
 * `Option` is a type that represents either a value (`Some`) or the absence of a value (`None`).
 *
 * `Option<T>` is the type used for expressing the possibility of the absence of a value. It is an enum with the
 * variants, `Some(T)`, representing the presence of a value, and `None`, representing the absence of a value.
 *
 * :::info
 *
 * `Option` allows you to construct a pipeline of commands that handle both the `Some` and `None` variants. This is
 * useful for handling cases where a value might be missing or undefined, and branching based on whether the previous
 * operation returned a value or not.
 *
 * :::
 *
 * :::tip
 *
 * Other terminology you might have heard:
 *
 * - `Option` is sometimes referred to as `Maybe`.
 * - `Some` is sometimes referred to as `Just` or "the value path".
 * - `None` is sometimes referred to as `Nothing` or "the empty path".
 *
 * :::
 *
 * @tags option, type
 */
export type Option<T> = Some<T> | None;
/**
 * Represent a value in the `Option` type.
 *
 * ## Example
 *
 * Here is how to create one directly:
 *
 * ```ts
 * import { Some } from 'tightrope/option';
 *
 * const value = new Some('Hello, world!');
 * ```
 *
 * You can check if a value is a `Some` instance by using the `isSome` function.
 *
 * ```ts
 * import { isSome } from 'tightrope/option/is-some';
 *
 * const value = new Some('Hello, world!');
 * console.log(isSome(value)); // true
 * console.log(isSome('foo')); // false
 * console.log(isSome('Hello, world! but this is not inside a Some')); // false
 * ```
 *
 * `Some` instances are usually returned from functions that might not return a value, and are combined with `None`
 * instances using the `Option` type.
 *
 * ## Use Cases
 *
 * Creating a `Some` instance directly is useful when you want to represent a value in your program without having to go
 * through a pipeline or helper method that might not always be available or suitable for your specific use case.
 *
 * For example, if you're writing a custom value handler for your application and you need to represent a specific value
 * condition, you can create a `Some` instance directly with the value you want to use. This can give you more control
 * over the specific values that your application can encounter and how they are handled.
 *
 * Another use case for creating a `Some` instance directly is when you are writing tests for your application and you
 * want to simulate a value condition. By creating a `Some` instance directly with a specific value, you can test how
 * your application handles that value condition and ensure that it behaves as expected.
 *
 * @tags option, class, wrap
 */
export declare class Some<T> {
    readonly _tag = "Some";
    readonly value: T;
    constructor(value: T);
    static create<T>(value: T): Some<T>;
}
export type None = typeof none;
/**
 * Represent an absence of value in the `Option` type.
 *
 * ## Example
 *
 * You can check if a value is a `None` instance by using the `isNone` function.
 *
 * ```ts
 * import { isNone } from 'tightrope/option/is-none';
 *
 * console.log(isNone(none)); // true
 * console.log(isNone('foo')); // false
 * console.log(isNone(null)); // false
 * ```
 *
 * `None` instances are usually returned from functions that might not return a value, and are combined with `Some`
 * instances using the `Option` type.
 *
 * ## Use Cases
 *
 * Referencing the `None` instance is useful when you want to represent an absence of value in your program without
 * having to go through a pipeline or helper method that might not always be available or suitable for your specific use
 * case.
 *
 * For example, if you're writing a custom value handler for your application and you need to represent a specific
 * absence of value condition, you can reference the `None` instance. This can give you more control over the specific
 * value absences that your application can encounter and how they are handled.
 *
 * Another use case for referencing the `None` instance is when you are writing tests for your application and you want
 * to simulate a value absence condition. By referencing the `None` instance, you can test how your application handles
 * that value absence condition and ensure that it behaves as expected.
 *
 * @tags option, class, errors, wrap
 */
export declare const none: Readonly<{
    _tag: "None";
}>;
