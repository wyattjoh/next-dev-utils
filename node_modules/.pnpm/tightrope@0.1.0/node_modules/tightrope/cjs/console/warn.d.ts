/**
 * ## Example
 *
 * ```ts
 * import { pipe } from 'tightrope/fn/pipe';
 * import { warn } from 'tightrope/console/warn';
 *
 * pipe(12, warn('the value is %s'));
 * // "the value is 12"
 * ```
 *
 * @tags console
 */
export declare const warn: (template: string) => () => void;
