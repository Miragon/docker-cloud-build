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
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseInput = void 0;
const core = __importStar(require("@actions/core"));
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
/**
 * Loads the input arguments passed to this action.
 * Uses default values if no value is passed and the argument is optional.
 * Throws an error if something unexpected happens or a required argument is missing or invalid.
 */
const parseInput = () => {
    const gcpProjectId = getRequiredStringParam("gcp-project-id");
    const gcpServiceAccountKey = getRequiredStringParam("gcp-service-account-key");
    const gcpCloudStorageBucket = getOptionalStringParam("gcp-cloud-storage-bucket", `${gcpProjectId}_cloudbuild`);
    const gcpRegistryUseGcr = getOptionalBooleanParam("gcp-registry-use-gcr", false);
    const gcpRegistryHost = gcpRegistryUseGcr ? undefined : getOptionalStringParam("gcp-registry-host", "europe.pkg.dev");
    const gcpRegistryRepository = gcpRegistryUseGcr ? undefined : getRequiredStringParam("gcp-registry-repository");
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
exports.parseInput = parseInput;
