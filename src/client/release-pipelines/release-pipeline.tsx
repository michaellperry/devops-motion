import { ListItem, ListItemText } from "@material-ui/core";
import * as React from "react";

export interface ReleasePipelineComponentProps {
    id: number;
    name: string;
}

export const ReleasePipelineComponent = ({id, name}: ReleasePipelineComponentProps) => (
    <ListItem button>
        <ListItemText primary={name} />
    </ListItem>
);