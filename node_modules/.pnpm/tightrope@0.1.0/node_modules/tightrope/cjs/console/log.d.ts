/**
 * ## Example
 *
 * ```ts
 * import { pipe } from 'tightrope/fn/pipe';
 * import { log } from 'tightrope/console/log';
 *
 * pipe(12, log('the value is %s'));
 * // "the value is 12"
 * ```
 *
 * @tags console
 */
export declare const log: (template: string) => () => void;
