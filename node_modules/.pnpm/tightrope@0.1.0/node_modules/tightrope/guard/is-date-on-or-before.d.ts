type IsDateOnOrBefore = {
    (other: unknown): {
        (value: unknown): boolean;
    };
    (other: unknown, value: unknown): boolean;
};
/**
 * Asserts that a value is an instance of `Date` occurring on or before the exact date and time of another.
 *
 * @tags guard, dates, comparator
 */
export declare const isDateOnOrBefore: IsDateOnOrBefore;
export {};
