import * as core from "@actions/core";
import { CloudBuildClient as BuildClient } from "@google-cloud/cloudbuild";
import { google } from "@google-cloud/cloudbuild/build/protos/protos";
import { delay } from "../util/util";
import { CloudAuthenticationHelper } from "./CloudAuthenticationHelper";
import Status = google.devtools.cloudbuild.v1.Build.Status;
import IBuild = google.devtools.cloudbuild.v1.IBuild;
import IBuildOperationMetadata = google.devtools.cloudbuild.v1.IBuildOperationMetadata;
import Operation = google.longrunning.Operation;
import ICreateBuildRequest = google.devtools.cloudbuild.v1.ICreateBuildRequest;

export interface CloudBuildOptions {
    projectId: string,
    source: {
        bucket: string,
        path: string
    },
    build: {
        image: string,
        tags: string[],
        rootFolder: string
    }
}

export interface CloudBuildResult {
    logsUrl: string;
    error?: {
        message: string;
        code: number;
    };
    result?: {
        images: {
            name: string;
            digest: string;
        }[];
    }
}

export class CloudBuildClient {
    private client: BuildClient;

    /**
     * Creates a new instance.
     *
     * @param authenticationHelper The authentication helper providing the credentials
     */
    constructor(authenticationHelper: CloudAuthenticationHelper) {
        const authFile = authenticationHelper.getAuthFile();
        core.debug(`Initializing CloudStorageClient with auth file ${authFile}`);
        this.client = new BuildClient({ keyFile: authFile });
    }

    public async buildDockerImage(options: CloudBuildOptions): Promise<CloudBuildResult> {
        const imageNames = options.build.tags.map(tag => `${options.build.image}:${tag}`);

        const buildOptions: ICreateBuildRequest = {
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

        let result: IBuild | undefined;

        try {
            const [value] = await this.client.createBuild(buildOptions);

            // Broken types
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            core.info(`Requested build with id ${value?.metadata?.build?.id}`);

            let error: Error | undefined;

            value
                .promise()
                .then(([a]: [IBuild, IBuildOperationMetadata, Operation]) => {
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
                if (
                    newStatus !== currentStatus
                    || lastPrint < new Date().getTime() - 5_000
                ) {
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
        } catch (e) {
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

    private mapBuildStatus(status: number): string {
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
