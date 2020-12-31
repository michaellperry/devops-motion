import { Fade, LinearProgress, Snackbar } from "@material-ui/core";
import { Alert } from '@material-ui/lab';
import * as React from "react";

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

    const handleClose = () => {
        setStatus({
            ...status,
            hasError: false,
            errorMessage: ""
        });
    }

    return (
        <ProcessContext.Provider value={setStatus}>
            <Fade in={status.running}>
                <LinearProgress  />
            </Fade>
            { children }
            <Snackbar
                open={status.hasError}
                autoHideDuration={6000}
                onClose={handleClose}
            >
                <Alert severity="error" variant="filled">{status.errorMessage}</Alert>
            </Snackbar>
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