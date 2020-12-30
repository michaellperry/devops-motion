import { ListItem, ListItemText } from "@material-ui/core";
import React from "react";

export interface ReleaseComponentProps {
    name: string
}

export const ReleaseComponent = ({ name }: ReleaseComponentProps) => (
    <ListItem>
        <ListItemText primary={name} />
    </ListItem>
);