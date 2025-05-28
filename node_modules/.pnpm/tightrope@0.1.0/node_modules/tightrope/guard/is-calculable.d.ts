/**
 * Assert value can be used in Mathemetic calculations despite not being a `Number`, for example `'1' * '2' === 2`
 * whereas `'wut?' * 2 === NaN`.
 *
 * @tags guard, strings, numbers
 */
export declare const isCalculable: <T = any>(value: any) => value is T;
