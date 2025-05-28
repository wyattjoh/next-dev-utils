type IsDateInYear = {
    (year: number): {
        (value: unknown): boolean;
    };
    (year: number, value: unknown): boolean;
};
/**
 * Asserts that a value is an instance of `Date` occurring in the given year.
 *
 * @tags guard, dates, comparator
 */
export declare const isDateInYear: IsDateInYear;
export {};
