type IsGreaterThanOrEqualTo = {
    (other: number): {
        (value: unknown): boolean;
    };
    (other: number, value: unknown): boolean;
};
/**
 * Asserts that a value is greater than or equal to other.
 *
 * @tags guard, numbers, comparator
 */
export declare const isGreaterThanOrEqualTo: IsGreaterThanOrEqualTo;
export {};
