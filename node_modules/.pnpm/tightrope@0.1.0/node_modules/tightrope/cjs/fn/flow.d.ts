/**
 * Creates a function which pipes its input through a sequence of functions in left-to-right order.
 *
 * A higher-order function that takes any number of functions as its arguments and returns a new function that applies
 * each function in sequence, passing the result of each function as the argument to the next function.
 *
 * ## Example
 *
 * In this example, we first define three functions: `addOne`, `double`, and `square`. We then use the `flow` function
 * to create a new function `composedFn` that composes these three functions together. We can then call `composedFn`
 * with an argument to get the result of applying the composed functions in sequence.
 *
 * Note that the flow function applies the functions in left to right order, so the first function given as an argument
 * is applied first.
 *
 * ```ts
 * import { flow } from 'tightrope/fn/flow';
 *
 * // Define some functions to compose
 * function addOne(n: number): number {
 *   return n + 1;
 * }
 *
 * function double(n: number): number {
 *   return n * 2;
 * }
 *
 * function square(n: number): number {
 *   return n * n;
 * }
 *
 * // Use flow to create a new function that composes the other functions
 * const composedFn = flow(addOne, double, square);
 *
 * // Call the composed function with an argument
 * const result = composedFn(3); // returns 64
 * ```
 *
 * @tags composition
 */
export declare function flow(): never;
export declare function flow<A extends Array<unknown>, B>(fn1: (...args: A) => B): (...args: A) => B;
export declare function flow<A extends Array<unknown>, B, C>(fn1: (...args: A) => B, fn2: (arg: B) => C): (...args: A) => C;
export declare function flow<A extends Array<unknown>, B, C, D>(fn1: (...args: A) => B, fn2: (arg: B) => C, fn3: (arg: C) => D): (...args: A) => D;
export declare function flow<A extends Array<unknown>, B, C, D, E>(fn1: (...args: A) => B, fn2: (arg: B) => C, fn3: (arg: C) => D, fn4: (arg: D) => E): (...args: A) => E;
export declare function flow<A extends Array<unknown>, B, C, D, E, F>(fn1: (...args: A) => B, fn2: (arg: B) => C, fn3: (arg: C) => D, fn4: (arg: D) => E, fn5: (arg: E) => F): (...args: A) => F;
export declare function flow<A extends Array<unknown>, B, C, D, E, F, G>(fn1: (...args: A) => B, fn2: (arg: B) => C, fn3: (arg: C) => D, fn4: (arg: D) => E, fn5: (arg: E) => F, fn6: (arg: F) => G): (...args: A) => G;
export declare function flow<A extends Array<unknown>, B, C, D, E, F, G, H>(fn1: (...args: A) => B, fn2: (arg: B) => C, fn3: (arg: C) => D, fn4: (arg: D) => E, fn5: (arg: E) => F, fn6: (arg: F) => G, fn7: (arg: G) => H): (...args: A) => H;
export declare function flow<A extends Array<unknown>, B, C, D, E, F, G, H, I>(fn1: (...args: A) => B, fn2: (arg: B) => C, fn3: (arg: C) => D, fn4: (arg: D) => E, fn5: (arg: E) => F, fn6: (arg: F) => G, fn7: (arg: G) => H, fn8: (arg: H) => I): (...args: A) => I;
export declare function flow<A extends Array<unknown>, B, C, D, E, F, G, H, I, J>(fn1: (...args: A) => B, fn2: (arg: B) => C, fn3: (arg: C) => D, fn4: (arg: D) => E, fn5: (arg: E) => F, fn6: (arg: F) => G, fn7: (arg: G) => H, fn8: (arg: H) => I, fn9: (arg: I) => J): (...args: A) => J;
