/**
 * ...
 *
 * @tags console
 */
export declare function createTimer(id: string): {
    start(): void;
    stop(): void;
    log(msg: string): () => void;
};
