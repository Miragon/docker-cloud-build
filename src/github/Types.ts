import { GitHub } from "@actions/github/lib/utils";
import { Await } from "../util/util";

export declare type Octokit = InstanceType<typeof GitHub>;
export declare type GitHubRelease = Await<ReturnType<Octokit["repos"]["getReleaseByTag"]>>["data"];
