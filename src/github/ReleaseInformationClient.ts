import * as core from "@actions/core";
import { context, getOctokit } from "@actions/github";
import { GitHub } from "@actions/github/lib/utils";
import { RestEndpointMethodTypes } from "@octokit/rest";
import { ImageNameHelper } from "../util/ImageNameHelper";
import { TagInformation } from "../util/TagHelper";
import { Await } from "../util/util";

const RELEASE_MESSAGE = "The following Docker Images have been built for this release:";
const RELEASE_BODY_PREFIX = `\n\n---\n\n*${RELEASE_MESSAGE}*\n`;
const RELEASE_BODY_ENTRY = "\n:package: **[$_NAME_$]($_URL_$)**";

declare type GitHubRelease = Await<RestEndpointMethodTypes["repos"]["getReleaseByTag"]["response"]["data"]>;


export class ReleaseInformationClient {
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
     * Appends the list of built images to a existing GitHub release.
     *
     * @param releaseTag The tag of the release
     * @param includeAllTags Whether to include all tags or only the primary one
     * @param tagInformation The tag information holding the tags
     * @param imageNameHelper The helper used to build the image names and URLs
     */
    public async addImageListToReleaseInformation(
        releaseTag: string,
        includeAllTags: boolean,
        tagInformation: TagInformation,
        imageNameHelper: ImageNameHelper
    ): Promise<void> {
        const release = await this.getReleaseForTag(releaseTag);
        const oldBody = release.body || "";
        core.debug(`Loaded existing release with body: ${oldBody}`);

        const tagsToUse = includeAllTags ? tagInformation.allTags : [tagInformation.primary];
        const imageList = tagsToUse.map(tag => this.createImageEntry(tag, imageNameHelper));

        const hasReleaseInformation = this.hasReleaseInformation(oldBody);
        const releaseBody = hasReleaseInformation ? "" : RELEASE_BODY_PREFIX;

        const newBody = oldBody + releaseBody + imageList.join(" \\");
        core.debug(`Setting new release body: ${newBody}`);

        await this.updateReleaseBody(release, newBody);
    }

    /**
     * Loads the release for the specified tag.
     *
     * @param tag The tag to load
     * @private
     */
    private async getReleaseForTag(tag: string): Promise<GitHubRelease> {
        const response = await this.client.rest.repos.getReleaseByTag({
            ...context,
            ...context.repo,
            tag
        });
        return response.data;
    }

    /**
     * Updates an existing release with the new body.
     *
     * @param release The release to update
     * @param body The body to use
     * @private
     */
    private async updateReleaseBody(release: GitHubRelease, body: string): Promise<void> {
        await this.client.rest.repos.updateRelease({
            ...context,
            ...context.repo,
            release_id: release.id,
            tag_name: release.tag_name,
            target_commitish: release.target_commitish,
            name: release.name as string,
            body: body,
            draft: release.draft,
            prerelease: release.draft
        });
    }

    /**
     * Creates a new image list entry.
     *
     * @param tag The tag of the built image
     * @param imageNameHelper The image name helper
     * @private
     */
    private createImageEntry(tag: string, imageNameHelper: ImageNameHelper): string {
        return RELEASE_BODY_ENTRY
            .replace("$_URL_$", imageNameHelper.getImageUrlForTag(tag))
            .replace("$_NAME_$", imageNameHelper.getImageNameForTag(tag, "large"));
    }

    /**
     * Checks whether the passed body already contains an image list.
     *
     * @param body The body of the release to check
     * @private
     */
    private hasReleaseInformation(body: string): boolean {
        return body.indexOf(RELEASE_MESSAGE) !== -1;
    }
}
