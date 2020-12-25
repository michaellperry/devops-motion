import * as React from "react";
import { Project } from "@shared/model/project";

export const App = () => {
    const [ project, setProject ] = React.useState<Project | null>(null);
    const [ error, setError ] = React.useState("");
    React.useEffect(() => {
        fetch("project.json")
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
            <p>{ project?.project }</p>
            <p>{ project?.organization?.organization }</p>
        </div>
    );
};