type Subtract = {
    (amount: number): {
        (value: number): number;
    };
    (amount: number, value: number): number;
};
/**
 * Subtract one number from another
 *
 * @tags numbers, transform, transform-value
 */
export declare const subtract: Subtract;
export {};
