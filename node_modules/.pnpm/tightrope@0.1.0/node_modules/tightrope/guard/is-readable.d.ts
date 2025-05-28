import type { JsonValue } from 'fast-check';
/**
 * Asserts that a value is safe to attempt to read property values from.
 *
 * Only `null` and `undefined` will error if you try to read a property on them using dot notation.
 *
 * ## Example
 *
 * @tags guard. objects, arrays
 */
export declare function isReadable<T extends null>(value: T): false;
export declare function isReadable<T extends undefined>(value: T): false;
export declare function isReadable<T extends null | undefined>(value: T): false;
export declare function isReadable<T extends JsonValue>(value: T): value is Exclude<T, null | undefined>;
export declare function isReadable(value: unknown): value is Exclude<JsonValue, null | undefined>;
