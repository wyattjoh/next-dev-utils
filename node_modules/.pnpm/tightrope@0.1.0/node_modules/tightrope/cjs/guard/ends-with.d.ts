type EndsWith = {
    (otherString: unknown): {
        (value: unknown): boolean;
    };
    (otherString: unknown, value: unknown): boolean;
};
/**
 * Return true if a given value ends with a specific string.
 *
 * ## Examples
 *
 * ```ts
 * import { endsWith } from 'tightrope/guard/ends-with';
 *
 * const isAboutUsPage = endsWith('/about-us');
 * isAboutUsPage('https://example.com/about-us'); // true
 * ```
 *
 * ## Use Cases
 *
 * `endsWith` is commonly used for string manipulation and validation:
 *
 * 1. **Checking file extensions**: You can use endsWith to check if a given file path ends with a specific extension,
 *    e.g., .txt, .jpg, .pdf, etc.
 * 2. **URL validation**: You can use endsWith to validate URLs by checking if they end with certain strings, such as .com,
 *    .org, .net, etc.
 * 3. **Path manipulation**: endsWith can be used to check if a given file path ends with a specific directory or filename.
 * 4. **String formatting**: You can use endsWith to format strings, such as adding a suffix to a word or phrase if it
 *    doesn't already have it.
 *
 * @tags guard, strings, string-length, comparator
 */
export declare const endsWith: EndsWith;
export {};
