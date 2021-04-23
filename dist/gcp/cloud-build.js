"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.printBuildStatus = void 0;
const protos_1 = require("@google-cloud/cloudbuild/build/protos/protos");
var Status = protos_1.google.devtools.cloudbuild.v1.Build.Status;
// eslint-disable-next-line import/prefer-default-export
const printBuildStatus = (status) => {
    switch (status) {
        default:
        case Status.STATUS_UNKNOWN: {
            return "Build is currently in an unknown status...";
        }
        case Status.QUEUED: {
            return "Build is currently queued...";
        }
        case Status.WORKING: {
            return "Build is currently working...";
        }
        case Status.SUCCESS: {
            return "Build was successful!";
        }
        case Status.FAILURE: {
            return "Build has failed!";
        }
        case Status.INTERNAL_ERROR: {
            return "Build status returned an internal error!";
        }
        case Status.TIMEOUT: {
            return "Build has timed out!";
        }
        case Status.CANCELLED: {
            return "Build was cancelled!";
        }
        case Status.EXPIRED: {
            return "Build has expired!";
        }
    }
};
exports.printBuildStatus = printBuildStatus;
