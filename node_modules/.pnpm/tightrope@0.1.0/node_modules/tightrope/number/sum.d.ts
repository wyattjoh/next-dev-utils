type Sum = {
    (amount: number): {
        (value: number): number;
    };
    (amount: number, value: number): number;
};
/**
 * Return the sum of two numbers
 *
 * @tags numbers, transform, transform-value
 */
export declare const sum: Sum;
export {};
