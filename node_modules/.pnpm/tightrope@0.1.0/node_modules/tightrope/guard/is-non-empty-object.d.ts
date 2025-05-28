/**
 * Asserts that a value is an `Object` containing at least one own member.
 *
 * @tags guard, objects, emptiness
 */
export declare function isNonEmptyObject<V, K extends string | number | symbol = string>(value: unknown): value is Record<K, V>;
