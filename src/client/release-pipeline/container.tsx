import { List } from "@material-ui/core";
import { BuildStory, BuildTask } from "@shared/model/build";
import { Release } from "@shared/model/release";
import { ReleasePipeline, ReleasePipelineName } from "@shared/model/release-pipeline";
import { collection, descending, field, jinagaContainer, mapProps, property, specificationFor } from "jinaga-react";
import React from "react";
import { j } from "../jinaga-config";
import { ReleaseComponent } from "./release";
import { ReleasePipelineComponent } from "./release-pipeline";
import { StoryComponent } from "./story";
import { TaskComponent } from "./task";

const taskSpecification = specificationFor(BuildTask, {
    id: field(bt => bt.task.id)
});

const taskMapping = mapProps(taskSpecification).to(({ id }) => (
    <TaskComponent id={id} />
));

const storySpecification = specificationFor(BuildStory, {
    id: field(bs => bs.story.id)
});

const storyMapping = mapProps(storySpecification).to(({ id }) => (
    <StoryComponent id={id} />
));

const releaseSpecification = specificationFor(Release, {
    release: field(r => r),
    name: field(r => r.name),
    Tasks: collection(j.for(Release.build).then(BuildTask.inBuild), taskMapping),
    Stories: collection(j.for(Release.build).then(BuildStory.inBuild), storyMapping)
});

const releaseMapping = mapProps(releaseSpecification).to(({ release, name, Tasks, Stories }) => (
    <ReleaseComponent release={release} name={name} Tasks={Tasks} Stories={Stories} />
));

const releasePipelineSpecification = specificationFor(ReleasePipeline, {
    releasePipeline: field(rp => rp),
    name: property(j.for(ReleasePipelineName.ofReleasePipeline), n => n.value, ""),
    Releases: collection(j.for(Release.inPipeline), releaseMapping, descending(r => r.createdOn))
});

const releasePipelineMapping = mapProps(releasePipelineSpecification).to(({releasePipeline, name, Releases}) => (
    <>
        <ReleasePipelineComponent name={name} releasePipeline={releasePipeline} />
        <List>
            <Releases />
        </List>
    </>
));

export const ReleasePipelineContainer = jinagaContainer(j, releasePipelineMapping);