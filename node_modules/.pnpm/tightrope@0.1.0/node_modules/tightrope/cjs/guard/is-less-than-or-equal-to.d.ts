type IsLessThanOrEqualTo = {
    (other: number): {
        (value: unknown): boolean;
    };
    (other: number, value: unknown): boolean;
};
/**
 * Asserts that a value is less than or equal to another.
 *
 * @tags guard, numbers, comparator
 */
export declare const isLessThanOrEqualTo: IsLessThanOrEqualTo;
export {};
