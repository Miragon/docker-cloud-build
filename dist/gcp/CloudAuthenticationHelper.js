"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloudAuthenticationHelper = void 0;
const buffer_1 = require("buffer");
const google_auth_library_1 = require("google-auth-library");
class CloudAuthenticationHelper {
    key;
    /**
     * Creates a new instance.
     *
     * @param keyString The base64-encoded service account key for GCP.
     */
    constructor(keyString) {
        let key;
        try {
            key = JSON.parse(buffer_1.Buffer.from(keyString, "base64").toString("utf8"));
        }
        catch {
            throw new Error("Could not parse the service account key. It must be a base64-encoded JSON key file.");
        }
        // Only service account keys are supported. Other credential types can make the auth
        // library request arbitrary URLs or run executables.
        if (key?.type !== "service_account" || !key.client_email || !key.private_key) {
            throw new Error("The service account key must be a JSON key file of type 'service_account'.");
        }
        this.key = key;
    }
    /**
     * Creates a new auth client for the service account. Each API client needs its own
     * instance, as the client libraries configure the auth client for their API.
     */
    createAuthClient() {
        return new google_auth_library_1.JWT({
            email: this.key.client_email,
            key: this.key.private_key,
            keyId: this.key.private_key_id,
            scopes: ["https://www.googleapis.com/auth/cloud-platform"]
        });
    }
}
exports.CloudAuthenticationHelper = CloudAuthenticationHelper;
