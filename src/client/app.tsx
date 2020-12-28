import * as React from "react";
import { Project } from "@shared/model/project";
import { ReleasePipelinesContainer } from "./release-pipelines/container";
import { ErrorBar } from "./frame/error-bar";
import { useErrorState } from "./frame/error-container";

export const App = () => {
    const [ project, setProject ] = React.useState<Project | null>(null);
    const [ setError ] = useErrorState();

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
            <ReleasePipelinesContainer fact={project} />
        </div>
    );
};