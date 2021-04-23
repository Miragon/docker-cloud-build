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
const core = __importStar(require("@actions/core"));
const fs_extra_1 = require("fs-extra");
const uuid_1 = require("uuid");
const InputParser_1 = require("./api/InputParser");
const CloudAuthenticationHelper_1 = require("./gcp/CloudAuthenticationHelper");
const CloudBuildClient_1 = require("./gcp/CloudBuildClient");
const CloudStorageClient_1 = require("./gcp/CloudStorageClient");
const CommitStatusClient_1 = require("./github/CommitStatusClient");
const ContextHelper_1 = require("./github/ContextHelper");
const ReleaseInformationClient_1 = require("./github/ReleaseInformationClient");
const ArchiveClient_1 = require("./util/ArchiveClient");
const ImageNameHelper_1 = require("./util/ImageNameHelper");
const LogHelper_1 = require("./util/LogHelper");
const TagHelper_1 = require("./util/TagHelper");
async function run() {
    core.startGroup("Step 1: Prepare Cloud Build");
    // 1. Load input parameters and context
    const input = InputParser_1.parseInput();
    const contextHelper = new ContextHelper_1.ContextHelper();
    const actionType = contextHelper.getActionType();
    // 2. Initialize GCP clients
    const authenticationHelper = new CloudAuthenticationHelper_1.CloudAuthenticationHelper(input.gcp.serviceAccountKey);
    const buildClient = new CloudBuildClient_1.CloudBuildClient(authenticationHelper);
    const storageClient = new CloudStorageClient_1.CloudStorageClient(authenticationHelper);
    // 3. Create Cloud Build input file
    const rootFolder = "cloud-build-input";
    const buildFileName = `build-${uuid_1.v4()}.tgz`;
    const workspace = `${process.env.GITHUB_WORKSPACE}/`;
    core.debug("Creating input file build.tgz");
    core.debug(`Build input base path: ${workspace}`);
    try {
        const archiveClient = new ArchiveClient_1.ArchiveClient(workspace);
        await archiveClient.archive(input.image.sources, "build.tgz", rootFolder);
    }
    catch (e) {
        core.endGroup();
        throw new Error(`Could not create build input file: ${e.message}`);
    }
    // 4. Upload Cloud Build input file
    core.debug(`Uploading input file to ${input.gcp.cloudStorage.bucket}/${buildFileName}`);
    try {
        await storageClient.upload(input.gcp.cloudStorage.bucket, "build.tgz", buildFileName);
        await fs_extra_1.unlink("build.tgz");
    }
    catch (e) {
        core.endGroup();
        throw new Error(`Could not upload build input file: ${e.message}`);
    }
    // 5. Initialize image name and tags
    const imageNameHelper = new ImageNameHelper_1.ImageNameHelper(input.gcp.gcr.host, input.gcp.projectId, input.image.name);
    const imageName = imageNameHelper.getImageName();
    const tagHelper = new TagHelper_1.TagHelper(contextHelper);
    const tagInformation = tagHelper.getTags(input.image.tags.format, input.image.tags.latest, input.image.tags.branchLatest, input.image.tags.additionalTags);
    core.endGroup();
    // 6. Run Cloud Build
    core.startGroup("Step 2: Execute Cloud Build");
    core.info(`Starting cloud build of image ${imageName} with the following tags:`);
    tagInformation.allTags.forEach(tag => core.info(`- ${tag}`));
    const buildResult = await buildClient.buildDockerImage({
        source: {
            bucket: input.gcp.cloudStorage.bucket,
            path: buildFileName
        },
        build: {
            image: imageName,
            rootFolder: rootFolder,
            tags: tagInformation.allTags
        },
        projectId: input.gcp.projectId
    });
    // 7. Remove no longer required files
    authenticationHelper.clean();
    try {
        core.debug("Removing uploaded input file");
        await storageClient.delete(input.gcp.cloudStorage.bucket, buildFileName);
    }
    catch (e) {
        core.endGroup();
        throw new Error(`Removing uploaded input file failed: ${e.message}
            Please remove the file ${input.gcp.cloudStorage.bucket}/${buildFileName} manually.`);
    }
    // 8. Print build results
    if (buildResult.error) {
        throw new Error("Cloud Build failed.\n"
            + `${"Message: ".padEnd(14, " ")}${buildResult.error.message}\n`
            + `${"Code: ".padEnd(14, " ")}${buildResult.error.code}\n`
            + `${"Build Logs: ".padEnd(14, " ")}${buildResult.logsUrl}`);
    }
    core.info("Build was successful!");
    core.info(`Build logs are available here: ${buildResult.logsUrl}`);
    core.endGroup();
    // 9. Set GitHub commit status
    if (!input.github.disabled) {
        core.startGroup("Step 3: Updating GitHub");
    }
    else {
        core.startGroup("Step 3: Updating GitHub (SKIPPED)");
    }
    if (!input.github.disabled && !input.github.commitStatus.disabled && actionType === "commit") {
        try {
            core.info("Setting commit status...");
            // Would have thrown in parseInput if token was not set
            const commitStatusClient = new CommitStatusClient_1.CommitStatusClient(input.github.token);
            commitStatusClient.updateCommitStatus(tagInformation, input.github.commitStatus.title, input.github.commitStatus.description, input.github.commitStatus.all, imageNameHelper);
        }
        catch (e) {
            core.error("Failed to set commit status. Build was still successful though.");
            core.error(e);
        }
    }
    else if (actionType !== "commit") {
        core.info("Not setting commit status since build was not caused by a commit.");
    }
    else {
        core.info("Not setting commit status because it is disabled.");
    }
    // 10. Update release information
    if (!input.github.disabled
        && !input.github.releaseInformation.disabled
        && process.env.GITHUB_EVENT_NAME === "release") {
        core.info("Updating release information...");
        try {
            // Would have thrown in parseInput if token was not set
            const releaseInformationClient = new ReleaseInformationClient_1.ReleaseInformationClient(input.github.token);
            await releaseInformationClient.addImageListToReleaseInformation(contextHelper.getRefName(), input.github.releaseInformation.all, tagInformation, imageNameHelper);
        }
        catch (e) {
            core.error("Failed to update release information. Build was still successful though.");
            core.error(e);
        }
    }
    else if (process.env.GITHUB_EVENT_NAME !== "release") {
        core.info("Not updating release information because this build was not caused by a release.");
    }
    else {
        core.info("Not updating release information because it was disabled.");
    }
    core.endGroup();
    // 11. Print image summary and set outputs
    LogHelper_1.printImageSummary(buildResult);
    core.setOutput("full-image-name", imageName);
    core.setOutput("image-tags", tagInformation.allTags.join(","));
}
const asyncRun = async () => {
    try {
        await run();
    }
    catch (e) {
        core.setFailed(e);
    }
};
asyncRun();
