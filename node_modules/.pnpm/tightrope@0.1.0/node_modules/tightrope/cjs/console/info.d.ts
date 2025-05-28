/**
 * ## Example
 *
 * ```ts
 * import { pipe } from 'tightrope/fn/pipe';
 * import { info } from 'tightrope/console/info';
 *
 * pipe(12, info('the value is %s'));
 * // "the value is 12"
 * ```
 *
 * @tags console
 */
export declare const info: (template: string) => () => void;
