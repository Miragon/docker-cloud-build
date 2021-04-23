import { ContextHelper } from "../github/ContextHelper";

export interface TagInformation {
    allTags: string[];
    primary: string;
}

export class TagHelper {
    /**
     * Creates a new instance.
     *
     * @param contextHelper The context helper to use
     */
    constructor(private contextHelper: ContextHelper) {
        // Do nothing
    }

    /**
     * Generates a list of tags to use for the image.
     *
     * @param tagFormat The format of the primary branch tag
     * @param includeLatest Whether to include the 'latest' tag
     * @param includeBranchLatest Whether to include the '$branch-latest' tag
     * @param additionalTags Additional tags to include
     */
    public getTags(
        tagFormat: string,
        includeLatest: boolean,
        includeBranchLatest: boolean,
        additionalTags: string[]
    ): TagInformation {
        const tags: string[] = [];
        const normalizedRefName = this.contextHelper.getNormalizedRefName();

        switch (this.contextHelper.getActionType()) {
            case "commit":
                tags.push(this.createBranchTag(tagFormat));
                includeBranchLatest && tags.push(`${normalizedRefName}-latest`);
                break;
            // Fall-Through
            case "tag":
            case "other":
            default:
                tags.push(normalizedRefName);
                break;
        }

        includeLatest && tags.push("latest");
        tags.push(...additionalTags);

        return {
            allTags: tags,
            primary: tags[0]
        };
    }

    /**
     * Creates the primary branch tag.
     *
     * @param tagFormat The format to use
     * @private
     */
    private createBranchTag(tagFormat: string): string {
        const githubSha = process.env.GITHUB_SHA!;
        const now = new Date();

        /* eslint-disable newline-per-chained-call */
        return tagFormat
            .split("$BRANCH").join(this.contextHelper.getNormalizedRefName())
            .split("$SHA").join(githubSha.substr(0, 7))
            .split("$YYYY").join(now.getFullYear().toString())
            .split("$MM").join((now.getMonth() + 1).toString().padStart(2, "0"))
            .split("$DD").join(now.getDate().toString().padStart(2, "0"))
            .split("$HH").join(now.getHours().toString().padStart(2, "0"))
            .split("$mm").join(now.getMinutes().toString().padStart(2, "0"))
            .split("$SS").join(now.getSeconds().toString().padStart(2, "0"));
        /* eslint-enable newline-per-chained-call */
    }
}
