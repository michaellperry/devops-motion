import { Button } from '@material-ui/core';
import { Project } from "@shared/model/project";
import { ReleasePipeline, ReleasePipelineName } from "@shared/model/release-pipeline";
import { hashSet, property, structureFor } from "@shared/structure/structure";
import * as React from "react";
import { useProcess } from "../frame/process-container";
import { j } from "../jinaga-config";

/*
<ul class="mdc-list mdc-list--two-line">
    <li class="mdc-list-item mdc-ripple-upgraded">
        <span class="mdc-list-item__text">
            <span class="mdc-list-item__primary-text">Line item</span>
            <span class="mdc-list-item__secondary-text">Secondary text</span>
        </span>
    </li>
    <li class="mdc-list-item mdc-ripple-upgraded">
        <span class="mdc-list-item__text">
            <span class="mdc-list-item__primary-text">Line item</span>
            <span class="mdc-list-item__secondary-text">Secondary text</span>
        </span>
    </li>
    <li class="mdc-list-item mdc-ripple-upgraded">
        <span class="mdc-list-item__text">
            <span class="mdc-list-item__primary-text">Line item</span>
            <span class="mdc-list-item__secondary-text">Secondary text</span>
        </span>
    </li>
</ul>
*/

export interface ReleasePipelinesComponentProps {
    project: Project;
}

export const ReleasePipelinesComponent = ({project} : ReleasePipelinesComponentProps) => {
    const runProcess = useProcess();

    return (
        <div>
            <h1>Release Pipelines</h1>
            <Button
                color="primary"
                variant="contained"
                onClick={() => runProcess(() => refreshReleasePipelines(project))}>
                    Refresh
            </Button>
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