/**
 * Asserts that a value is a valid `Object` containing no instance members.
 *
 * @tags guard, objects, emptiness
 */
export declare const isEmptyObject: <T extends Record<string, unknown>>(value: unknown) => value is T;
