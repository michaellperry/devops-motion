import React from "react";

export interface TaskComponentProps {
    id: number
}

export const TaskComponent = ({ id }: TaskComponentProps) => (
    <p>{id}</p>
)