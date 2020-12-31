import { ensure, Jinaga as j } from "jinaga";
import { Build } from "./build";
import { ReleasePipeline } from "./release-pipeline";

export class Release {
    static Type = "DevOpsMotion.Release";
    type = Release.Type;

    constructor(
        public releasePipeline: ReleasePipeline,
        public build: Build,
        public name: string,
        public createdOn: string
    ) { }

    static inPipeline(releasePipeline: ReleasePipeline) {
        return j.match(<Release>{
            type: Release.Type,
            releasePipeline
        });
    }

    static build(release: Release) {
        ensure(release).has("build");
        return j.match(release.build);
    }
}