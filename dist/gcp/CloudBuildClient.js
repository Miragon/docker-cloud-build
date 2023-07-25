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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloudBuildClient = void 0;
const core = __importStar(require("@actions/core"));
const cloudbuild_1 = require("@google-cloud/cloudbuild");
const protos_1 = require("@google-cloud/cloudbuild/build/protos/protos");
const util_1 = require("../util/util");
var Status = protos_1.google.devtools.cloudbuild.v1.Build.Status;
class CloudBuildClient {
    /**
     * Creates a new instance.
     *
     * @param authenticationHelper The authentication helper providing the credentials
     */
    constructor(authenticationHelper) {
        const authFile = authenticationHelper.getAuthFile();
        core.debug(`Initializing CloudStorageClient with auth file ${authFile}`);
        this.client = new cloudbuild_1.CloudBuildClient({ keyFile: authFile });
    }
    async buildDockerImage(options) {
        var _a, _b, _c, _d, _e, _f, _g;
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
            const [value] = await this.client.createBuild(buildOptions);
            // Broken types
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            core.info(`Requested build with id ${(_b = (_a = value === null || value === void 0 ? void 0 : value.metadata) === null || _a === void 0 ? void 0 : _a.build) === null || _b === void 0 ? void 0 : _b.id}`);
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
                const newStatus = (_d = (_c = value === null || value === void 0 ? void 0 : value.metadata) === null || _c === void 0 ? void 0 : _c.build) === null || _d === void 0 ? void 0 : _d.status;
                if (newStatus !== currentStatus
                    || lastPrint < new Date().getTime() - 5000) {
                    currentStatus = newStatus;
                    lastPrint = new Date().getTime();
                    core.info(this.mapBuildStatus(currentStatus));
                }
                await (0, util_1.delay)(100);
            }
            if (value.latestResponse.error) {
                // Broken types
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                const errorLogs = (_e = value.metadata.build) === null || _e === void 0 ? void 0 : _e.logUrl;
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
                logsUrl: (result === null || result === void 0 ? void 0 : result.logUrl) || "Not Found",
                result: {
                    images: ((_g = (_f = result === null || result === void 0 ? void 0 : result.results) === null || _f === void 0 ? void 0 : _f.images) === null || _g === void 0 ? void 0 : _g.map(image => ({
                        name: image.name || "Unknown",
                        digest: image.digest || "Unknown"
                    }))) || []
                }
            };
        }
        catch (e) {
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
exports.CloudBuildClient = CloudBuildClient;
