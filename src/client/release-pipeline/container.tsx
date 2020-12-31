import { List } from "@material-ui/core";
import { Release } from "@shared/model/release";
import { ReleasePipeline, ReleasePipelineName } from "@shared/model/release-pipeline";
import { collection, descending, field, jinagaContainer, mapProps, property, specificationFor } from "jinaga-react";
import React from "react";
import { j } from "../jinaga-config";
import { ReleaseComponent } from "./release";
import { ReleasePipelineComponent } from "./release-pipeline";

const releaseSpecification = specificationFor(Release, {
    release: field(r => r),
    name: field(r => r.name)
})

const releaseMapping = mapProps(releaseSpecification).to(({ release, name }) => (
    <ReleaseComponent release={release} name={name} />
));

const releasePipelineSpecification = specificationFor(ReleasePipeline, {
    releasePipeline: field(rp => rp),
    name: property(j.for(ReleasePipelineName.ofReleasePipeline), n => n.value, ""),
    Releases: collection(j.for(Release.inPipeline), releaseMapping, descending(r => r.createdOn))
})

const releasePipelineMapping = mapProps(releasePipelineSpecification).to(({releasePipeline, name, Releases}) => (
    <>
        <ReleasePipelineComponent name={name} releasePipeline={releasePipeline} />
        <List>
            <Releases />
        </List>
    </>
));

export const ReleasePipelineContainer = jinagaContainer(j, releasePipelineMapping);