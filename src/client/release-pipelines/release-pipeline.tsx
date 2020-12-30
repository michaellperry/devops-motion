import { ListItem, ListItemText } from "@material-ui/core";
import * as React from "react";
import { Link } from "react-router-dom";

export interface ReleasePipelineComponentProps {
    id: number;
    name: string;
}

export const ReleasePipelineComponent = ({id, name}: ReleasePipelineComponentProps) => {
    const ReleasePipelineLink = React.useMemo(
        () => React.forwardRef((linkProps, ref: any) => (
            <Link ref={ref} to={`/release-pipelines/${id}/`} {...linkProps} />
        )),
        [id]
    );

    return (
        <ListItem button component={ReleasePipelineLink}>
            <ListItemText primary={name} />
        </ListItem>
    );
};