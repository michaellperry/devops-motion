import { List } from "@material-ui/core";
import { Release } from "@shared/model/release";
import { ReleasePipeline, ReleasePipelineName } from "@shared/model/release-pipeline";
import { collection, descending, field, jinagaContainer, mapProps, property, specificationFor } from "jinaga-react";
import React from "react";
import { j } from "../jinaga-config";
import { ReleaseComponent } from "./release";
import { ReleasePipelineComponent } from "./release-pipeline";

const releaseSpecification = specificationFor(Release, {
    name: field(r => r.name)
})

const releaseMapping = mapProps(releaseSpecification).to(({ name }) => (
    <ReleaseComponent name={name} />
));

const releasePipelineSpecification = specificationFor(ReleasePipeline, {
    name: property(j.for(ReleasePipelineName.ofReleasePipeline), n => n.value, ""),
    Releases: collection(j.for(Release.inPipeline), releaseMapping, descending(r => r.createdOn))
})

const releasePipelineMapping = mapProps(releasePipelineSpecification).to(({name, Releases}) => (
    <>
        <ReleasePipelineComponent name={name} />
        <List>
            <Releases />
        </List>
    </>
));

export const ReleasePipelineContainer = jinagaContainer(j, releasePipelineMapping);