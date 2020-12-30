import { Project } from "@shared/model/project";
import { ReleasePipeline } from "@shared/model/release-pipeline";
import React from "react";
import { useParams } from "react-router-dom";
import { ReleasePipelineContainer } from "./container";

export interface ReleasePipelinePageProps {
    project: Project | null
}

interface ReleasePipelinePageParams {
    releasePipelineId: string
}

export const ReleasePipelinePage = ({ project }: ReleasePipelinePageProps) => {
    const { releasePipelineId } = useParams<ReleasePipelinePageParams>();
    const id = parseInt(releasePipelineId);
    const releasePipelineFact = project == null ? null : new ReleasePipeline(project, id);

    return (
        <ReleasePipelineContainer fact={releasePipelineFact} />
    );
};