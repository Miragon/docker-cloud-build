/**
 * Delays execution for a specified amount of time.
 *
 * @param ms The time in ms.
 */
export const delay = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
};
/**
 * Replaces all characters that are not allowed in image tags with an underscore.
 *
 * @param input The string to normalize
 */
export const normalize = (input) => {
    return input.replace(/[^A-Za-z0-9._-]/g, "_");
};
