import { ListItem, ListItemText } from "@material-ui/core";
import { Release } from "@shared/model/release";
import React from "react";
import "./styles";

export interface ReleaseComponentProps {
    release: Release,
    name: string,
    Tasks: (props: {}) => JSX.Element,
    Stories: (props: {}) => JSX.Element
}

export const ReleaseComponent = ({ release, name, Tasks, Stories }: ReleaseComponentProps) => (
    release.build ?
        <ListItem>
            <ListItemText primary={name} secondary={release.build.name} />
            <div className="release-details-container">
                <div className="task-list"><Tasks /></div>
                <div className="story-list"><Stories /></div>
            </div>
        </ListItem> :
        <></>
);