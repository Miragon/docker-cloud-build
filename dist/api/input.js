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
exports.loadInput = void 0;
const core = __importStar(require("@actions/core"));
const DESCRIPTION_SIZES = [
    "large",
    "medium",
    "small",
    "tiny"
];
const GCR_REGIONS = [
    "gcr.io",
    "eu.gcr.io",
    "us.gcr.io",
    "asia.gcr.io"
];
const getRequiredStringParam = (name) => {
    return core.getInput(name, { required: true });
};
const getOptionalStringParam = (name, defaultValue) => {
    return core.getInput(name) || defaultValue;
};
const getOptionalStringArrayParam = (name, defaultValue) => {
    const input = core.getInput(name);
    if (input) {
        return input.split(",");
    }
    return defaultValue;
};
const getRequiredStringArrayParam = (name) => {
    const input = core.getInput(name, { required: true });
    return input.split(",");
};
const getOptionalBooleanParam = (name, defaultValue) => {
    const input = core.getInput(name);
    switch (input.toLowerCase()) {
        case "true":
            return true;
        case "false":
            return false;
        default:
            return defaultValue;
    }
};
const loadInput = () => {
    const gcpProjectId = getRequiredStringParam("gcp-project-id");
    const gcpServiceAccountKey = getRequiredStringParam("gcp-service-account-key");
    const gcpCloudStorageBucket = getOptionalStringParam("gcp-cloud-storage-bucket", `${gcpProjectId}_cloudbuild`);
    const gcpGcrRegion = getOptionalStringParam("gcp-gcr-region", "eu.gcr.io");
    const imageName = getRequiredStringParam("image-name");
    const imageSources = getRequiredStringArrayParam("image-sources");
    const imageTagLatest = getOptionalBooleanParam("image-tag-latest", false);
    const imageTagBranchLatest = getOptionalBooleanParam("image-tag-branch-latest", false);
    const imageTagAdditionalTags = getOptionalStringArrayParam("image-tag-additional-tags", []);
    const githubToken = getOptionalStringParam("github-token", "");
    const githubDisabled = getOptionalBooleanParam("github-disabled", false);
    const githubCommitStatusDisabled = getOptionalBooleanParam("github-commit-status-disabled", false);
    const githubCommitStatusAll = getOptionalBooleanParam("github-commit-status-all", false);
    const githubCommitStatusDescription = getOptionalStringParam("github-commit-status-description", "small");
    const githubCommitStatusTitle = getOptionalStringParam("github-commit-status-title", "Docker Image");
    const githubReleaseInformationDisabled = getOptionalBooleanParam("github-release-information-disabled", false);
    const githubReleaseInformationAll = getOptionalBooleanParam("github-release-information-all", false);
    if (GCR_REGIONS.indexOf(gcpGcrRegion) === -1) {
        throw new Error("Invalid value passed for argument gcp-gcr-region. Expected one of "
            + `[${GCR_REGIONS.join(", ")}], but got ${gcpGcrRegion}.`);
    }
    if (!githubToken && !githubDisabled) {
        throw new Error("You must either set github-disabled to true or set github-token!");
    }
    if (DESCRIPTION_SIZES.indexOf(githubCommitStatusDescription) === -1) {
        throw new Error("Invalid value passed for argument github-commit-status-description. "
            + `Expected one of [${DESCRIPTION_SIZES.join(", ")}], but got ${githubCommitStatusDescription}.`);
    }
    if (githubCommitStatusTitle.length === 0) {
        throw new Error("Empty string passed for argument github-commit-status-title. Expected a non-empty string.");
    }
    return {
        gcp: {
            projectId: gcpProjectId,
            serviceAccountKey: gcpServiceAccountKey,
            cloudStorage: {
                bucket: gcpCloudStorageBucket
            },
            gcr: {
                host: gcpGcrRegion
            }
        },
        github: {
            disabled: githubDisabled,
            token: githubToken,
            commitStatus: {
                disabled: githubCommitStatusDisabled,
                all: githubCommitStatusAll,
                description: githubCommitStatusDescription,
                title: githubCommitStatusTitle
            },
            releaseInformation: {
                disabled: githubReleaseInformationDisabled,
                all: githubReleaseInformationAll
            }
        },
        image: {
            name: imageName,
            sources: imageSources,
            tags: {
                latest: imageTagLatest,
                branchLatest: imageTagBranchLatest,
                additionalTags: imageTagAdditionalTags
            }
        }
    };
};
exports.loadInput = loadInput;
