type Multiply = {
    (multiplier: number): {
        (value: number): number;
    };
    (multiplier: number, value: number): number;
};
/**
 * Multiply two numbers
 *
 * @tags numbers, transform, transform-value
 */
export declare const multiply: Multiply;
export {};
