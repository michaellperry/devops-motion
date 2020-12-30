import { ListItem } from "@material-ui/core";
import React from "react";

export interface ReleasePipelineComponentProps {
    name: string
}

export const ReleasePipelineComponent = ({ name }: ReleasePipelineComponentProps) => (
    <h1>{name}</h1>
);