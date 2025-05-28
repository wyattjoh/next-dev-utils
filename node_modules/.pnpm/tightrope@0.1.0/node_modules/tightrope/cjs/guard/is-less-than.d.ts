type IsLessThan = {
    (other: number): {
        (value: unknown): boolean;
    };
    (other: number, value: unknown): boolean;
};
/**
 * Asserts that a value is less than another.
 *
 * @tags guard, numbers, comparator
 */
export declare const isLessThan: IsLessThan;
export {};
