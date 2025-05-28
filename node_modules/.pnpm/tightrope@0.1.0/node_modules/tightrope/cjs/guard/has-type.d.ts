export type HasType = {
    <T>(className: string): {
        (value: unknown): value is T;
    };
    <T>(className: string, value: unknown): value is T;
};
/**
 * Return true if `value` is an instance of a class with the given `name`.
 *
 * ## Examples
 *
 * ```ts
 * const isString = hasType('String');
 * isString('hello'); // true
 * isString(new String('hello')); // true
 * isString(123); // false
 *
 * const isArray = hasType('Array');
 * isArray([1, 2, 3]); // true
 * isArray('hello'); // false
 *
 * const isFunction = hasType('Function');
 * isFunction(()=> {})); // true
 * isFunction('hello'); // false
 *
 * class Person {
 *   constructor(name: string, age: number) {
 *     this.name = name;
 *     this.age = age;
 *   }
 * }
 *
 * const isPerson = hasType('Person');
 * isPerson(new Person('Alice', 25)); // true
 * isPerson({ name: 'Bob', age: 30 }); // false
 * ```
 *
 * ## Use Cases
 *
 * - Validating user input in a web application to ensure that it is of the expected type.
 * - Checking the type of data returned from an external API or data source to ensure it conforms to your expectations.
 * - Type checking and casting values in a custom function or utility module.
 * - Testing or debugging code by verifying that a value has the expected type before continuing with further processing.
 */
export declare const hasType: HasType;
