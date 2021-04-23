import * as core from "@actions/core";

declare type DescriptionSize = "large" | "medium" | "small" | "tiny";
const DESCRIPTION_SIZES = [
    "large",
    "medium",
    "small",
    "tiny"
];

declare type GcrRegion = "gcr.io" | "eu.gcr.io" | "us.gcr.io" | "asia.gcr.io";
const GCR_REGIONS = [
    "gcr.io",
    "eu.gcr.io",
    "us.gcr.io",
    "asia.gcr.io"
];

export interface InputParams {
    gcp: {
        projectId: string;
        serviceAccountKey: string;
        cloudStorage: {
            bucket: string;
        };
        gcr: {
            host: GcrRegion;
        };
    };
    image: {
        name: string;
        sources: string[];
        tags: {
            format: string;
            latest: boolean;
            branchLatest: boolean;
            additionalTags: string[];
        };
    };
    github: {
        token: string | undefined;
        disabled: boolean;
        commitStatus: {
            disabled: boolean;
            all: boolean;
            description: DescriptionSize;
            title: string;
        };
        releaseInformation: {
            disabled: boolean;
            all: boolean;
        };
    };
}

const getRequiredStringParam = (name: string): string => {
    return core.getInput(name, { required: true });
};

const getOptionalStringParam = (name: string, defaultValue: string): string => {
    return core.getInput(name) || defaultValue;
};

const getOptionalStringArrayParam = (name: string, defaultValue: string[]): string[] => {
    const input = core.getInput(name);
    if (input) {
        return input.split(",");
    }
    return defaultValue;
};

const getRequiredStringArrayParam = (name: string): string[] => {
    const input = core.getInput(name, { required: true });
    return input.split(",");
};

const getOptionalBooleanParam = (name: string, defaultValue: boolean): boolean => {
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

const invalidEnumArgument = (argument: string, expected: string[], actual: string): string => {
    return `Invalid value passed for argument ${argument}. `
        + `Expected one of ${expected.join(", ")}, but got ${actual}.`;
};

const invalidStringArgument = (argument: string, expected: string, actual: string): string => {
    return `Invalid value passed for argument ${argument}. `
        + `Expected ${expected}, but got ${actual}.`;
};

const throwLoadInputError = (message: string) => {
    throw new Error(`Reading input parameters failed: ${message}`);
};

/**
 * Loads the input arguments passed to this action.
 * Uses default values if no value is passed and the argument is optional.
 * Throws an error if something unexpected happens or a required argument is missing or invalid.
 */
export const parseInput = (): InputParams => {
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
        throwLoadInputError(invalidEnumArgument(
            "gcp-gcr-region", GCR_REGIONS, gcpGcrRegion
        ));
    }

    if (!githubToken && !githubDisabled) {
        throwLoadInputError("You must either set github-disabled to true or set github-token!");
    }

    if (DESCRIPTION_SIZES.indexOf(githubCommitStatusDescription) === -1) {
        throwLoadInputError(invalidEnumArgument(
            "github-commit-status-description", DESCRIPTION_SIZES, githubCommitStatusDescription
        ));
    }

    if (githubCommitStatusTitle.length === 0) {
        throwLoadInputError(invalidStringArgument(
            "github-commit-status-title", "non-empty string", "empty string"
        ));
    }

    return {
        gcp: {
            projectId: gcpProjectId,
            serviceAccountKey: gcpServiceAccountKey,
            cloudStorage: {
                bucket: gcpCloudStorageBucket
            },
            gcr: {
                host: gcpGcrRegion as GcrRegion
            }
        },
        github: {
            disabled: githubDisabled,
            token: githubToken,
            commitStatus: {
                disabled: githubCommitStatusDisabled,
                all: githubCommitStatusAll,
                description: githubCommitStatusDescription as DescriptionSize,
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
