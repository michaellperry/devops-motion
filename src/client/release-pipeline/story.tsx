import React from "react";

export interface StoryComponentProps {
    id: number
}

export const StoryComponent = ({ id }: StoryComponentProps) => (
    <p>{id}</p>
);