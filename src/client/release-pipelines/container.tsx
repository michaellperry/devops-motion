import { Project } from "@shared/model/project";
import { ReleasePipeline } from "@shared/model/release-pipeline";
import { collection, field, jinagaContainer, mapProps, specificationFor } from "jinaga-react";
import * as React from "react";
import { j } from "../jinaga-config";
import { ReleasePipelineComponent } from "./release-pipeline";
import { ReleasePipelinesComponent } from "./release-pipelines";

const releasePipelineSpecification = specificationFor(ReleasePipeline, {
    id: field(rp => rp.id)
});

const releasePipelineMapping = mapProps(releasePipelineSpecification).to(({id}) => (
    <ReleasePipelineComponent id={id} />
))

const releasePipelinesSpecification = specificationFor(Project, {
    organization: field(p => p.organization.organization),
    project: field(p => p.project),
    ReleasePipelines: collection(j.for(ReleasePipeline.inProject), releasePipelineMapping)
});

const releasePipelinesMapping = mapProps(releasePipelinesSpecification).to(({
    organization,
    project,
    ReleasePipelines
}) => (
    <>
        <ReleasePipelinesComponent organization={organization} project={project} />
        <ReleasePipelines />
    </>
));

export const ReleasePipelinesContainer = jinagaContainer(j, releasePipelinesMapping);
