/**
 * Delays execution for a specified amount of time.
 *
 * @param ms The time in ms.
 */
export const delay = (ms: number): Promise<void> => {
    return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Replaces all characters that are not allowed in image tags with an underscore.
 *
 * @param input The string to normalize
 */
export const normalize = (input: string): string => {
    return input.replace(/[^A-Za-z0-9._-]/g, "_");
};

/**
 * Unwraps a Promise return type.
 */
export type Await<T> = T extends {
    then(onfulfilled?: (value: infer U) => unknown): unknown;
} ? U : T;
