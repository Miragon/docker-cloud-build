"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalize = exports.delay = void 0;
/**
 * Delays execution for a specified amount of time.
 *
 * @param ms The time in ms.
 */
const delay = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
};
exports.delay = delay;
/**
 * Replaces all characters that are not allowed in image tags with an underscore.
 *
 * @param input The string to normalize
 */
const normalize = (input) => {
    return input.replace(/[^A-Za-z0-9._-]/g, "_");
};
exports.normalize = normalize;
