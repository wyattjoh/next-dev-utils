type IsDateOnOrAfter = {
    (other: unknown): {
        (value: unknown): boolean;
    };
    (other: unknown, value: unknown): boolean;
};
/**
 * Asserts that a value is an instance of `Date` occurring on or after the exact date and time of another.
 *
 * @tags guard, dates, comparator
 */
export declare const isDateOnOrAfter: IsDateOnOrAfter;
export {};
