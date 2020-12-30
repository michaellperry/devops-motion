import { Fade, LinearProgress } from "@material-ui/core";
import * as React from "react";
import { ErrorBar } from "./error-bar";

interface ProcessState {
    running: boolean;
    hasError: boolean;
    errorMessage: string;
}

const ProcessContext = React.createContext<(errorState: ProcessState) => void>(processState => {});

export interface ProcessContainerProps {}

export const ProcessContainer = ({ children }: React.PropsWithChildren<ProcessContainerProps>) => {
    const [ status, setStatus ] = React.useState<ProcessState>({
        running: false,
        hasError: false,
        errorMessage: ""
    });

    return (
        <ProcessContext.Provider value={setStatus}>
            <Fade in={status.running}>
                <LinearProgress  />
            </Fade>
            { children }
            <ErrorBar message={status.errorMessage} visible={status.hasError} />
        </ProcessContext.Provider>
    );
}

export function useProcess(): (process: () => Promise<void>) => void {
    const setProcessState = React.useContext(ProcessContext);

    function run(process: () => Promise<void>) {
        setProcessState({
            running: true,
            hasError: false,
            errorMessage: ""
        });
        process()
            .then(() => {
                setProcessState({
                    running: false,
                    hasError: false,
                    errorMessage: ""
                });
            })
            .catch(err => {
                setProcessState({
                    running: false,
                    hasError: true,
                    errorMessage: err.message
                });
            });
    }

    return run;
}