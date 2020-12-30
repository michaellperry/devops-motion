import { Project } from "@shared/model/project";
import * as React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { useProcess } from "./frame/process-container";
import { ReleasePipelinePage } from "./release-pipeline/page";
import { ReleasePipelinesContainer } from "./release-pipelines/container";

export const App = () => {
    const [ project, setProject ] = React.useState<Project | null>(null);
    const runProcess = useProcess();

    React.useEffect(() => {
        runProcess(async () => {
            const response = await fetch("/api/project");
            if (!response.ok) {
                throw new Error(response.statusText);
            }
            const value = await response.json();
            setProject(value as Project);
        });
    }, []);

    return (
        <Router>
            <Switch>
                <Route path="/release-pipelines/:releasePipelineId/">
                    <ReleasePipelinePage project={project} />
                </Route>
                <Route path="/">
                    <ReleasePipelinesContainer fact={project} />
                </Route>
            </Switch>
        </Router>
    );
};