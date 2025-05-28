type IsDateInMonth = {
    (index: number): {
        (value: unknown): boolean;
    };
    (index: number, value: unknown): boolean;
};
/**
 * Asserts that a value is an instance of `Date` occurring on the given month of the year, where January is `0` and
 * December is `11`.
 *
 * @tags guard, dates, comparator
 */
export declare const isDateInMonth: IsDateInMonth;
export {};
