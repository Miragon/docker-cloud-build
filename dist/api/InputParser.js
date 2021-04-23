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
exports.parseInput = void 0;
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
const invalidEnumArgument = (argument, expected, actual) => {
    return `Invalid value passed for argument ${argument}. `
        + `Expected one of ${expected.join(", ")}, but got ${actual}.`;
};
const invalidStringArgument = (argument, expected, actual) => {
    return `Invalid value passed for argument ${argument}. `
        + `Expected ${expected}, but got ${actual}.`;
};
const throwLoadInputError = (message) => {
    throw new Error(`Reading input parameters failed: ${message}`);
};
/**
 * Loads the input arguments passed to this action.
 * Uses default values if no value is passed and the argument is optional.
 * Throws an error if something unexpected happens or a required argument is missing or invalid.
 */
const parseInput = () => {
    const gcpProjectId = getRequiredStringParam("gcp-project-id");
    const gcpServiceAccountKey = getRequiredStringParam("gcp-service-account-key");
    const gcpCloudStorageBucket = getOptionalStringParam("gcp-cloud-storage-bucket", `${gcpProjectId}_cloudbuild`);
    const gcpGcrRegion = getOptionalStringParam("gcp-gcr-region", "eu.gcr.io");
    const imageName = getRequiredStringParam("image-name");
    const imageSources = getRequiredStringArrayParam("image-sources");
    const imageTagFormat = getOptionalStringParam("image-tag-format", "$BRANCH-$SHA-$YYYY.$MM.$DD-$HH.$mm.$SS");
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
        throwLoadInputError(invalidEnumArgument("gcp-gcr-region", GCR_REGIONS, gcpGcrRegion));
    }
    if (!githubToken && !githubDisabled) {
        throwLoadInputError("You must either set github-disabled to true or set github-token!");
    }
    if (DESCRIPTION_SIZES.indexOf(githubCommitStatusDescription) === -1) {
        throwLoadInputError(invalidEnumArgument("github-commit-status-description", DESCRIPTION_SIZES, githubCommitStatusDescription));
    }
    if (githubCommitStatusTitle.length === 0) {
        throwLoadInputError(invalidStringArgument("github-commit-status-title", "non-empty string", "empty string"));
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
                format: imageTagFormat,
                latest: imageTagLatest,
                branchLatest: imageTagBranchLatest,
                additionalTags: imageTagAdditionalTags
            }
        }
    };
};
exports.parseInput = parseInput;
