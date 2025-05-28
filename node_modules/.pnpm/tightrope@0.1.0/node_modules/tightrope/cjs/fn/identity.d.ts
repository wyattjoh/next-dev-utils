/**
 * A function that takes any value as its argument and returns the same value.
 *
 * It is commonly used as a placeholder function in functional programming.
 *
 * ## Example
 *
 * In this example, we simply call the `identity` function with a value of `42` and assign the result to a variable
 * `result`. Since `identity` simply returns its input value, the value of `result` is also `42`.
 *
 * ```ts
 * import { identity } from 'tightrope/fn/identity';
 *
 * // Use identity to return a value
 * const value = 42;
 * const result = identity(value); // returns 42
 * ```
 *
 * The `identity` function can be useful in many scenarios, such as when passing a function as an argument to another
 * function that expects a function, but you don't need to perform any actual transformation on the input value.
 *
 * @tags composition
 */
export declare function identity<T>(value: T): T;
