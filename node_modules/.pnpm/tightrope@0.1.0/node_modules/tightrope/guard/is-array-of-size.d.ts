type IsArrayOfSize = {
    (size: number): {
        (value: unknown): boolean;
    };
    (size: number, value: unknown): boolean;
};
/**
 * Asserts that a value is an `Array` containing a specific number of values.
 *
 * @tags guard, arrays, array-length
 */
export declare const isArrayOfSize: IsArrayOfSize;
export {};
