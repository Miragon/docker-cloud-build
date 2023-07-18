import * as core from "@actions/core";
import { create as createGlob } from "@actions/glob";
import { copy, emptyDir, remove } from "fs-extra";
import path from "path";
import { create as createTar } from "tar";

export class ArchiveClient {
    private workspace: string;

    /**
     * Creates a new instance.
     *
     * @param basePath The base path in which the client should work. No files outside of this path
     *                 will be included in the archive and everything will be relative to it.
     */
    constructor(basePath: string) {
        this.workspace = basePath.startsWith("/") ? basePath : `${basePath}/`;
    }

    /**
     * Creates a new archive from a list of file patterns.
     *
     * @param patterns The list of file patterns to add to the archive. Can contain glob wildcards
     *                 like * or **. Can match files and folders.
     * @param fileName The name of the new archive file
     * @param rootFolder The root folder within the archive
     */
    public async archive(
        patterns: string[],
        fileName: string,
        rootFolder: string
    ): Promise<void> {
        try {
            const sources: string[] = [];

            for (const source of patterns) {
                core.debug(`Got the following pattern with workspace ${this.workspace}: ${source}`);
                const globber = await createGlob(source, {
                    followSymbolicLinks: false,
                    implicitDescendants: false
                });
                const patternMatches = (await globber.glob())
                    .filter(entry => entry.startsWith(this.workspace))
                    .map(entry => entry.substr(this.workspace.length));
                core.debug(`Found the following matching files: \n${patternMatches.join("\n")}`);
                sources.push(...patternMatches);
            }

            core.debug("Copying all files and folders to a common directory...");

            await emptyDir(rootFolder);
            for (const source of sources) {
                const basename = path.basename(source);
                const target = path.join(rootFolder, basename);
                core.debug(`Copying ${source} to ${target}`);
                await copy(source, target);
            }

            await createTar(
                {
                    file: fileName,
                    gzip: true
                },
                [rootFolder]
            );

            await remove(rootFolder);
        } catch (e) {
            let errorMessage = "System error!";
            if (e instanceof Error) {
                errorMessage = e.message;
            }
            throw new Error(`Creating archive ${fileName} failed: ${errorMessage}`);
        }
    }
}
