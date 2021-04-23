import * as core from "@actions/core";
import { Storage } from "@google-cloud/storage";
import { CloudAuthenticationHelper } from "./CloudAuthenticationHelper";

export class CloudStorageClient {
    private client: Storage;

    /**
     * Creates a new instance.
     *
     * @param authenticationHelper The authentication helper providing the credentials
     */
    constructor(authenticationHelper: CloudAuthenticationHelper) {
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
    public async upload(
        bucket: string,
        fileName: string,
        destination: string
    ): Promise<void> {
        try {
            await this.client.bucket(bucket).upload(fileName, {
                gzip: true,
                destination: destination
            });
        } catch (e) {
            throw new Error(`Could not upload ${fileName} to ${bucket}/${destination}: ${e.message}`);
        }
    }

    /**
     * Deletes a file.
     *
     * @param bucket The bucket
     * @param fileName The name and path of the file within the bucket
     */
    public async delete(
        bucket: string,
        fileName: string
    ): Promise<void> {
        try {
            await this.client.bucket(bucket).file(fileName).delete();
        } catch (e) {
            throw new Error(`Could not delete file ${bucket}/${fileName}: ${e.message}`);
        }
    }
}
