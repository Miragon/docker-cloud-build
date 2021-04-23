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
exports.ReleaseInformationClient = void 0;
const core = __importStar(require("@actions/core"));
const github_1 = require("@actions/github");
const RELEASE_MESSAGE = "The following Docker Images have been built for this release:";
const RELEASE_BODY_PREFIX = `\n\n---\n\n*${RELEASE_MESSAGE}*\n`;
const RELEASE_BODY_ENTRY = "\n:package: **[$_NAME_$]($_URL_$)**";
class ReleaseInformationClient {
    /**
     * Creates a new instance.
     *
     * @param githubToken The GitHub token to use for authentication
     */
    constructor(githubToken) {
        this.client = github_1.getOctokit(githubToken);
    }
    /**
     * Appends the list of built images to a existing GitHub release.
     *
     * @param releaseTag The tag of the release
     * @param includeAllTags Whether to include all tags or only the primary one
     * @param tagInformation The tag information holding the tags
     * @param imageNameHelper The helper used to build the image names and URLs
     */
    async addImageListToReleaseInformation(releaseTag, includeAllTags, tagInformation, imageNameHelper) {
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
    async getReleaseForTag(tag) {
        const response = await this.client.repos.getReleaseByTag({
            ...github_1.context,
            ...github_1.context.repo,
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
    async updateReleaseBody(release, body) {
        await this.client.repos.updateRelease({
            ...github_1.context,
            ...github_1.context.repo,
            release_id: release.id,
            tag_name: release.tag_name,
            target_commitish: release.target_commitish,
            name: release.name,
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
    createImageEntry(tag, imageNameHelper) {
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
    hasReleaseInformation(body) {
        return body.indexOf(RELEASE_MESSAGE) !== -1;
    }
}
exports.ReleaseInformationClient = ReleaseInformationClient;
