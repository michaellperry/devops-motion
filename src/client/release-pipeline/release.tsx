import { ListItem, ListItemText } from "@material-ui/core";
import { Release } from "@shared/model/release";
import React from "react";

export interface ReleaseComponentProps {
    release: Release,
    name: string
}

export const ReleaseComponent = ({ release, name }: ReleaseComponentProps) => (
    release.build ?
        <ListItem>
            <ListItemText primary={name} secondary={release.build.name} />
        </ListItem> :
        <></>
);