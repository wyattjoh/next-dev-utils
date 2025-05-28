type IsDivisibleBy = {
    (other: number): {
        (value: unknown): boolean;
    };
    (other: number, value: unknown): boolean;
};
/**
 * Asserts that a value is a `Number` which results in a whole number when divided by another.
 *
 * @tags guard, numbers
 */
export declare const isDivisibleBy: IsDivisibleBy;
export {};
