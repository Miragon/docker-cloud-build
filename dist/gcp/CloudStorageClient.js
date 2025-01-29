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
exports.CloudStorageClient = void 0;
const core = __importStar(require("@actions/core"));
const storage_1 = require("@google-cloud/storage");
class CloudStorageClient {
    client;
    /**
     * Creates a new instance.
     *
     * @param authenticationHelper The authentication helper providing the credentials
     */
    constructor(authenticationHelper) {
        const authFile = authenticationHelper.getAuthFile();
        core.debug(`Initializing CloudStorageClient with auth file ${authFile}`);
        this.client = new storage_1.Storage({ keyFilename: authFile });
    }
    /**
     * Uploads a file.
     *
     * @param bucket The target bucket
     * @param fileName The name of the file to upload
     * @param destination The path within the bucket to upload the file to
     */
    async upload(bucket, fileName, destination) {
        try {
            await this.client.bucket(bucket).upload(fileName, {
                gzip: true,
                destination: destination
            });
        }
        catch (e) {
            let errorMessage = "System error!";
            if (e instanceof Error) {
                errorMessage = e.message;
            }
            throw new Error(`Could not upload ${fileName} to ${bucket}/${destination}: ${errorMessage}`);
        }
    }
    /**
     * Deletes a file.
     *
     * @param bucket The bucket
     * @param fileName The name and path of the file within the bucket
     */
    async delete(bucket, fileName) {
        try {
            await this.client.bucket(bucket).file(fileName).delete();
        }
        catch (e) {
            let errorMessage = "System error!";
            if (e instanceof Error) {
                errorMessage = e.message;
            }
            throw new Error(`Could not delete file ${bucket}/${fileName}: ${errorMessage}`);
        }
    }
}
exports.CloudStorageClient = CloudStorageClient;
