type IsDateOnDayOfWeek = {
    (index: number): {
        (value: unknown): boolean;
    };
    (index: number, value: unknown): boolean;
};
/**
 * Asserts that a value is an instance of `Date` occurring on the day of the week with the given index, where Sunday is
 * `0` and Saturday is `6`.
 *
 * @tags guard, dates, comparator
 */
export declare const isDateOnDayOfWeek: IsDateOnDayOfWeek;
export {};
