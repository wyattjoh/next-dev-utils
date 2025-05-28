/**
 * ## Example
 *
 * ```ts
 * import { pipe } from 'tightrope/fn/pipe';
 * import { error } from 'tightrope/console/error';
 *
 * pipe(12, error('the value is %s'));
 * // "the value is 12"
 * ```
 *
 * @tags console
 */
export declare const error: (template: string) => () => void;
