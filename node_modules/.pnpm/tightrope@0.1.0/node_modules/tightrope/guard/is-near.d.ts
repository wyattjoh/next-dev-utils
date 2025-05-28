type IsNear = {
    (otherNumber: number, epsilon: number, value: any): boolean;
    (otherNumber: number, epsilon: number): {
        (value: any): boolean;
    };
    (otherNumber: number): {
        (epsilon: number): {
            (value: any): boolean;
        };
        (epsilon: number, value: any): boolean;
    };
};
/**
 * Asserts that a value is a number within the given acceptable distance from another.
 *
 * @tags guard, numbers, comparator
 */
export declare const isNear: IsNear;
export {};
