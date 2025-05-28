/**
 * Asserts that a value is a valid `Array` containing no items.
 *
 * @tags guard, arrays, array-length, emptiness
 */
export declare const isEmptyArray: <T extends [] = []>(value: unknown) => value is T;
