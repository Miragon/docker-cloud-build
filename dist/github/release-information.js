"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasReleaseInformation = exports.createReleaseBodyEntry = exports.createReleaseBodyPrefix = void 0;
const RELEASE_BODY_PREFIX = "\n\n---\n\n*The following Docker Images have been built for this release:*\n";
const RELEASE_BODY_ENTRY = "\n:package: **[$_NAME_$]($_URL_$)**";
const createReleaseBodyPrefix = () => {
    return RELEASE_BODY_PREFIX;
};
exports.createReleaseBodyPrefix = createReleaseBodyPrefix;
const createReleaseBodyEntry = (url, name) => {
    return RELEASE_BODY_ENTRY.replace("$_URL_$", url).replace("$_NAME_$", name);
};
exports.createReleaseBodyEntry = createReleaseBodyEntry;
const hasReleaseInformation = (body) => {
    return body.indexOf(RELEASE_BODY_PREFIX) !== -1;
};
exports.hasReleaseInformation = hasReleaseInformation;
