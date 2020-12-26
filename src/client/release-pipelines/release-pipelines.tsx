import * as React from "react";

export interface ReleasePipelinesComponentProps {
    organization: string;
    project: string;
}

export const ReleasePipelinesComponent = ({organization, project} : ReleasePipelinesComponentProps) => (
    <div>
        <h1>Release Pipelines</h1>
        <button onClick={() => refreshReleasePipelines()}>Refresh</button>
        <p>{organization}</p>
        <p>{project}</p>
    </div>
);

function refreshReleasePipelines() {
    fetch("api/project/release-pipelines", {
        method: "POST"
    });
}