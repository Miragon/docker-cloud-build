import * as core from "@actions/core";

export interface InputParams {
    gcp: {
        projectId: string;
        serviceAccountKey: string;
        cloudStorage: {
            bucket: string;
        };
        registry: {
            useGcr: boolean;
            host: string | undefined;
            repository: string;
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

/**
 * Loads the input arguments passed to this action.
 * Uses default values if no value is passed and the argument is optional.
 * Throws an error if something unexpected happens or a required argument is missing or invalid.
 */
export const parseInput = (): InputParams => {
    const gcpProjectId = getRequiredStringParam("gcp-project-id");
    const gcpServiceAccountKey = getRequiredStringParam("gcp-service-account-key");
    const gcpCloudStorageBucket = getOptionalStringParam("gcp-cloud-storage-bucket", `${gcpProjectId}_cloudbuild`);
    const gcpRegistryUseGcr = getOptionalBooleanParam("gcp-registry-use-gcr", false);
    const gcpRegistryHost = getOptionalStringParam("gcp-registry-host", "europe-docker.pkg.dev");
    const gcpRegistryRepository = gcpRegistryUseGcr ? getOptionalStringParam("gcp-registry-repository", gcpProjectId) : getRequiredStringParam("gcp-registry-repository");

    const imageName = getRequiredStringParam("image-name");
    const imageSources = getRequiredStringArrayParam("image-sources");
    const imageTagFormat = getOptionalStringParam("image-tag-format", "$BRANCH-$SHA-$YYYY.$MM.$DD-$HH.$mm.$SS");
    const imageTagLatest = getOptionalBooleanParam("image-tag-latest", false);
    const imageTagBranchLatest = getOptionalBooleanParam("image-tag-branch-latest", false);
    const imageTagAdditionalTags = getOptionalStringArrayParam("image-tag-additional-tags", []);

    return {
        gcp: {
            projectId: gcpProjectId,
            serviceAccountKey: gcpServiceAccountKey,
            cloudStorage: {
                bucket: gcpCloudStorageBucket
            },
            registry: {
                useGcr: gcpRegistryUseGcr,
                host: gcpRegistryHost,
                repository: gcpRegistryRepository
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
