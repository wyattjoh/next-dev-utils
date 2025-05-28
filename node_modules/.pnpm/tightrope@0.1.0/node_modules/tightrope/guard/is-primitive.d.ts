import type { JsonArray, JsonObject, JsonValue } from 'type-fest';
/**
 * Return true if value is `null`, `undefined`, `number`, `string`, or `boolean`
 *
 * @tags guard, primitives
 */
export declare function isPrimitive<T extends null>(value: T): true;
export declare function isPrimitive<T extends undefined>(value: T): true;
export declare function isPrimitive<T extends number>(value: T): true;
export declare function isPrimitive<T extends string>(value: T): true;
export declare function isPrimitive<T extends boolean>(value: T): true;
export declare function isPrimitive<T extends JsonObject>(value: T): false;
export declare function isPrimitive<T extends JsonArray>(value: T): false;
export declare function isPrimitive(value: unknown): value is Exclude<JsonValue, JsonObject | JsonArray>;
