/**
 * Asserts that a value is a `Function` using `yield` syntax.
 *
 * @tags guard, functions, generator
 */
export declare const isGeneratorFunction: (value: unknown) => value is Generator<unknown, any, unknown>;
