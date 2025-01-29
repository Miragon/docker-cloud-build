"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImageNameHelper = void 0;
class ImageNameHelper {
    /**
     * Creates a new instance.
     *
     * @param host The host of the image registry
     * @param projectId The project containing the image
     * @param imageName The name of the image
     */
    constructor(host, projectId, imageName) {
        this.host = host;
        this.projectId = projectId;
        this.imageName = imageName;
        // Do nothing
    }
    /**
     * Returns the full image name without a tag.
     */
    getImageName() {
        return `${this.host}/${this.projectId}/${this.imageName}`;
    }
}
exports.ImageNameHelper = ImageNameHelper;
