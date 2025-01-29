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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArchiveClient = void 0;
const core = __importStar(require("@actions/core"));
const glob_1 = require("@actions/glob");
const fs_extra_1 = require("fs-extra");
const path_1 = __importDefault(require("path"));
const tar_1 = require("tar");
class ArchiveClient {
    /**
     * Creates a new instance.
     *
     * @param basePath The base path in which the client should work. No files outside of this path
     *                 will be included in the archive and everything will be relative to it.
     */
    constructor(basePath) {
        this.workspace = basePath.startsWith("/") ? basePath : `${basePath}/`;
    }
    /**
     * Creates a new archive from a list of file patterns.
     *
     * @param patterns The list of file patterns to add to the archive. Can contain glob wildcards
     *                 like * or **. Can match files and folders.
     * @param fileName The name of the new archive file
     * @param rootFolder The root folder within the archive
     */
    async archive(patterns, fileName, rootFolder) {
        try {
            const sources = [];
            for (const source of patterns) {
                core.debug(`Got the following pattern with workspace ${this.workspace}: ${source}`);
                const glob = await (0, glob_1.create)(source, {
                    followSymbolicLinks: false,
                    implicitDescendants: false
                });
                const patternMatches = (await glob.glob())
                    .filter(entry => entry.startsWith(this.workspace))
                    .map(entry => entry.substring(this.workspace.length));
                core.debug(`Found the following matching files: \n${patternMatches.join("\n")}`);
                sources.push(...patternMatches);
            }
            core.debug("Copying all files and folders to a common directory...");
            await (0, fs_extra_1.emptyDir)(rootFolder);
            for (const source of sources) {
                const basename = path_1.default.basename(source);
                const target = path_1.default.join(rootFolder, basename);
                core.debug(`Copying ${source} to ${target}`);
                await (0, fs_extra_1.copy)(source, target);
            }
            await (0, tar_1.create)({
                file: fileName,
                gzip: true
            }, [rootFolder]);
            await (0, fs_extra_1.remove)(rootFolder);
        }
        catch (e) {
            let errorMessage = "System error!";
            if (e instanceof Error) {
                errorMessage = e.message;
            }
            throw new Error(`Creating archive ${fileName} failed: ${errorMessage}`);
        }
    }
}
exports.ArchiveClient = ArchiveClient;
