import React from "react";
import { Link } from "react-router-dom";

export interface ReleasePipelineComponentProps {
    name: string
}

export const ReleasePipelineComponent = ({ name }: ReleasePipelineComponentProps) => (
    <>
        <Link to="/">Home</Link>
        <h1>{name}</h1>
    </>
);