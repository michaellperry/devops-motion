import { App } from "./app";
import * as React from "react";
import * as ReactDOM from "react-dom";

import "./styles/app";
import { ErrorContainer } from "./frame/error-container";

ReactDOM.render(
    <ErrorContainer>
        <App />
    </ErrorContainer>,
    document.getElementById("application-host")
);