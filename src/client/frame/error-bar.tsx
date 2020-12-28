import * as React from "react";

import "./styles";

export interface ErrorBarProps {
    message: string;
    visible: boolean;
}

export const ErrorBar = ({ message, visible }: ErrorBarProps) => (
    <div className={`error-bar ${visible ? "error-visible" : ""}`}>{message}</div>
);