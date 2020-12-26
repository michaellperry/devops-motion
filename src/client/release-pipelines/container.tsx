import { Project } from "@shared/model/project";
import { field, jinagaContainer, mapProps, specificationFor } from "jinaga-react";
import * as React from "react";
import { j } from "../jinaga-config";
import { ReleasePipelinesComponent } from "./release-pipelines";

const releasePipelinesSpecification = specificationFor(Project, {
    organization: field(p => p.organization.organization),
    project: field(p => p.project)
});

const releasePipelinesMapping = mapProps(releasePipelinesSpecification).to(({organization, project}) => (
    <ReleasePipelinesComponent organization={organization} project={project} />
));

export const ReleasePipelinesContainer = jinagaContainer(j, releasePipelinesMapping);
