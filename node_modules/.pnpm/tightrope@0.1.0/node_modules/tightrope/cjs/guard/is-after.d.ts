type IsAfter = {
    (otherDate: Date): {
        (date: Date): boolean;
    };
    (otherDate: Date, date: Date): boolean;
};
/**
 * Asserts that a value is a valid instance of `Date` whose value occurs after that of another.
 *
 * @tags guard, dates, comparator
 */
export declare const isAfter: IsAfter;
export {};
