/**
 * Asserts that a value is a function using `async` and `await` syntax.
 *
 * @tags guard, functions, async
 */
export declare const isAsyncFunction: (value: unknown) => value is (...args: any[]) => Promise<any>;
