import { Button } from "@material-ui/core";
import { Release } from "@shared/model/release";
import { ReleasePipeline } from "@shared/model/release-pipeline";
import { field, hashSet, structureFor } from "@shared/structure/structure";
import React from "react";
import { Link } from "react-router-dom";
import { useProcess } from "../frame/process-container";
import { j } from "../jinaga-config";

export interface ReleasePipelineComponentProps {
    releasePipeline: ReleasePipeline
    name: string
}

export const ReleasePipelineComponent = ({ name, releasePipeline }: ReleasePipelineComponentProps) => {
    const runProcess = useProcess();

    return (
        <>
            <Link to="/">Home</Link>
            <h1>{name}</h1>
            <Button
                color="primary"
                variant="contained"
                onClick={() => runProcess(() => refreshReleasePipeline(releasePipeline))}>
                    Refresh
            </Button>
        </>
    );
};

async function refreshReleasePipeline(releasePipeline: ReleasePipeline) {
    await fetch(`/api/project/release-pipelines/${releasePipeline.id}/releases`, {
        method: "POST"
    });
    await queryForReleases(releasePipeline);
}

async function queryForReleases(releasePipeline: ReleasePipeline) {
    const releasePipelineStructure = structureFor(ReleasePipeline, {
        releases: hashSet(j.for(Release.inPipeline), {
            release: field(r => r)
        })
    });
    await releasePipelineStructure.query(j, releasePipeline);
}