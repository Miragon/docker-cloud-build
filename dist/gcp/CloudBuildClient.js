import * as core from "@actions/core";
import { CloudBuildClient as BuildClient } from "@google-cloud/cloudbuild";
import { google } from "@google-cloud/cloudbuild/build/protos/protos";
import { delay } from "../util/util";
var Status = google.devtools.cloudbuild.v1.Build.Status;
export class CloudBuildClient {
    client;
    /**
     * Creates a new instance.
     *
     * @param authenticationHelper The authentication helper providing the credentials
     */
    constructor(authenticationHelper) {
        const authFile = authenticationHelper.getAuthFile();
        core.debug(`Initializing CloudStorageClient with auth file ${authFile}`);
        this.client = new BuildClient({ keyFile: authFile });
    }
    async buildDockerImage(options) {
        const imageNames = options.build.tags.map(tag => `${options.build.image}:${tag}`);
        const buildOptions = {
            build: {
                source: {
                    storageSource: {
                        bucket: options.source.bucket,
                        object: options.source.path
                    }
                },
                steps: [
                    {
                        name: "gcr.io/cloud-builders/docker",
                        id: "Build",
                        args: [
                            "build",
                            // Make each tag to a "-t $tag" argument
                            ...imageNames.flatMap(name => ["-t", name]),
                            options.build.rootFolder
                        ]
                    }
                ],
                images: imageNames,
                projectId: options.projectId
            },
            projectId: options.projectId
        };
        let result;
        try {
            core.debug(`Starting build with options\n\n: ${JSON.stringify(buildOptions, undefined, 2)}`);
            core.debug(String(this.client));
            core.debug(String(this.client.createBuild));
            const [value] = await this.client.createBuild(buildOptions);
            core.debug("Started build");
            // Broken types
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            core.info(`Requested build with id ${value?.metadata?.build?.id}`);
            let error;
            value
                .promise()
                .then(([a]) => {
                result = a;
            })
                .catch(e => {
                error = e;
            });
            let currentStatus = -1;
            let lastPrint = -1;
            while (!error && !result) {
                // Print current status every five seconds or as soon as a change is detected and
                // check every 100ms (this is gRPC, so no request will be performed).
                // Broken types
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                const newStatus = value?.metadata?.build?.status;
                if (newStatus !== currentStatus
                    || lastPrint < new Date().getTime() - 5_000) {
                    currentStatus = newStatus;
                    lastPrint = new Date().getTime();
                    core.info(this.mapBuildStatus(currentStatus));
                }
                await delay(100);
            }
            if (value.latestResponse.error) {
                // Broken types
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                const errorLogs = value.metadata.build?.logUrl;
                const message = value.latestResponse.error.message || "";
                const code = value.latestResponse.error.code || -1;
                return {
                    logsUrl: errorLogs,
                    error: {
                        code,
                        message
                    }
                };
            }
            return {
                logsUrl: result?.logUrl || "Not Found",
                result: {
                    images: result?.results?.images?.map(image => ({
                        name: image.name || "Unknown",
                        digest: image.digest || "Unknown"
                    })) || []
                }
            };
        }
        catch (e) {
            core.error("Unexpected error");
            core.error(String(e.name));
            core.error(String(e.message));
            core.error(String(e.stack));
            core.error(String(e.cause));
            let errorMessage = "System error!";
            if (e instanceof Error) {
                errorMessage = e.message;
            }
            return {
                logsUrl: "Not Found",
                error: {
                    code: -1,
                    message: errorMessage
                }
            };
        }
    }
    mapBuildStatus(status) {
        switch (status) {
            default:
            case Status.STATUS_UNKNOWN: {
                return "Build is currently in an unknown status...";
            }
            case Status.QUEUED: {
                return "Build is currently queued...";
            }
            case Status.WORKING: {
                return "Build is currently working...";
            }
            case Status.SUCCESS: {
                return "Build was successful!";
            }
            case Status.FAILURE: {
                return "Build has failed!";
            }
            case Status.INTERNAL_ERROR: {
                return "Build has failed with an internal error!";
            }
            case Status.TIMEOUT: {
                return "Build has timed out!";
            }
            case Status.CANCELLED: {
                return "Build was cancelled!";
            }
            case Status.EXPIRED: {
                return "Build has expired!";
            }
        }
    }
}
