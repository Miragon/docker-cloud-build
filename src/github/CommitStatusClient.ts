import * as core from "@actions/core";
import { context, getOctokit } from "@actions/github";
import { GitHub } from "@actions/github/lib/utils";
import { ImageNameHelper, ImageNameLength } from "../util/ImageNameHelper";
import { TagInformation } from "../util/TagHelper";

export interface CommitStatusOptions {
    title: string;
    description: string;
    url: string;
}

export class CommitStatusClient {
    private client: InstanceType<typeof GitHub>;

    /**
     * Creates a new instance.
     *
     * @param githubToken The GitHub token to use for authentication
     */
    constructor(githubToken: string) {
        this.client = getOctokit(githubToken);
    }

    /**
     * Updates the commit information of the commit that caused this build.
     *
     * @param tagInformation The tag information to use
     * @param statusTitle The title of each status entry to use
     * @param imageNameLength The length of the image to use
     * @param useAllTags Whether to use all tags or only the primary one
     * @param imageNameHelper The image name helper to use
     */
    public async updateCommitStatus(
        tagInformation: TagInformation,
        statusTitle: string,
        imageNameLength: ImageNameLength,
        useAllTags: boolean,
        imageNameHelper: ImageNameHelper
    ): Promise<void> {
        const tags: string[] = [];

        if (useAllTags) {
            tags.push(...tagInformation.allTags);
        } else {
            tags.push(tagInformation.primary);
        }

        const promises: Promise<void>[] = [];
        tags.forEach((tag, index) => {
            const description = imageNameHelper.getImageNameForTag(tag, imageNameLength);
            const url = imageNameHelper.getImageUrlForTag(tag);

            promises.push(this.setCommitStatus({
                title: tags.length > 1 ? `${statusTitle} ${index + 1}` : statusTitle,
                description: description,
                url: url
            }));
        });
        await Promise.all(promises);
    }

    /**
     * Creates a commit status with the passed options.
     *
     * @param options The options to use
     * @private
     */
    private async setCommitStatus(options: CommitStatusOptions): Promise<void> {
        const request = {
            ...context,
            ...context.repo,
            state: "success" as const,
            context: options.title,
            description: options.description,
            target_url: options.url
        };
        core.debug(`Putting commit status with the following options: ${JSON.stringify(request)}`);
        await this.client.rest.repos.createCommitStatus(request);
    }
}
