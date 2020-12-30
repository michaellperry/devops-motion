import { Jinaga as j } from "jinaga";
import { ReleasePipeline } from "./release-pipeline";

export class Release {
    static Type = "DevOpsMotion.Release";
    type = Release.Type;

    constructor(
        public releasePipeline: ReleasePipeline,
        public name: string,
        public createdOn: string
    ) { }

    static inPipeline(releasePipeline: ReleasePipeline) {
        return j.match(<Release>{
            type: Release.Type,
            releasePipeline
        });
    }
}