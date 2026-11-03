import { Buffer } from "buffer";
import { JWT } from "google-auth-library";

interface ServiceAccountKey {
    type?: string;
    client_email?: string;
    private_key?: string;
    private_key_id?: string;
}

export class CloudAuthenticationHelper {
    private readonly key: ServiceAccountKey;

    /**
     * Creates a new instance.
     *
     * @param keyString The base64-encoded service account key for GCP.
     */
    constructor(keyString: string) {
        let key: ServiceAccountKey | null;
        try {
            key = JSON.parse(Buffer.from(keyString, "base64").toString("utf8"));
        } catch {
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
    public createAuthClient(): JWT {
        return new JWT({
            email: this.key.client_email,
            key: this.key.private_key,
            keyId: this.key.private_key_id,
            scopes: ["https://www.googleapis.com/auth/cloud-platform"]
        });
    }
}
