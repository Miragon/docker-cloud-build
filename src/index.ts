import * as core from "@actions/core";
import { unlink } from "fs-extra";
import { v4 } from "uuid";
import { parseInput } from "./api/InputParser";
import { CloudAuthenticationHelper } from "./gcp/CloudAuthenticationHelper";
import { CloudBuildClient } from "./gcp/CloudBuildClient";
import { CloudStorageClient } from "./gcp/CloudStorageClient";
import { ContextHelper } from "./github/ContextHelper";
import { ArchiveClient } from "./util/ArchiveClient";
import { printImageSummary } from "./util/LogHelper";
import { TagHelper } from "./util/TagHelper";

async function run(): Promise<void> {
    core.startGroup("Step 1: Prepare Cloud Build");

    // 1. Load input parameters and context

    const input = parseInput();
    const contextHelper = new ContextHelper();

    // 2. Initialize GCP clients

    const authenticationHelper = new CloudAuthenticationHelper(input.gcp.serviceAccountKey);
    const buildClient = new CloudBuildClient(authenticationHelper);
    const storageClient = new CloudStorageClient(authenticationHelper);

    // 3. Create Cloud Build input file

    const rootFolder = "cloud-build-input";
    const buildFileName = `build-${v4()}.tgz`;
    const workspace = `${process.env.GITHUB_WORKSPACE!}/`;

    core.debug("Creating input file build.tgz");
    core.debug(`Build input base path: ${workspace}`);

    try {
        const archiveClient = new ArchiveClient(workspace);
        await archiveClient.archive(input.image.sources, "build.tgz", rootFolder);
    } catch (e) {
        let errorMessage = "System error!";
        if (e instanceof Error) {
            errorMessage = e.message;
        }
        core.endGroup();
        throw new Error(`Could not create build input file: ${errorMessage}`);
    }

    // 4. Upload Cloud Build input file

    core.debug(`Uploading input file to ${input.gcp.cloudStorage.bucket}/${buildFileName}`);
    try {
        await storageClient.upload(input.gcp.cloudStorage.bucket, "build.tgz", buildFileName);
        await unlink("build.tgz");
    } catch (e) {
        let errorMessage = "System error!";
        if (e instanceof Error) {
            errorMessage = e.message;
        }
        core.endGroup();
        throw new Error(`Could not upload build input file: ${errorMessage}`);
    }

    // 5. Initialize image name and tags

    const imageName = `${input.gcp.registry.host}/${input.gcp.registry.repository}/${input.image.name}`;

    const tagHelper = new TagHelper(contextHelper);
    const tagInformation = tagHelper.getTags(
        input.image.tags.format,
        input.image.tags.latest,
        input.image.tags.branchLatest,
        input.image.tags.additionalTags
    );

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
    } catch (e) {
        let errorMessage = "System error!";
        if (e instanceof Error) {
            errorMessage = e.message;
        }
        core.endGroup();
        throw new Error(`Removing uploaded input file failed: ${errorMessage}
            Please remove the file ${input.gcp.cloudStorage.bucket}/${buildFileName} manually.`);
    }

    // 8. Print build results

    if (buildResult.error) {
        throw new Error("Cloud Build failed.\n"
            + `Message:      ${buildResult.error.message}\n`
            + `Code:         ${buildResult.error.code}\n`
            + `Build Logs:   ${buildResult.logsUrl}`);
    }

    core.info("Build was successful!");
    core.info(`Build logs are available here: ${buildResult.logsUrl}`);

    core.endGroup();

    // 9. Print image summary and set outputs

    printImageSummary(buildResult);
    core.setOutput("full-image-name", imageName);
    core.setOutput("image-tags", tagInformation.allTags.join(","));
}

const asyncRun = async (): Promise<void> => {
    try {
        await run();
    } catch (e) {
        let errorMessage = "System error!";
        if (e instanceof Error) {
            errorMessage = e.message;
        }
        core.error(errorMessage);
        core.setFailed(errorMessage);
    }
};

asyncRun()
    .catch(e => {
        core.error("An unexpected error occurred.");
        core.error(e);
        core.setFailed("An unexpected error occurred.");
    });
