import { Project } from "@shared/model/project";
import * as React from "react";
import { useProcess } from "./frame/process-container";
import { ReleasePipelinesContainer } from "./release-pipelines/container";

export const App = () => {
    const [ project, setProject ] = React.useState<Project | null>(null);
    const runProcess = useProcess();

    React.useEffect(() => {
        runProcess(async () => {
            const response = await fetch("api/project");
            if (!response.ok) {
                throw new Error(response.statusText);
            }
            const value = await response.json();
            setProject(value as Project);
        });
    }, []);

    return (
        <div>
            <p>Welcome to DevOps Motion.</p>
            <ReleasePipelinesContainer fact={project} />
        </div>
    );
};