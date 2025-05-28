type IsDateBetween = {
    (floor: Date, ceiling: Date, date: Date): boolean;
    (floor: Date, ceiling: Date): {
        (date: Date): boolean;
    };
    (floor: Date): {
        (ceiling: Date): {
            (date: Date): boolean;
        };
        (ceiling: Date, date: Date): boolean;
    };
};
/**
 * Asserts that a value is an instance of `Date` occurring on or after `floor` and on or before `ceiling`.
 *
 * @tags guard, dates, comparator
 */
export declare const isDateBetween: IsDateBetween;
export {};
