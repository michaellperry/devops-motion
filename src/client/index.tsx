import { App } from "./app";
import * as React from "react";
import * as ReactDOM from "react-dom";

import "./styles/app";
import { ProcessContainer } from "./frame/process-container";

ReactDOM.render(
    <ProcessContainer>
        <App />
    </ProcessContainer>,
    document.getElementById("application-host")
);