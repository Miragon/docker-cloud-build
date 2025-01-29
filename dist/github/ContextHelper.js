import * as core from "@actions/core";
import { normalize } from "../util/util";
export class ContextHelper {
    actionType;
    normalizedRefName;
    refName;
    /**
     * Creates a new instance.
     */
    constructor() {
        const githubRef = process.env.GITHUB_REF;
        if (githubRef.startsWith("refs/heads/")) {
            this.refName = githubRef.substring(11);
            this.actionType = "commit";
        }
        else if (githubRef.startsWith("refs/tags/")) {
            this.refName = githubRef.substring(10);
            this.actionType = "tag";
        }
        else {
            core.warning(`WARNING: Unrecognized GITHUB_REF found: ${githubRef}.`);
            this.refName = githubRef;
            this.actionType = "other";
        }
        this.normalizedRefName = normalize(this.refName);
    }
    /**
     * Returns the action type that caused this action to run.
     */
    getActionType() {
        return this.actionType;
    }
    /**
     * Returns the normalized ref name (tag or branch name usually).
     */
    getNormalizedRefName() {
        return this.normalizedRefName;
    }
}
