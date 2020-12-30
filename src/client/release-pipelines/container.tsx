import { Project } from "@shared/model/project";
import { ReleasePipeline, ReleasePipelineName } from "@shared/model/release-pipeline";
import { ascending, collection, field, jinagaContainer, mapProps, property, specificationFor } from "jinaga-react";
import * as React from "react";
import { j } from "../jinaga-config";
import { ReleasePipelineComponent } from "./release-pipeline";
import { ReleasePipelinesComponent } from "./release-pipelines";
import List from '@material-ui/core/List';

const releasePipelineSpecification = specificationFor(ReleasePipeline, {
    id: field(rp => rp.id),
    name: property(j.for(ReleasePipelineName.ofReleasePipeline), rpn => rpn.value, "")
});

const releasePipelineMapping = mapProps(releasePipelineSpecification).to(({id, name}) => (
    <ReleasePipelineComponent id={id} name={name} />
))

const releasePipelinesSpecification = specificationFor(Project, {
    project: field(p => p),
    ReleasePipelines: collection(
        j.for(ReleasePipeline.inProject),
        releasePipelineMapping,
        ascending(j.for(ReleasePipelineName.ofReleasePipeline), rpn => rpn.value.toLowerCase(), "")
    )
});

const releasePipelinesMapping = mapProps(releasePipelinesSpecification).to(({
    project,
    ReleasePipelines
}) => (
    <>
        <ReleasePipelinesComponent  project={project} />
        <List>
            <ReleasePipelines />
        </List>
    </>
));

export const ReleasePipelinesContainer = jinagaContainer(j, releasePipelinesMapping);
