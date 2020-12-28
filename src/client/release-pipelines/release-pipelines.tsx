import { Project } from "@shared/model/project";
import { ReleasePipeline, ReleasePipelineName } from "@shared/model/release-pipeline";
import { hashSet, property, structureFor } from "@shared/structure/structure";
import * as React from "react";
import { useErrorState } from "../frame/error-container";
import { j } from "../jinaga-config";

export interface ReleasePipelinesComponentProps {
    project: Project;
}

export const ReleasePipelinesComponent = ({project} : ReleasePipelinesComponentProps) => {
    const [ setError ] = useErrorState();

    return (
        <div>
            <h1>Release Pipelines</h1>
            <button onClick={() => refreshReleasePipelines(project, setError)}>Refresh</button>
        </div>
    )
};

function refreshReleasePipelines(project: Project, setError: (message: string) => void) {
    fetch("api/project/release-pipelines", {
        method: "POST"
    }).then(() =>
        queryReleasePipelines(project)
    ).catch(err => {
        setError(err.message);
    });
}

async function queryReleasePipelines(project: Project) {
    const releasePipelineStructure = structureFor(Project, {
        releasePipelines: hashSet(j.for(ReleasePipeline.inProject), {
            name: property(j.for(ReleasePipelineName.ofReleasePipeline), n => n.value, "")
        })
    });
    await releasePipelineStructure.query(j, project);
}