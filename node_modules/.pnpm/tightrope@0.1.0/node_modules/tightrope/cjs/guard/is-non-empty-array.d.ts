/**
 * Asserts that a value is an `Array` containing at least one value.
 *
 * @tags guard, arrays, emptiness
 */
export declare const isNonEmptyArray: <T extends any[] = any[]>(value: unknown) => value is T;
