import * as core from "@actions/core";
import { Storage } from "@google-cloud/storage";
export class CloudStorageClient {
    client;
    /**
     * Creates a new instance.
     *
     * @param authenticationHelper The authentication helper providing the credentials
     */
    constructor(authenticationHelper) {
        const authFile = authenticationHelper.getAuthFile();
        core.debug(`Initializing CloudStorageClient with auth file ${authFile}`);
        this.client = new Storage({ keyFilename: authFile });
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
