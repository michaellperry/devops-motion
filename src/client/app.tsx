import * as React from "react";
import { Project } from "@shared/model/project";
import { ReleasePipelinesContainer } from "./release-pipelines/container";

export const App = () => {
    const [ project, setProject ] = React.useState<Project | null>(null);
    const [ error, setError ] = React.useState("");
    React.useEffect(() => {
        fetch("api/project")
            .then(response => {
                if (!response.ok) {
                    throw new Error(response.statusText);
                }
                return response.json();
            })
            .then(value => {
                setProject(value as Project);
            })
            .catch(err => {
                setError(err.message);
            });
    }, []);

    return (
        <div>
            <p>Welcome to DevOps Motion.</p>
            <p>{ error }</p>
            <ReleasePipelinesContainer fact={project} />
        </div>
    );
};