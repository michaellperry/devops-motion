import * as React from "react";
import { ErrorBar } from "./error-bar";

interface ErrorState {
    hasError: boolean;
    errorMessage: string;
}

const ErrorContext = React.createContext<(errorState: ErrorState) => void>(errorState => {});

export interface ErrorContainerProps {}

export const ErrorContainer = ({ children }: React.PropsWithChildren<ErrorContainerProps>) => {
    const [ errorState, setErrorState ] = React.useState<ErrorState>({
        hasError: false,
        errorMessage: ""
    });

    return (
        <ErrorContext.Provider value={setErrorState}>
            { children }
            <ErrorBar message={errorState.errorMessage} visible={errorState.hasError} />
        </ErrorContext.Provider>
    );
}

export function useErrorState(): [
    (message: string) => void,
    () => void
] {
    const setErrorState = React.useContext(ErrorContext);
    
    function setError(message: string) {
        setErrorState({
            errorMessage: message,
            hasError: true
        });
    }
    function clearError() {
        setErrorState({
            errorMessage: "",
            hasError: false
        });
    }

    return [ setError, clearError ];
}