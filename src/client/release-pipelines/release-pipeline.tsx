import * as React from "react";

export interface ReleasePipelineComponentProps {
    id: number;
    name: string;
}

export const ReleasePipelineComponent = ({id, name}: ReleasePipelineComponentProps) => (
    <div>
        <p>{id}: {name}</p>
    </div>
);