type IsBefore = {
    (other: Date): {
        (value: Date): boolean;
    };
    (other: Date, value: Date): boolean;
};
/**
 * Asserts that a value is a valid instance of `Date` whose value occurs before that of another.
 *
 * @tags guard, dates, comparator
 */
export declare const isBefore: IsBefore;
export {};
