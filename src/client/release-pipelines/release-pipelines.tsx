import { Project } from "@shared/model/project";
import { ReleasePipeline, ReleasePipelineName } from "@shared/model/release-pipeline";
import { hashSet, property, structureFor } from "@shared/structure/structure";
import * as React from "react";
import { useProcess } from "../frame/process-container";
import { j } from "../jinaga-config";

export interface ReleasePipelinesComponentProps {
    project: Project;
}

export const ReleasePipelinesComponent = ({project} : ReleasePipelinesComponentProps) => {
    const runProcess = useProcess();

    return (
        <div>
            <h1>Release Pipelines</h1>
            <button onClick={() => runProcess(() => refreshReleasePipelines(project))}>Refresh</button>
        </div>
    )
};

async function refreshReleasePipelines(project: Project) {
    await fetch("api/project/release-pipelines", {
        method: "POST"
    });
    await queryReleasePipelines(project);
}

async function queryReleasePipelines(project: Project) {
    const releasePipelineStructure = structureFor(Project, {
        releasePipelines: hashSet(j.for(ReleasePipeline.inProject), {
            name: property(j.for(ReleasePipelineName.ofReleasePipeline), n => n.value, "")
        })
    });
    await releasePipelineStructure.query(j, project);
}