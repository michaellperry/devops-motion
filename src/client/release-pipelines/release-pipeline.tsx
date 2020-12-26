import * as React from "react";

export interface ReleasePipelineComponentProps {
    id: number;
}

export const ReleasePipelineComponent = ({id}: ReleasePipelineComponentProps) => (
    <div>
        <p>{id}</p>
    </div>
);