type IsDateOnDayOfMonth = {
    (dayOfMonth: number): {
        (value: unknown): boolean;
    };
    (dayOfMonth: number, value: unknown): boolean;
};
/**
 * Asserts that a value is an instance of `Date` occurring on the given day of the month, where the first day of the
 * month is `1` and last is `31`.
 *
 * @tags guard, dates, comparator
 */
export declare const isDateOnDayOfMonth: IsDateOnDayOfMonth;
export {};
