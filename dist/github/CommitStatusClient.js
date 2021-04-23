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
exports.CommitStatusClient = void 0;
const core = __importStar(require("@actions/core"));
const github_1 = require("@actions/github");
class CommitStatusClient {
    /**
     * Creates a new instance.
     *
     * @param githubToken The GitHub token to use for authentication
     */
    constructor(githubToken) {
        this.client = github_1.getOctokit(githubToken);
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
    async updateCommitStatus(tagInformation, statusTitle, imageNameLength, useAllTags, imageNameHelper) {
        const tags = [];
        if (useAllTags) {
            tags.push(...tagInformation.allTags);
        }
        else {
            tags.push(tagInformation.primary);
        }
        const promises = [];
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
    async setCommitStatus(options) {
        const request = {
            ...github_1.context,
            ...github_1.context.repo,
            state: "success",
            context: options.title,
            description: options.description,
            target_url: options.url
        };
        core.debug(`Putting commit status with the following options: ${JSON.stringify(request)}`);
        await this.client.repos.createCommitStatus(request);
    }
}
exports.CommitStatusClient = CommitStatusClient;
