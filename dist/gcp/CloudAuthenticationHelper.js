import * as core from "@actions/core";
import { Buffer } from "buffer";
import { unlinkSync, writeFileSync } from "fs";
import { resolve } from "path";
import { v4 } from "uuid";
export class CloudAuthenticationHelper {
    authFile;
    /**
     * Creates a new instance.
     *
     * @param keyString The string containing the credentials for GCP.
     */
    constructor(keyString) {
        this.authFile = resolve(`./auth-${v4()}.json`);
        core.debug(`Exporting authentication information to ${this.authFile}`);
        writeFileSync(this.authFile, Buffer.from(keyString, "base64"));
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
        unlinkSync(this.authFile);
    }
}
