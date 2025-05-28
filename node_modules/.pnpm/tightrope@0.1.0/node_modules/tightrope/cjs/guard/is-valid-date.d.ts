/**
 * Asserts that a value is an instance of `Date` whose internal value is valid. `Date` is little like `Promise` in that
 * it is a container for a value. For example, `new Date('wut?')` is a valid `Date` which wraps a value that is not
 * valid.
 *
 * @tags guard, dates
 */
export declare const isValidDate: (value: unknown) => value is Date;
