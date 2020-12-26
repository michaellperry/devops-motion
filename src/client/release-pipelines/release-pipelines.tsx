import * as React from "react";

export interface ReleasePipelinesComponentProps {
    organization: string;
    project: string;
}

export const ReleasePipelinesComponent = ({organization, project} : ReleasePipelinesComponentProps) => (
    <div>
        <p>{organization}</p>
        <p>{project}</p>
    </div>
);