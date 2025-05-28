export type Is = {
    <T>(b: T): {
        (a: unknown): boolean;
    };
    <T>(b: T, a: unknown): boolean;
};
/**
 * Returns whether both values are referentially equal, ie. `a === b`. This will be the case when both values are
 * primitives (undefined, number, null, string, or boolean) or they are objects which both point to the same address in
 * memory.
 *
 * @tags guard, comparator
 */
export declare const is: Is;
