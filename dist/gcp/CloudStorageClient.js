"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloudStorageClient = void 0;
const core = __importStar(require("@actions/core"));
const storage_1 = require("@google-cloud/storage");
class CloudStorageClient {
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
            throw new Error(`Could not upload ${fileName} to ${bucket}/${destination}: ${e.message}`);
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
            throw new Error(`Could not delete file ${bucket}/${fileName}: ${e.message}`);
        }
    }
}
exports.CloudStorageClient = CloudStorageClient;
