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
exports.CloudAuthenticationHelper = void 0;
const core = __importStar(require("@actions/core"));
const buffer_1 = require("buffer");
const fs_1 = require("fs");
const path_1 = require("path");
const uuid_1 = require("uuid");
class CloudAuthenticationHelper {
    /**
     * Creates a new instance.
     *
     * @param keyString The string containing the credentials for GCP.
     */
    constructor(keyString) {
        this.authFile = (0, path_1.resolve)(`./auth-${(0, uuid_1.v4)()}.json`);
        core.debug(`Exporting authentication information to ${this.authFile}`);
        (0, fs_1.writeFileSync)(this.authFile, buffer_1.Buffer.from(keyString, "base64"));
    }
    /**
     * Returns the path to the created authentication file.
     */
    getAuthFile() {
        return this.authFile;
    }
    /**
     * Deletes the created authentication file.
     */
    clean() {
        core.debug("Removing exported authentication information");
        (0, fs_1.unlinkSync)(this.authFile);
    }
}
exports.CloudAuthenticationHelper = CloudAuthenticationHelper;
