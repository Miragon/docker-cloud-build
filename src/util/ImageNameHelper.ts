export type ImageNameLength = "large" | "medium" | "small" | "tiny";

export class ImageNameHelper {
    /**
     * Creates a new instance.
     *
     * @param host The host of the image registry
     * @param projectId The project containing the image
     * @param imageName The name of the image
     */
    constructor(private host: string, private projectId: string, private imageName: string) {
        // Do nothing
    }

    /**
     * Returns the full image name without a tag.
     */
    public getImageName(): string {
        return `${this.host}/${this.projectId}/${this.imageName}`;
    }

    /**
     * Returns the full image name with the passed tag.
     *
     * @param tag The tag to append
     * @param length The length of the name to return
     */
    public getImageNameForTag(tag: string, length: ImageNameLength): string {
        switch (length) {
            case "large":
                return `${this.host}/${this.projectId}/${this.imageName}:${tag}`;
            case "medium":
                return `${this.projectId}/${this.imageName}:${tag}`;
            case "small":
                return `${this.imageName}:${tag}`;
            case "tiny":
                return tag;
            default:
                return tag;
        }
    }

    /**
     * Returns the URL of the image for the tag passed.
     *
     * @param tag The tag to append
     */
    public getImageUrlForTag(tag: string): string {
        return `https://${this.getImageNameForTag(tag, "large")}`.toLowerCase();
    }

    /**
     * Maps the passed tags to image names of the specified length.
     *
     * @param tags The tags to map
     * @param length The length to use
     */
    public getImageTags(tags: string[], length: ImageNameLength): string[] {
        return tags.map(tag => this.getImageNameForTag(tag, length));
    }
}
