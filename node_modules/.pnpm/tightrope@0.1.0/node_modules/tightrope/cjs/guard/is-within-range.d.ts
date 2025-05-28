type IsWithinRange = {
    (floor: number, ceiling: number, value: unknown): boolean;
    (floor: number, ceiling: number): {
        (value: unknown): boolean;
    };
    (floor: number): {
        (ceiling: number): {
            (value: unknown): boolean;
        };
        (ceiling: number, value: unknown): boolean;
    };
};
/**
 * Asserts that a value is a `Number` which is both greater than or equal to `floor` and less than or equal to
 * `ceiling`.
 *
 * @tags guard, numbers
 */
export declare const isWithinRange: IsWithinRange;
export {};
