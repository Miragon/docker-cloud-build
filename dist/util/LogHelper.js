"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.printImageSummary = void 0;
const core = __importStar(require("@actions/core"));
/**
 * Prints the built images as a summary of tags and digests.
 *
 * @param buildResult The Cloud Build result to print
 */
const printImageSummary = (buildResult) => {
    var _a, _b;
    core.info("Build was successful!");
    core.info(`Build logs are available here: ${buildResult.logsUrl}`);
    if (((_a = buildResult.result) === null || _a === void 0 ? void 0 : _a.images.length) === 0) {
        core.info("No images built.");
    }
    else {
        core.info("Built the following images:\n");
        const nameToDigest = [];
        let longestName = 0;
        (_b = buildResult.result) === null || _b === void 0 ? void 0 : _b.images.forEach(image => {
            var _a;
            const digest = (_a = image.digest) === null || _a === void 0 ? void 0 : _a.substring(0, 15);
            const name = image.name;
            if (name && name.length > longestName) {
                longestName = name.length;
            }
            nameToDigest.push([name, digest]);
        });
        const nameLength = longestName + 4;
        core.info("IMAGE".padEnd(nameLength, " ") + "DIGEST".padEnd(15, " "));
        core.info("=".repeat(nameLength + 15));
        for (const [name, digest] of nameToDigest) {
            core.info((name || "").padEnd(nameLength, " ") + (digest || "").padEnd(15, " "));
        }
    }
};
exports.printImageSummary = printImageSummary;
