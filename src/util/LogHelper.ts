import * as core from "@actions/core";
import { CloudBuildResult } from "../gcp/CloudBuildClient";

/**
 * Prints the built images as a summary of tags and digests.
 *
 * @param buildResult The Cloud Build result to print
 */
export const printImageSummary = (buildResult: CloudBuildResult): void => {
    core.info("Build was successful!");
    core.info(`Build logs are available here: ${buildResult.logsUrl}`);

    if (buildResult.result?.images.length === 0) {
        core.info("No images built.");
    } else {
        core.info("Built the following images:\n");

        const nameToDigest: [string | undefined | null, string | undefined][] = [];
        let longestName = 0;

        buildResult.result?.images.forEach(image => {
            const digest = image.digest?.substring(0, 15);
            const name = image.name;
            if (name && name.length > longestName) {
                longestName = name.length;
            }

            nameToDigest.push([name, digest]);
        });

        const nameLength = longestName + 4;
        core.info("IMAGE".padEnd(nameLength, " ") + "DIGEST".padEnd(15, " "));
        core.info("=".repeat(nameLength + 15));
        for (const [name, digest] of nameToDigest) {
            core.info((name || "").padEnd(nameLength, " ") + (digest || "").padEnd(15, " "));
        }
    }
};
