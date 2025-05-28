type IsGreaterThan = {
    (other: number): {
        (value: unknown): boolean;
    };
    (other: number, value: unknown): boolean;
};
/**
 * Asserts that a value is greater than another.
 *
 * @tags guard, numbers, comparator
 */
export declare const isGreaterThan: IsGreaterThan;
export {};
