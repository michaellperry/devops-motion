import { Project } from "@shared/model/project";
import { ReleasePipeline, ReleasePipelineName } from "@shared/model/release-pipeline";
import { collection, field, jinagaContainer, mapProps, property, specificationFor } from "jinaga-react";
import * as React from "react";
import { j } from "../jinaga-config";
import { ReleasePipelineComponent } from "./release-pipeline";
import { ReleasePipelinesComponent } from "./release-pipelines";

const releasePipelineSpecification = specificationFor(ReleasePipeline, {
    id: field(rp => rp.id),
    name: property(j.for(ReleasePipelineName.ofReleasePipeline), rpn => rpn.value, "")
});

const releasePipelineMapping = mapProps(releasePipelineSpecification).to(({id, name}) => (
    <ReleasePipelineComponent id={id} name={name} />
))

const releasePipelinesSpecification = specificationFor(Project, {
    project: field(p => p),
    ReleasePipelines: collection(j.for(ReleasePipeline.inProject), releasePipelineMapping)
});

const releasePipelinesMapping = mapProps(releasePipelinesSpecification).to(({
    project,
    ReleasePipelines
}) => (
    <>
        <ReleasePipelinesComponent  project={project} />
        <ReleasePipelines />
    </>
));

export const ReleasePipelinesContainer = jinagaContainer(j, releasePipelinesMapping);
