type StartsWith = {
    (otherString: string): {
        (value: unknown): boolean;
    };
    (otherString: string, value: unknown): boolean;
};
/**
 * Asserts that value is a string whose trailing characters are equal to those of the provided string.
 *
 * @tags guard, strings, string-length, comparator
 */
export declare const startsWith: StartsWith;
export {};
