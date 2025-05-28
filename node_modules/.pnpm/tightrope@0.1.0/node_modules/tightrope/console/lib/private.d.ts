type ConsoleMethod = 'error' | 'info' | 'log' | 'time' | 'timeEnd' | 'timeLog' | 'warn';
/** @private */
export declare const apply: (method: ConsoleMethod) => (template: string) => () => void;
export {};
