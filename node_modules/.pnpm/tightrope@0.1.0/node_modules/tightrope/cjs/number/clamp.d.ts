export type Clamp = {
    (floor: number, ceiling: number, value: number): number;
    (floor: number, ceiling: number): {
        (value: number): number;
    };
    (floor: number): {
        (ceiling: number): {
            (value: number): number;
        };
        (ceiling: number, value: number): number;
    };
};
/**
 * Returns a number within the specified range, if the original value is not already within that range.
 *
 * @tags numbers, transform, transform-value
 */
export declare const clamp: Clamp;
